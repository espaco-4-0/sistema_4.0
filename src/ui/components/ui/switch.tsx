"use client";

import * as React from "react";

import { cn } from "@/src/ui/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, defaultChecked, onCheckedChange, disabled, ...props }, ref) => {
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const currentChecked = isControlled ? checked : internalChecked;

    const handleToggle = () => {
      if (disabled) {
        return;
      }
      const next = !currentChecked;
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={currentChecked}
        data-state={currentChecked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full border transition-colors",
          currentChecked ? "bg-blue-600 border-blue-600" : "bg-gray-200 border-gray-200",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            currentChecked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";
