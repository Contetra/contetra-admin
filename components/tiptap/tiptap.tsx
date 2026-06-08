'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Button } from '../ui/button'

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 border-b p-2">
      <Button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </Button>
      <Button onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italic
      </Button>
      <Button onClick={() => editor.chain().focus().toggleUnderline().run()}>
        Underline
      </Button>
      <Button onClick={() => editor.chain().focus().toggleStrike().run()}>
        Strike
      </Button>

      <Button onClick={() => editor.chain().focus().setParagraph().run()}>
        P
      </Button>
      <Button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Button>

      <Button onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        Left
      </Button>
      <Button onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        Center
      </Button>
      <Button onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        Right
      </Button>

      <Button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </Button>
      <Button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </Button>

      <Button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        Table
      </Button>

      <Button onClick={() => editor.chain().focus().undo().run()}>
        Undo
      </Button>
      <Button onClick={() => editor.chain().focus().redo().run()}>
        Redo
      </Button>
    </div>
  )
}

const RichEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<p>Hello World!</p>',
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="rounded-md border">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-50 p-3"
      />
    </div>
  )
}

export default RichEditor
