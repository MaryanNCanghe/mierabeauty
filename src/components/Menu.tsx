"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Category } from "@/lib/categories";

const Menu = ({ categories = [], light = false }: { categories?: Category[]; light?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hair = categories.find((c) => c.slug === "hair" && !c.parent_id);
  const shopCategories = categories.filter((c) => c.parent_id === hair?.id);

  // Portal target isn't available until after mount (SSR safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const drawer = (
    <>
      {/* Overlay para clicar fora */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Painel do menu (coluna) */}
      <nav
        className={`fixed top-0 left-0 z-[60] w-80 max-w-[85vw] h-full bg-[var(--m-white)] text-[var(--m-black)]
                    transition-transform duration-300 overflow-y-auto shadow-xl
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-6 right-6 text-[var(--m-muted)] hover:text-[var(--m-black)] transition-colors p-1"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <ul className="flex flex-col items-center gap-4 pt-16 pb-4 z-title-md text-base">
          <li>
            <Link href="/" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-[var(--m-gold)] hover:text-[var(--m-gold)] transition-colors duration-300 pb-1">
              Home
            </Link>
          </li>
          <li>
            <Link href="/shop" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-[var(--m-gold)] hover:text-[var(--m-gold)] transition-colors duration-300 pb-1">
              Shop
            </Link>
          </li>
          <li>
            <Link href="/custom" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-[var(--m-gold)] hover:text-[var(--m-gold)] transition-colors duration-300 pb-1">
              Custom
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-[var(--m-gold)] hover:text-[var(--m-gold)] transition-colors duration-300 pb-1">
              About
            </Link>
          </li>
          <li>
            <Link href="/gallery" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-[var(--m-gold)] hover:text-[var(--m-gold)] transition-colors duration-300 pb-1">
              Tutorials
            </Link>
          </li>
        </ul>

        {shopCategories.length > 0 && (
          <div className="border-t border-[var(--m-black)]/10 px-6 pb-6">
            <p className="m-label text-[var(--m-gold)] text-center pt-4 pb-3">Shop by Category</p>
            <ul className="flex flex-col items-center gap-3 m-title-sm">
              {shopCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?cat=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="border-b border-transparent hover:border-[var(--m-gold)] hover:text-[var(--m-gold)] transition-colors duration-300 pb-1"
                  >
                    {c.name ?? c.slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <div className="relative">
      {/* Ícone hamburguer */}
      <Image
        src="/menu.png"
        alt="Menu"
        width={30}
        height={30}
        onClick={() => setOpen((prev) => !prev)}
        className={`cursor-pointer transition-[filter] duration-300 ${light ? "brightness-0 invert" : ""}`}
        priority
      />

      {/* Rendered on document.body so scroll-triggered navbar effects (backdrop-filter,
          which creates a containing block for fixed descendants) never trap the drawer. */}
      {mounted && createPortal(drawer, document.body)}
    </div>
  );
};

export default Menu;
