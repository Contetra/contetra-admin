import { Image } from "@tiptap/extension-image"
import { mergeAttributes, ResizableNodeView } from "@tiptap/core"
import type { Editor } from "@tiptap/core"
import type { Node as ProseMirrorNode } from "@tiptap/pm/model"

export type ImageAlign = "left" | "center" | "right"

const ALIGN_STYLE_PROPS: Record<
  ImageAlign,
  { float: string; marginLeft: string; marginRight: string }
> = {
  left: { float: "left", marginLeft: "", marginRight: "1.5rem" },
  center: { float: "none", marginLeft: "auto", marginRight: "auto" },
  right: { float: "right", marginLeft: "1.5rem", marginRight: "" },
}

const NO_ALIGN_STYLE = { float: "none", marginLeft: "", marginRight: "" }

function alignToStyle(align: ImageAlign | null | undefined) {
  return align ? ALIGN_STYLE_PROPS[align] : NO_ALIGN_STYLE
}

function alignToCssText(align: ImageAlign | null | undefined) {
  const { float, marginLeft, marginRight } = alignToStyle(align)
  if (!align) return ""
  const declarations = [`float: ${float}`]
  if (marginLeft) declarations.push(`margin-left: ${marginLeft}`)
  if (marginRight) declarations.push(`margin-right: ${marginRight}`)
  return `${declarations.join("; ")};`
}

function applyImageContent(el: HTMLImageElement, attrs: Record<string, unknown>) {
  if (typeof attrs.src === "string") el.src = attrs.src
  if (typeof attrs.alt === "string") el.alt = attrs.alt
  else el.removeAttribute("alt")
  if (typeof attrs.title === "string") el.title = attrs.title
  else el.removeAttribute("title")
}

// Applied to whichever element is actually laid out in the surrounding
// editor flow. For the resize NodeView that's the outer container div, not
// the <img> itself — the resize wrapper is a flex item shrink-wrapped to
// the image, so floating/margin-auto-ing the <img> inside it has no room to
// move. `isContainer` additionally shrinks that container to its content
// for centering, since (unlike a floated box) a flex container otherwise
// defaults to filling the available width.
function applyAlignStyle(
  target: HTMLElement,
  align: ImageAlign | null | undefined,
  isContainer: boolean
) {
  const style = alignToStyle(align)
  target.style.float = style.float
  target.style.marginLeft = style.marginLeft
  target.style.marginRight = style.marginRight
  if (isContainer) {
    target.style.width = align === "center" ? "fit-content" : ""
  }
}

// Only removes the node from the document. The underlying Bunny CDN file is
// intentionally left alone here — it's cleaned up server-side when the post
// is saved (see PostsService.updateBlog's old/new content diff), so removal
// stays correct even if the user undoes this or never saves at all.
function createDeleteButton(
  editor: Editor,
  getPos: () => number | undefined
): HTMLButtonElement {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "tiptap-image-delete-btn"
  button.contentEditable = "false"
  button.setAttribute("aria-label", "Remove image")
  button.textContent = "×"

  button.addEventListener("mousedown", (event) => {
    event.preventDefault()
    event.stopPropagation()
  })

  button.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()

    const pos = getPos()
    if (pos !== undefined) {
      editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run()
    }
  })

  return button
}

// Adds a persisted `align` attribute and takes over the resize NodeView so
// alignment renders live in the editor too (not just in the saved HTML) —
// rendered as plain inline float/margin CSS so it displays correctly
// anywhere the saved blog HTML ends up (public site included).
export const ImageWithControls = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const style = element.getAttribute("style") ?? ""
          if (style.includes("margin-left: auto") || style.includes("margin-left:auto")) {
            return "center"
          }
          if (style.includes("float: left") || style.includes("float:left")) return "left"
          if (style.includes("float: right") || style.includes("float:right")) return "right"
          return null
        },
        renderHTML: () => ({}),
      },
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    const style = alignToCssText(node.attrs.align as ImageAlign | null)

    return [
      "img",
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        style ? { style } : {}
      ),
    ]
  },

  addNodeView() {
    if (typeof document === "undefined") return null

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement("img")
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null && key !== "width" && key !== "height") {
          el.setAttribute(key, String(value))
        }
      })
      applyImageContent(el, node.attrs)

      const resizeOptions = this.options.resize
      if (resizeOptions === false || !resizeOptions.enabled) {
        applyAlignStyle(el, node.attrs.align as ImageAlign | null, false)
        return {
          dom: el,
          update: (updatedNode: ProseMirrorNode) => {
            if (updatedNode.type !== node.type) return false
            applyImageContent(el, updatedNode.attrs)
            applyAlignStyle(el, updatedNode.attrs.align as ImageAlign | null, false)
            return true
          },
        }
      }

      const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } =
        resizeOptions

      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`
          el.style.height = `${height}px`
        },
        onCommit: (width, height) => {
          const pos = getPos()
          if (pos === undefined) return
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, { width, height })
            .run()
        },
        onUpdate: (updatedNode: ProseMirrorNode) => {
          if (updatedNode.type !== node.type) return false
          applyImageContent(el, updatedNode.attrs)
          applyAlignStyle(
            nodeView.dom as HTMLElement,
            updatedNode.attrs.align as ImageAlign | null,
            true
          )
          if (updatedNode.attrs.width == null) el.style.width = ""
          if (updatedNode.attrs.height == null) el.style.height = ""
          return true
        },
        options: {
          directions,
          min: { width: minWidth, height: minHeight },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      })

      const dom = nodeView.dom as HTMLElement
      applyAlignStyle(dom, node.attrs.align as ImageAlign | null, true)
      dom.style.visibility = "hidden"
      dom.style.pointerEvents = "none"
      el.onload = () => {
        dom.style.visibility = ""
        dom.style.pointerEvents = ""
      }

      nodeView.wrapper.appendChild(createDeleteButton(editor, getPos))

      return nodeView
    }
  },
})
