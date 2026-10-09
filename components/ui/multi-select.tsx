"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type MultiSelectOption = {
  value: string;
  label: string;
  group?: string;
};

const chipLabel = (option: MultiSelectOption) =>
  option.group ? `${option.group} - ${option.label}` : option.label;

type MultiSelectProps = {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  showSelectAll?: boolean;
  disabled?: boolean;
  className?: string;
  listClassName?: string;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  showSelectAll = false,
  disabled,
  className,
  listClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const remove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  const allSelected = options.length > 0 && selected.length === options.length;
  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((o) => o.value));
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  const groups = React.useMemo(() => {
    const map = new Map<string, MultiSelectOption[]>();
    for (const option of options) {
      const key = option.group ?? "";
      const list = map.get(key) ?? [];
      list.push(option);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [options]);

  return (
    <div className="space-y-1.5">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {showSelectAll && allSelected ? (
            <span className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs">
              All selected
              <button
                type="button"
                onClick={() => onChange([])}
                disabled={disabled}
                aria-label="Clear all"
                className="rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:pointer-events-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs"
              >
                {chipLabel(option)}
                <button
                  type="button"
                  onClick={() => remove(option.value)}
                  disabled={disabled}
                  aria-label={`Remove ${chipLabel(option)}`}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:pointer-events-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              selected.length === 0 && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate text-left">
              {selected.length === 0 ? placeholder : `${selected.length} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className={listClassName}>
              <CommandEmpty>No results found.</CommandEmpty>
              {showSelectAll && options.length > 0 && (
                <>
                  <CommandGroup>
                    <CommandItem value="__select_all__" onSelect={toggleAll}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          allSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {allSelected ? "Deselect all" : "Select all"}
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              {groups.map(([group, groupOptions]) => (
                <CommandGroup key={group || "_"} heading={group || undefined}>
                  {groupOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={`${option.group ?? ""} ${option.label}`}
                      onSelect={() => toggle(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
