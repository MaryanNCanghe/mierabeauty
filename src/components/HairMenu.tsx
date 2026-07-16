"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/categories";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="6" viewBox="0 0 10 6" fill="none"
      className={`transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function HairMenu({ categories, light = false }: { categories: Category[]; light?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hair = categories.find((c) => c.slug === "hair" && !c.parent_id);
  const hairSubcategories = categories.filter((c) => c.parent_id === hair?.id);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 hover:text-[var(--m-gold)] transition-colors duration-200 ${light ? "text-white" : "text-[var(--m-black)]"}`}
      >
        Shop
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute top-8 left-0 min-w-[220px] p-4 rounded-md bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] z-20 flex flex-col gap-2">
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="m-label text-[var(--m-gold)] pb-2 border-b border-[var(--m-black)]/10 hover:underline"
          >
            All Hair
          </Link>
          {hairSubcategories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?cat=${c.slug}`}
              onClick={() => setOpen(false)}
              className="m-title-sm text-[var(--m-black)] hover:text-[var(--m-gold)] transition-colors"
            >
              {c.name ?? c.slug}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
