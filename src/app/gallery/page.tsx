
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Single-file Gallery page:
 * - Masonry layout via CSS columns
 * - Description overlay on hover
 * - Click/tap opens lightbox modal (ESC to close, arrows to navigate)
 * - Full-bleed on desktop with only 3px side margins; comfy padding on phones
 */

type GalleryItem = {
  id: string | number;
  src: string;
  alt: string;
  description?: string;
  width: number;   // intrinsic width (for aspect ratio)
  height: number;  // intrinsic height
};

// Inline data — replace with your own URLs/descriptions
const galleryItems: GalleryItem[] = [
  {
    id: 1,
    src: "https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Sunset over dunes",
    description: "Golden hour in the desert",
    width: 1280,
    height: 1706,
  },
  {
    id: 2,
    src: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "City skyline at night",
    description: "City lights and reflections",
    width: 1600,
    height: 1067,
  },
  {
    id: 3,
    src: "https://images.pexels.com/photos/34950/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Forest path",
    description: "Misty morning walk",
    width: 1600,
    height: 1067,
  },
  {
    id: 4,
    src: "https://images.pexels.com/photos/593172/pexels-photo-593172.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Ocean cliff",
    description: "Waves carving the stone",
    width: 1067,
    height: 1600,
  },
  {
    id: 5,
    src: "https://images.pexels.com/photos/349377/pexels-photo-349377.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Mountain lake",
    description: "Crystal water and peaks",
    width: 1600,
    height: 1067,
  },
  {
    id: 6,
    src: "https://images.pexels.com/photos/247917/pexels-photo-247917.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Vintage car",
    description: "Classic lines and chrome",
    width: 1600,
    height: 1067,
  },
];

export default function GalleryPage() {
  // Lightbox state
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => setIsOpen(false);
  const next = () => setActiveIndex((i) => (i === galleryItems.length - 1 ? 0 : i + 1));
  const prev = () => setActiveIndex((i) => (i === 0 ? galleryItems.length - 1 : i - 1));

  return (
    <main className="min-h-screen bg-white mt-20">
      {/* Header — comfy padding on phone, tiny margin on desktop */}
      <header className="w-full px-4 sm:px-6 lg:px-[3px] pt-10 pb-6">
        <h1 className="z-title-md border-b border-black px-4 py-2 inline-block font-semibold tracking-tight">Gallery</h1>
        <p className="z-label-1 mt-2 text-black-600">
          A House of style, moments, and creativity, where fashion transcends time and inspires the present.
        </p>
      </header>

      {/* Masonry using CSS columns — full width, 3px side margins on lg+ */}
      <section
        className="
          w-full
          px-4 sm:px-6 lg:px-[3px]
          pb-20
          columns-1 sm:columns-2 lg:columns-3 xl:columns-4
          gap-4
        "
      >
        {galleryItems.map((item, index) => (
          <GalleryCard key={item.id} item={item} onOpen={() => openLightbox(index)} />
        ))}
      </section>

      {/* Lightbox (single-file, no portal) */}
      {isOpen && (
        <Lightbox
          item={galleryItems[activeIndex]}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      )}
    </main>
  );
}

/**
 * Card inside masonry columns
 */
function GalleryCard({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  // Aspect ratio for spacer
  const aspect = item.height / item.width;

  return (
    <figure className=" z-label mb-4 break-inside-avoid relative group" aria-label={item.alt}>
      {/* Ratio box wrapper */}
      <button
        type="button"
        onClick={onOpen}
        className="relative w-full overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in"
        aria-label={`Open image: ${item.alt}`}
      >
        {/* Height spacer */}
        <div style={{ paddingTop: `${aspect * 100}%` }} />

        {/* Image fills the box */}
        <Image
          src={item.src}
          alt={item.alt}
          fill
          // Full-bleed sizing on desktop, efficient sizes on smaller screens
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay description on hover (desktop) */}
        <figcaption
          className="
            pointer-events-none absolute inset-0 flex items-end
            bg-gradient-to-t from-black/60 via-black/20 to-transparent
            text-white p-3
            opacity-0 transition-opacity duration-200
            group-hover:opacity-100
          "
          aria-hidden="true"
        >
          <p className="z-label leading-snug">{item.description ?? item.alt}</p>
        </figcaption>
      </button>
    </figure>
  );
}

/**
 * Lightbox modal
 * - ESC to close
 * - Arrow keys to navigate
 * - Backdrop click closes
 * - Focus goes to Close button on open
 */
function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: GalleryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Focus first actionable element on open
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Keyboard controls
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing image: ${item.alt}`}
      onClick={onClose} // backdrop click closes
    >
      {/* Content container (clicks inside do not close) */}
      <div
        className="relative max-w-[100vw] max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image fits (contain) inside modal */}
        <div className="relative w-full h-full">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Caption */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 text-center">
          {(item.description || item.alt) && (
            <p className="z-label-1 inline-block rounded bg-black/60 px-3 py-2 text-sm text-white">
              {item.description ?? item.alt}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous"
            className="rounded-full bg-white/70 hover:bg-white text-gray-900 w-10 h-10 flex items-center justify-center shadow"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next"
            className="rounded-full bg-white/70 hover:bg-white text-gray-900 w-10 h-10 flex items-center justify-center shadow"
          >
            ›
          </button>
        </div>

        {/* Top-right actions */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {/* Open original in new tab (optional) */}
          <a
            href={item.src}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-white/80 hover:bg-white text-gray-900 px-3 py-1 text-sm shadow"
            aria-label="Open original image"
          >
            Open
          </a>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md bg-white/80 hover:bg-white text-gray-900 px-3 py-1 text-sm shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
