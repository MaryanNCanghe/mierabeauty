"use client";

import { useState } from "react";
import { Suspense } from "react";
import Filter from "./Filter";

type Category = { id: number; slug: string; name: string | null };

export default function ShopLayout({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      {/* ── Page header ── */}
      <div className="mb-10 border-b border-[var(--m-black)]/10 pb-6 flex items-end justify-between">
        <div>
          <span className="m-label text-[var(--m-gold)]">Collection</span>
          <h1 className="font-display text-4xl md:text-5xl font-light mt-2 text-[var(--m-black)]">
            All Products
          </h1>
        </div>

        {/* Filter toggle — all screen sizes */}
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen}
          aria-label={filterOpen ? "Close filters" : "Open filters"}
          className="flex items-center gap-2 m-btn m-btn--secondary"
        >
          {filterOpen ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              CLOSE
            </>
          ) : (
            <>
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
                <line x1="0" y1="1"   x2="15" y2="1"   stroke="currentColor" strokeWidth="1.2" />
                <line x1="3" y1="5.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="6" y1="10"  x2="15" y2="10"  stroke="currentColor" strokeWidth="1.2" />
              </svg>
              FILTER
            </>
          )}
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-0 lg:gap-12 items-start">
        <Suspense fallback={null}>
          <Filter
            categories={categories}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />
        </Suspense>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </>
  );
}
