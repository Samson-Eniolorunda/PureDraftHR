"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Select — accessible custom dropdown (maps <option> children)      */
/*  - Supports <option> and <optgroup> children                       */
/*  - initial arrow faces up (closed)                                  */
/*  - click/tap toggles open/close                                     */
/*  - click outside or Escape closes                                   */
/*  - keyboard navigation: ArrowUp/ArrowDown/Enter/Escape              */
/* ------------------------------------------------------------------ */

interface ParsedOption {
  value: string;
  label: string;
  disabled: boolean;
  group?: string;
}

/** Recursively parse <option> and <optgroup> children into flat list */
function parseChildren(children: React.ReactNode): ParsedOption[] {
  const result: ParsedOption[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const el = child as React.ReactElement<any>;

    if (el.type === "optgroup") {
      const groupLabel = el.props.label ?? "";
      React.Children.forEach(
        el.props.children,
        (groupChild: React.ReactNode) => {
          if (!React.isValidElement(groupChild)) return;
          const opt = groupChild as React.ReactElement<any>;
          result.push({
            value: opt.props.value ?? String(opt.props.children ?? ""),
            label: String(opt.props.children ?? opt.props.value ?? ""),
            disabled: opt.props.disabled ?? false,
            group: groupLabel,
          });
        },
      );
    } else {
      result.push({
        value: el.props.value ?? String(el.props.children ?? ""),
        label: String(el.props.children ?? el.props.value ?? ""),
        disabled: el.props.disabled ?? false,
      });
    }
  });
  return result;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    { className, children, value, defaultValue, name, disabled, onChange, id },
    ref,
  ) => {
    // Parse children — supports both <option> and <optgroup>
    const options = parseChildren(children);

    const isControlled = value !== undefined;
    const initial = isControlled
      ? (value as string)
      : ((defaultValue as string) ?? options[0]?.value ?? "");
    const [selected, setSelected] = React.useState<string>(initial);
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const optionsRef = React.useRef<Array<HTMLDivElement | null>>([]);

    // Sync controlled value
    React.useEffect(() => {
      if (isControlled) setSelected(value as string);
    }, [value, isControlled]);

    // Close on outside click
    React.useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) setIsOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    // Keyboard handling on trigger
    const handleTriggerKey = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        requestAnimationFrame(() => optionsRef.current[0]?.focus());
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        requestAnimationFrame(() =>
          optionsRef.current[options.length - 1]?.focus(),
        );
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen((s) => !s);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const selectValue = (val: string) => {
      if (disabled) return;
      if (!isControlled) setSelected(val);
      setIsOpen(false);
      // Call onChange with a synthetic event similar enough for handlers
      onChange?.({
        target: { value: val, name },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
    };

    const selectedLabel =
      options.find((o) => o.value === selected)?.label ?? selected;

    return (
      <div
        ref={(el) => {
          containerRef.current = el;
          // forwardRef support
          if (typeof ref === "function") ref(el as any);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={cn("relative inline-block w-full", className)}
      >
        {/* Hidden native input for forms */}
        {name && <input type="hidden" name={name} value={selected} />}

        {/* Trigger */}
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen ? "true" : "false"}
          title={selectedLabel}
          disabled={disabled}
          onClick={() => setIsOpen((s) => !s)}
          onKeyDown={handleTriggerKey}
          className={cn(
            "w-full text-left rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm transition-all duration-150",
            "hover:border-primary/50 hover:shadow-sm",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            "font-medium text-foreground",
          )}
        >
          <span className="truncate">{selectedLabel}</span>

          {/* Arrow: initial closed -> arrow up (rotate-180); open -> arrow down (rotate-0) */}
          <svg
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen ? "rotate-0" : "rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Options panel */}
        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            title="Select an option"
            className="absolute left-0 right-0 mt-2 z-40 max-h-60 overflow-auto rounded-lg border border-input bg-card shadow-lg p-1"
            aria-activedescendant={selected}
          >
            {(() => {
              let lastGroup: string | undefined;
              let flatIdx = 0;
              return options.map((o, i) => {
                const showGroupHeader = o.group && o.group !== lastGroup;
                lastGroup = o.group;
                const idx = flatIdx++;
                return (
                  <React.Fragment key={`${o.group ?? ""}-${o.value}-${i}`}>
                    {showGroupHeader && (
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1 first:mt-0">
                        {o.group}
                      </div>
                    )}
                    <div
                      role="option"
                      aria-selected={o.value === selected ? "true" : "false"}
                      tabIndex={0}
                      ref={(el) => {
                        if (el) optionsRef.current[idx] = el;
                      }}
                      onClick={() => selectValue(o.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") selectValue(o.value);
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          optionsRef.current[
                            Math.min(idx + 1, options.length - 1)
                          ]?.focus();
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          optionsRef.current[Math.max(idx - 1, 0)]?.focus();
                        }
                        if (e.key === "Escape") setIsOpen(false);
                      }}
                      className={cn(
                        "px-3 py-2 rounded-md m-1 text-sm flex items-center justify-between",
                        o.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:bg-primary/10",
                        o.value === selected
                          ? "bg-primary/10 font-semibold"
                          : "",
                      )}
                    >
                      <span className="truncate">{o.label}</span>
                      {o.value === selected && (
                        <svg
                          className="h-4 w-4 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </React.Fragment>
                );
              });
            })()}
          </div>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
