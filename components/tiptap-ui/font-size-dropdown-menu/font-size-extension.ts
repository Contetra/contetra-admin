import { Mark, type CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Mark.create({
  name: "fontSize",

  inclusive: true,

  addAttributes() {
    return {
      fontSize: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[style*='font-size']",
        getAttrs: (element) => ({
          fontSize: (element as HTMLElement).style.fontSize,
        }),
      },
    ];
  },

  renderHTML({ mark }) {
    return [
      "span",
      {
        style: `font-size: ${mark.attrs.fontSize}`,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ commands }: CommandProps) =>
          commands.setMark(this.name, { fontSize }),
      unsetFontSize:
        () =>
        ({ commands }: CommandProps) =>
          commands.unsetMark(this.name),
    };
  },
});
