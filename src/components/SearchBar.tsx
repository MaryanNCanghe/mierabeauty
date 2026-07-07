"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onClose?: () => void;
};

const SearchBar = ({ onClose }: Props) => {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when the bar appears
  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = (new FormData(e.currentTarget).get("name") as string)?.trim();
    if (name) router.push(`/list?name=${encodeURIComponent(name)}`);
    onClose?.();
  };

  return (
    <form
      aria-label="Search products"
      onSubmit={handleSearch}
      className="flex items-center gap-6 w-full max-w-2xl mx-auto"
    >
      <input
        ref={inputRef}
        type="text"
        name="name"
        placeholder="Search for a product…"
        className="
          flex-1 bg-transparent
          border-b border-[var(--m-black)]/20
          focus:border-[var(--m-gold)]
          outline-none py-1.5
          text-sm font-light text-[var(--m-black)]
          placeholder-[var(--m-subtle)]
          transition-colors duration-300
        "
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="m-label text-[var(--m-muted)] hover:text-[var(--m-gold)] transition-colors tracking-widest flex-shrink-0"
      >
        SEARCH
      </button>
    </form>
  );
};

export default SearchBar;
