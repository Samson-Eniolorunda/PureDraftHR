import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /**
   * Callback when the checkbox state changes
   */
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, onCheckedChange, onChange, checked, defaultChecked, ...props },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked ?? false,
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked);
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          className="sr-only peer"
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "h-5 w-5 shrink-0 rounded border-2 border-primary/40 bg-background transition-all duration-150",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            isChecked && "bg-primary border-primary",
            className,
          )}
        >
          {isChecked && (
            <svg
              className="h-full w-full text-primary-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
