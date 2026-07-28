"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Factory page — behind-the-scenes sourcing photos/videos, straight from
 * public/factory images./. No categories or per-item metadata, just a
 * grid that opens a lightbox on click (video items play inline).
 */

type FactoryItem = {
  id: string;
  type: "image" | "video";
  src: string;
};

const FACTORY_IMAGES = [
  "WhatsApp Image 2026-07-10 at 16.14.33.jpeg",
  "WhatsApp Image 2026-07-14 at 15.32.20.jpeg",
  "WhatsApp Image 2026-07-20 at 08.47.19 (2).jpeg",
  "WhatsApp Image 2026-07-20 at 08.47.19.jpeg",
  "WhatsApp Image 2026-07-20 at 08.47.20 (2).jpeg",
  "WhatsApp Image 2026-07-20 at 08.47.20 (3).jpeg",
  "WhatsApp Image 2026-07-20 at 08.47.22 (1).jpeg",
  "WhatsApp Image 2026-07-20 at 08.47.22.jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.25 (1).jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.25.jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.26 (1).jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.26 (2).jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.26 (3).jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.26.jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.27 (2).jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.28 (1).jpeg",
  "WhatsApp Image 2026-07-20 at 08.54.28.jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.20 (1).jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.20.jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.23 (1).jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.23 (2).jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.23.jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.24 (1).jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.24.jpeg",
  "Lace fronts/WhatsApp Image 2026-07-20 at 08.47.25.jpeg",
];

const FACTORY_VIDEOS = [
  "WhatsApp Video 2026-07-10 at 16.13.57.mp4",
  "WhatsApp Video 2026-07-12 at 15.51.46.mp4",
  "WhatsApp Video 2026-07-12 at 15.51.50.mp4",
  "WhatsApp Video 2026-07-13 at 18.14.45.mp4",
  "WhatsApp Video 2026-07-14 at 15.54.01.mp4",
  "Lace fronts/WhatsApp Video 2026-07-10 at 16.14.28.mp4",
];

function encodePath(relPath: string): string {
  return relPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

const BASE = "/factory images.";

const items: FactoryItem[] = [
  ...FACTORY_IMAGES.map((f) => ({ id: f, type: "image" as const, src: `${BASE}/${encodePath(f)}` })),
  ...FACTORY_VIDEOS.map((f) => ({ id: f, type: "video" as const, src: `${BASE}/${encodePath(f)}` })),
];

export default function FactoryPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };
  const closeLightbox = () => setIsOpen(false);
  const next = () => setActiveIndex((i) => (i === items.length - 1 ? 0 : i + 1));
  const prev = () => setActiveIndex((i) => (i === 0 ? items.length - 1 : i - 1));

  return (
    <main className="min-h-screen bg-[var(--m-white)] mt-20">
      <header className="w-full px-4 sm:px-6 lg:px-16 pt-10 pb-6">
        <span className="m-label text-[var(--m-gold)]">Behind the Scenes</span>
        <h1 className="font-display text-2xl md:text-3xl font-light mt-2 text-[var(--m-black)]">
          Factory
        </h1>
        <p className="z-label-1 mt-3 max-w-xl text-[var(--m-muted)]">
          A look at where your hair comes from — straight from the source.
        </p>
      </header>

      <section
        className="
          w-full
          px-4 sm:px-6 lg:px-16
          pb-20
          grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4
          gap-4 sm:gap-6
        "
      >
        {items.map((item, index) => (
          <FactoryCard key={item.id} item={item} onOpen={() => openLightbox(index)} />
        ))}
      </section>

      {isOpen && items.length > 0 && (
        <FactoryLightbox item={items[activeIndex]} onClose={closeLightbox} onPrev={prev} onNext={next} />
      )}
    </main>
  );
}

function FactoryCard({ item, onOpen }: { item: FactoryItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full text-left rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-500"
    >
      <div className="relative w-full aspect-video bg-[var(--m-blush)] overflow-hidden">
        {item.type === "video" ? (
          <video src={item.src} className="w-full h-full object-cover" muted playsInline preload="metadata" />
        ) : (
          <Image
            src={item.src}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {item.type === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                <path d="M2 1l11 6-11 6V1z" />
              </svg>
            </span>
          </span>
        )}
      </div>
    </button>
  );
}

function FactoryLightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: FactoryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous"
        className="absolute left-2 md:left-8 text-white/70 hover:text-white p-2"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next"
        className="absolute right-2 md:right-8 text-white/70 hover:text-white p-2"
      >
        ›
      </button>

      <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-6" onClick={(e) => e.stopPropagation()}>
        {item.type === "video" ? (
          <video src={item.src} className="w-full h-full object-contain" controls autoPlay playsInline />
        ) : (
          <Image src={item.src} alt="" fill sizes="100vw" className="object-contain" />
        )}
      </div>
    </div>
  );
}
