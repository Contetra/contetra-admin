import { Node, mergeAttributes } from "@tiptap/core";
import { CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customHeading: {
      insertCustomHeading: () => ReturnType;
    };
  }
}

export const CustomHeading = Node.create({
  name: "customHeading",

  group: "block",

  content: "block*",

  defining: true,

  addAttributes() {
    return {
      class: {
        default: "custom-box",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.custom-box",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertCustomHeading:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Custom Heading Content",
                  },
                ],
              },
            ],
          });
        },
    };
  },
});
