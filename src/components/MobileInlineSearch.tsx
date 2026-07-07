
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  placeholder?: string;
  iconSrc?: string; // defaults to "/search.png"
  iconSize?: number; // defaults to 16
};

export default function MobileInlineSearch({
  placeholder = "Search",
  iconSrc = "/search.png",
  iconSize = 16, // keep it same size as your other icons
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Focus the input when we open
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        // Only close if empty; if not empty, you can keep it open
        if (!value.trim()) setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open, value]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (q) {
      router.push(`/list?name=${encodeURIComponent(q)}`);
    }
    // Close after searching
    setOpen(false);
    setValue("");
  };

  // Close when input loses focus and there is no text
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    // If the next focus is on the submit button, don't close
    if (next?.dataset?.role === "search-submit") return;
    if (!value.trim()) setOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="w-full flex items-center justify-center"
    >
      {/* Collapsed: icon in the center (transparent background, no border) */}
      {!open && (
        <button
          type="button"
          aria-label="Open search"
          onClick={() => setOpen(true)}
          className="
            inline-flex items-center justify-center
            bg-transparent
            p-2
          "
        >
          <img src={iconSrc} alt="" width={iconSize} height={iconSize} />
        </button>
      )}

      {/* Expanded: inline, transparent background, underline style */}
      {open && (
        <form
          onSubmit={onSubmit}
          className="
            flex items-center gap-2
            bg-transparent
            w-full max-w-[200px]
          "
        >
          {/* Input with underline only */}
          <input
            ref={inputRef}
            type="text"
            name="name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onInputBlur}
            placeholder={placeholder}
            className="
              flex-1 bg-transparent outline-none
              border-b border-black
              text-sm
              pb-1
            "
          />
          {/* Submit button: transparent, small icon */}
          <button
            type="submit"
            aria-label="Search"
            data-role="search-submit"
            className="bg-transparent p-1"
          >
            <img src={iconSrc} alt="" width={iconSize} height={iconSize} />
          </button>
        </form>
      )}
    </div>
  );
}
