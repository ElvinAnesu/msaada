import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            error && "border-red-500",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
