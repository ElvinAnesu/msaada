"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

export function Combobox({
  label,
  placeholder = "Search...",
  options,
  value = "",
  onChange,
  error,
  disabled,
  emptyMessage = "No results found",
}: ComboboxProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selected = options.find((opt) => opt.value === value);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (selected && !open) {
      setQuery(selected.label);
    }
    if (!value && !open) {
      setQuery("");
    }
  }, [selected, value, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        if (selected) {
          setQuery(selected.label);
        } else {
          setQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  function selectOption(opt: ComboboxOption) {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  }

  function handleInputChange(next: string) {
    setQuery(next);
    setOpen(true);
    if (selected && next !== selected.label) {
      onChange("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[highlightIndex]) {
      e.preventDefault();
      selectOption(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      if (selected) setQuery(selected.label);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            disabled && "cursor-not-allowed bg-slate-50 opacity-60"
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            setOpen((o) => !o);
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
          aria-label="Toggle options list"
        >
          <svg
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</li>
          ) : (
            filtered.map((opt, index) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm text-slate-900",
                  (value === opt.value || highlightIndex === index) &&
                    "bg-primary-light text-primary"
                )}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
