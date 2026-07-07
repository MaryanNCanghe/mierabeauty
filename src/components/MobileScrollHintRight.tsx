// src/components/MobileScrollHintRight.tsx
"use client";

import { useEffect, useState } from "react";

type Props = { targetId: string };

export default function MobileScrollHintRight({ targetId }: Props) {
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const update = () => {
      setCanScrollRight(el.scrollWidth - el.scrollLeft > el.clientWidth + 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  const scrollRight = () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.6, 320);
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  return (
    <>
      {/* Gradiente à direita (só mobile) */}
      <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/80 to-transparent" />

      {/* Botão seta (só mobile) */}
      <button
        type="button"
        aria-label="Ver mais categorias"
        onClick={scrollRight}
        className={`md:hidden absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-300 bg-white/90 shadow-sm p-2 transition-opacity ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* SVG inline, sem dependências */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-slate-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  );
}
