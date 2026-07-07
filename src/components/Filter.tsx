"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Category } from "@/lib/categories";
import { buildCategoryTree } from "@/lib/categories";

type Props = {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
};

const SORT_OPTIONS = [
  { label: "Newest",             value: "asc created_at" },
  { label: "Price: Low to High", value: "asc price" },
  { label: "Price: High to Low", value: "desc price" },
  { label: "Name A–Z",           value: "asc name" },
];

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

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--m-black)]/10 py-5">
      <button
        type="button"
        className="w-full flex items-center justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="m-label text-[var(--m-black)] tracking-widest">{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function FilterDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 transition-colors ${
        active ? "bg-[var(--m-gold)]" : "border border-[var(--m-subtle)]"
      }`}
    />
  );
}

export default function Filter({ categories, isOpen, onClose }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [cat,  setCat]  = useState(searchParams.get("cat")  ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "");
  const [min,  setMin]  = useState(searchParams.get("min")  ?? "");
  const [max,  setMax]  = useState(searchParams.get("max")  ?? "");

  const categoryTree = buildCategoryTree(categories);
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(
      categoryTree
        .filter((parent) => parent.children.some((child) => child.slug === cat))
        .map((parent) => [parent.id, true])
    )
  );
  const toggleExpanded = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeCount = [cat, sort, min, max].filter(Boolean).length;

  function push(overrides: Record<string, string>) {
    const merged = { cat, sort, min, max, ...overrides };
    const params = new URLSearchParams();
    if (merged.cat)  params.set("cat",  merged.cat);
    if (merged.sort) params.set("sort", merged.sort);
    if (merged.min)  params.set("min",  merged.min);
    if (merged.max)  params.set("max",  merged.max);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    setCat(""); setSort(""); setMin(""); setMax("");
    router.push(pathname);
  }

  useEffect(() => {
    setCat(searchParams.get("cat")  ?? "");
    setSort(searchParams.get("sort") ?? "");
    setMin(searchParams.get("min")  ?? "");
    setMax(searchParams.get("max")  ?? "");
  }, [searchParams]);

  const panelContent = (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="flex items-center justify-between pb-5 border-b border-[var(--m-black)]/10">
        <span className="m-title-sm tracking-widest text-[var(--m-black)]">FILTERS</span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="m-label text-[var(--m-gold)] hover:text-[var(--m-earth)] transition-colors"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      {/* Sort */}
      <Section title="SORT BY">
        <div className="flex flex-col gap-3">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setSort(opt.value); push({ sort: opt.value }); }}
              className={`flex items-center text-left m-label transition-colors ${
                sort === opt.value
                  ? "text-[var(--m-black)] font-medium"
                  : "text-[var(--m-muted)] hover:text-[var(--m-black)]"
              }`}
            >
              <FilterDot active={sort === opt.value} />
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Categories */}
      {categoryTree.length > 0 && (
        <Section title="CATEGORY">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => { setCat(""); push({ cat: "" }); }}
              className={`flex items-center text-left m-label transition-colors ${
                !cat ? "text-[var(--m-black)] font-medium" : "text-[var(--m-muted)] hover:text-[var(--m-black)]"
              }`}
            >
              <FilterDot active={!cat} />
              All
            </button>
            {categoryTree.map((parent, i) => (
              <div key={parent.id}>
                {i > 0 && <hr className="border-t border-[var(--m-black)]/8 mb-3" />}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setCat(parent.slug); push({ cat: parent.slug }); }}
                    className={`flex-1 flex items-center text-left m-label transition-colors ${
                      cat === parent.slug
                        ? "text-[var(--m-black)] font-medium"
                        : "text-[var(--m-muted)] hover:text-[var(--m-black)]"
                    }`}
                  >
                    <FilterDot active={cat === parent.slug} />
                    {parent.name ?? parent.slug}
                  </button>
                  {parent.children.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(parent.id)}
                      aria-label={expanded[parent.id] ? `Collapse ${parent.name}` : `Expand ${parent.name}`}
                      className="p-1 text-[var(--m-subtle)] hover:text-[var(--m-black)]"
                    >
                      <ChevronIcon open={!!expanded[parent.id]} />
                    </button>
                  )}
                </div>
                {parent.children.length > 0 && expanded[parent.id] && (
                  <div className="flex flex-col gap-2.5 mt-2.5 ml-4">
                    {parent.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => { setCat(child.slug); push({ cat: child.slug }); }}
                        className={`flex items-center text-left m-label transition-colors ${
                          cat === child.slug
                            ? "text-[var(--m-black)] font-medium"
                            : "text-[var(--m-muted)] hover:text-[var(--m-black)]"
                        }`}
                      >
                        <FilterDot active={cat === child.slug} />
                        {child.name ?? child.slug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Price */}
      <Section title="PRICE" defaultOpen={false}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="m-label text-[var(--m-subtle)] block mb-1.5">From (€)</label>
              <input
                type="number"
                min={0}
                value={min}
                onChange={(e) => setMin(e.target.value)}
                onBlur={() => push({ min })}
                placeholder="0"
                className="w-full border border-[var(--m-muted)]/30 bg-transparent px-3 py-2 text-xs text-[var(--m-black)] placeholder-[var(--m-subtle)] focus:border-[var(--m-gold)] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="m-label text-[var(--m-subtle)] block mb-1.5">To (€)</label>
              <input
                type="number"
                min={0}
                value={max}
                onChange={(e) => setMax(e.target.value)}
                onBlur={() => push({ max })}
                placeholder="999"
                className="w-full border border-[var(--m-muted)]/30 bg-transparent px-3 py-2 text-xs text-[var(--m-black)] placeholder-[var(--m-subtle)] focus:border-[var(--m-gold)] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => push({ min, max })}
            className="m-btn m-btn--secondary w-full justify-center py-2 text-[0.625rem]"
          >
            Apply
          </button>
        </div>
      </Section>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP: push sidebar with width transition ── */}
      <aside
        className={`
          hidden lg:block flex-shrink-0 overflow-hidden
          transition-all duration-500 ease-in-out
          ${isOpen ? "w-56 mr-12 opacity-100" : "w-0 mr-0 opacity-0"}
        `}
      >
        {/* Inner div keeps fixed width so text never wraps during animation */}
        <div className="w-56 pt-2">
          {panelContent}
        </div>
      </aside>

      {/* ── MOBILE: overlay drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative w-72 max-w-full h-full bg-[var(--m-white)] overflow-y-auto px-6 py-8 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <span className="m-title-md tracking-widest">FILTERS</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="text-[var(--m-muted)] hover:text-[var(--m-black)] transition-colors p-1"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {panelContent}
            <button
              type="button"
              onClick={onClose}
              className="m-btn m-btn--primary w-full justify-center mt-8"
            >
              VIEW RESULTS
            </button>
          </div>
        </div>
      )}
    </>
  );
}
