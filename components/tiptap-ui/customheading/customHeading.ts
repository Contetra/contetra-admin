import { Node, mergeAttributes } from "@tiptap/core";
import { CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customHeading: {
      insertCustomHeading: () => ReturnType;
    };
    customHeadingH2: {
      insertCustomHeadingH2: () => ReturnType;
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

export const CustomHeadingH2 = Node.create({
  name: "customHeadingH2",

  group: "block",

  content: "inline*",

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
        tag: "h2.custom-box",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["h2", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertCustomHeadingH2:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: "Custom Heading Content",
              },
            ],
          });
        },
    };
  },
});
