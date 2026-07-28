"use client";

import { FormEvent, useRef, useState } from "react";

import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import {
  Button,
  ButtonGroup,
} from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";

const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px",
];

export function FontSizeDropdownMenu({ portal = false }: { portal?: boolean }) {
  const { editor } = useTiptapEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [customSize, setCustomSize] = useState("");
  const savedSelection = useRef<{ from: number; to: number } | null>(null);

  if (!editor) return null;

  const currentSize =
    (editor.getAttributes("fontSize").fontSize as string | undefined) ??
    "Size";

  const handleOpenChange = (open: boolean) => {
    if (open) {
      const { from, to } = editor.state.selection;
      savedSelection.current = { from, to };
    }

    setIsOpen(open);
  };

  const applyFontSize = (fontSize?: string) => {
    let chain = editor.chain().focus();

    if (savedSelection.current) {
      chain = chain.setTextSelection(savedSelection.current);
    }

    if (fontSize) {
      chain.setFontSize(fontSize).run();
    } else {
      chain.unsetFontSize().run();
    }

    setIsOpen(false);
  };

  const applyCustomSize = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericSize = Number(customSize);
    if (!Number.isFinite(numericSize) || numericSize < 8 || numericSize > 200) {
      return;
    }

    applyFontSize(`${numericSize}px`);
    setCustomSize("");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          className="font-size-menu-trigger"
          aria-label="Change text size"
          tooltip="Text size"
        >
          <span className="tiptap-button-text">{currentSize}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        portal={portal}
        className="font-size-dropdown-content"
      >
        <Card>
          <CardBody>
            <ButtonGroup>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  showTooltip={false}
                  onClick={() => applyFontSize()}
                >
                  <span className="tiptap-button-text">Default</span>
                </Button>
              </DropdownMenuItem>

              {FONT_SIZES.map((fontSize) => (
                <DropdownMenuItem key={fontSize} asChild>
                  <Button
                    type="button"
                    showTooltip={false}
                    data-active-state={
                      currentSize === fontSize ? "on" : "off"
                    }
                    onClick={() => applyFontSize(fontSize)}
                  >
                    <span className="tiptap-button-text">{fontSize}</span>
                  </Button>
                </DropdownMenuItem>
              ))}
            </ButtonGroup>

            <form
              className="font-size-custom-form"
              onSubmit={applyCustomSize}
            >
              <label htmlFor="custom-font-size">Custom size</label>
              <div className="font-size-custom-row">
                <input
                  id="custom-font-size"
                  type="number"
                  min="8"
                  max="200"
                  step="1"
                  value={customSize}
                  onChange={(event) => setCustomSize(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder="e.g. 26"
                />
                <span>px</span>
                <button type="submit" disabled={!customSize}>
                  Apply
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
