import * as React from "react";
import clsx from "clsx";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "rounded-md border px-3 py-2 text-sm outline-none transition-colors",
            "focus:border-slate-900 focus:ring-1 focus:ring-slate-900",
            error ? "border-red-400" : "border-slate-300",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);
Select.displayName = "Select";
