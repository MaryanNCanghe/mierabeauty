
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Tutorials page:
 * - Category filter (Hair, Wig Installation, Makeup, Skincare)
 * - Masonry layout via CSS columns
 * - Tip preview overlay on hover
 * - Click/tap opens lightbox with full description + influencer credit
 */

type Category = "Hair" | "Wig Installation" | "Makeup" | "Skincare";

const CATEGORIES: Category[] = ["Hair", "Wig Installation", "Makeup", "Skincare"];

type Influencer = {
  name: string;
  handle: string; // without @
  url: string;
};

type TutorialItem = {
  id: string | number;
  category: Category;
  title: string;
  tip: string; // short teaser, shown on hover
  description: string; // fuller tutorial text, shown in lightbox
  src: string;
  width: number; // intrinsic width (for aspect ratio)
  height: number; // intrinsic height
  influencer: Influencer;
};

// Inline data — replace images, copy, and @handles with your own content
const tutorialItems: TutorialItem[] = [
  {
    id: 1,
    category: "Hair",
    title: "Silk Press for Beginners",
    tip: "Section in four, blow-dry on cool, and never press over dirty hair.",
    description:
      "Wash and deep-condition first — a silk press only lasts on clean, moisturized hair. Blow-dry each section on a cool setting to cut frizz, then flat-iron in small passes with a heat protectant. Finish with a lightweight oil for shine, not weight.",
    src: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1600,
    height: 2133,
    influencer: { name: "Ama Boateng", handle: "styledby.ama", url: "https://instagram.com/styledby.ama" },
  },
  {
    id: 2,
    category: "Hair",
    title: "Protective Twist-Out Routine",
    tip: "Twist on damp hair with a leave-in + gel combo for definition that lasts all week.",
    description:
      "Apply leave-in conditioner followed by a curl-defining gel on damp hair, then twist in even sections from root to tip. Let air-dry or sit under a hooded dryer, and unravel gently once fully dry — never wet — to avoid frizz.",
    src: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1600,
    height: 1067,
    influencer: { name: "Naima Cisse", handle: "naima.curls", url: "https://instagram.com/naima.curls" },
  },
  {
    id: 3,
    category: "Wig Installation",
    title: "Melted Lace Install, No Glue Bumps",
    tip: "Bleach the knots, tint the lace to your scalp, and lay edges with a soft brush — not gel alone.",
    description:
      "Pluck and bleach the knots for a natural hairline, then tint the lace with foundation matched to your scalp tone. Lay the lace with a thin layer of adhesive, press with a cool rag, then blend edges using an edge brush and light gel — heavy product is what causes bumps.",
    src: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1067,
    height: 1600,
    influencer: { name: "Tola Adeyemi", handle: "wigsbytola", url: "https://instagram.com/wigsbytola" },
  },
  {
    id: 4,
    category: "Wig Installation",
    title: "Glueless Install for Everyday Wear",
    tip: "Braid down flat, use a wig grip band, and adjust the elastic combs for a secure, damage-free fit.",
    description:
      "Braid your natural hair flat to the scalp and cover with a thin wig cap. Fit an adjustable wig grip band underneath for grip without tension, then snap the wig's elastic combs into your braids. No heat, no glue — fully reusable and easy to take down at night.",
    src: "https://images.pexels.com/photos/3065179/pexels-photo-3065179.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1600,
    height: 1067,
    influencer: { name: "Rosa Mbeki", handle: "gluelessqueen", url: "https://instagram.com/gluelessqueen" },
  },
  {
    id: 5,
    category: "Makeup",
    title: "Everyday Soft-Glam Base",
    tip: "Prime, then build coverage in thin layers — heavy first coats crease by noon.",
    description:
      "Start with a hydrating primer suited to your skin type. Apply foundation in thin layers with a damp sponge, building only where needed. Set with a light dusting of powder just on the T-zone, and finish with cream blush for a natural flush that photographs well.",
    src: "https://images.pexels.com/photos/2691959/pexels-photo-2691959.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1600,
    height: 2400,
    influencer: { name: "Fatima Njie", handle: "fatima.glam", url: "https://instagram.com/fatima.glam" },
  },
  {
    id: 6,
    category: "Makeup",
    title: "Bold Lip That Actually Stays",
    tip: "Line, blot, reapply, blot again — that's the secret to a lip that survives dinner.",
    description:
      "Line the lips first to create a base the color can grip. Apply lipstick, blot with tissue, then apply a second coat and blot again. This double-layer method is what makes bold color last through eating and drinking without a full touch-up.",
    src: "https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1600,
    height: 1067,
    influencer: { name: "Keisha Odom", handle: "keishabeat", url: "https://instagram.com/keishabeat" },
  },
  {
    id: 7,
    category: "Skincare",
    title: "Layering Actives Without Irritation",
    tip: "Never stack retinol and exfoliating acids on the same night — alternate instead.",
    description:
      "Cleanse, then apply water-based actives (like niacinamide or vitamin C) in the morning, saving retinol for night use only. Alternate retinol and exfoliating acid nights rather than layering both, and always follow with a fragrance-free moisturizer and SPF the next morning.",
    src: "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1600,
    height: 2133,
    influencer: { name: "Zainab Toure", handle: "skinbyzainab", url: "https://instagram.com/skinbyzainab" },
  },
  {
    id: 8,
    category: "Skincare",
    title: "Shea + Marula Night Ritual",
    tip: "Warm the balm between your palms first — it absorbs faster and won't feel greasy.",
    description:
      "After cleansing, warm a small amount of shea and marula balm between your palms until it turns to oil, then press (don't rub) into damp skin. The warmth helps it absorb rather than sit on top, locking in moisture overnight without clogging pores.",
    src: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1600",
    width: 1600,
    height: 1067,
    influencer: { name: "Miera Sow", handle: "mieraskin", url: "https://instagram.com/mieraskin" },
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const filteredItems = useMemo(
    () =>
      activeCategory === "All"
        ? tutorialItems
        : tutorialItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => setIsOpen(false);
  const next = () => setActiveIndex((i) => (i === filteredItems.length - 1 ? 0 : i + 1));
  const prev = () => setActiveIndex((i) => (i === 0 ? filteredItems.length - 1 : i - 1));

  return (
    <main className="min-h-screen bg-[var(--m-white)] mt-20">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 lg:px-16 pt-10 pb-6">
        <span className="m-label text-[var(--m-gold)]">Learn With Us</span>
        <h1 className="font-display text-4xl md:text-5xl font-light mt-2 text-[var(--m-black)]">
          Tutorials
        </h1>
        <p className="z-label-1 mt-3 max-w-xl text-[var(--m-muted)]">
          Hair, wig installs, makeup, and skincare — tips from the creators who inspire us.
        </p>
      </header>

      {/* Category filter */}
      <div className="w-full px-4 sm:px-6 lg:px-16 pb-8 flex flex-wrap gap-3">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`m-btn m-btn--sm ${
              activeCategory === cat ? "m-btn--primary" : "m-btn--secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Uniform grid — equal-size cards, like a YouTube video grid */}
      <section
        className="
          w-full
          px-4 sm:px-6 lg:px-16
          pb-20
          grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4
          gap-4 sm:gap-6
        "
      >
        {filteredItems.map((item, index) => (
          <TutorialCard key={item.id} item={item} onOpen={() => openLightbox(index)} />
        ))}
      </section>

      {/* Lightbox */}
      {isOpen && filteredItems.length > 0 && (
        <Lightbox
          item={filteredItems[activeIndex]}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      )}
    </main>
  );
}

function TutorialCard({
  item,
  onOpen,
}: {
  item: TutorialItem;
  onOpen: () => void;
}) {
  return (
    <figure className="group" aria-label={item.title}>
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left rounded-2xl overflow-hidden bg-white shadow-sm group-hover:shadow-lg transition-shadow duration-500"
      >
        {/* Thumbnail — fixed 16:9 aspect for every card, like a video grid */}
        <div className="relative w-full aspect-video bg-[var(--m-blush)] overflow-hidden">
          <Image
            src={item.src}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 m-label bg-black/60 text-white px-2 py-1 rounded">
            {item.category}
          </span>
        </div>

        {/* Info — always visible, same size for every card */}
        <figcaption className="px-3 py-3 sm:px-4 sm:py-4 bg-white">
          <p className="font-display text-base sm:text-lg font-light leading-snug text-[var(--m-black)] line-clamp-1">
            {item.title}
          </p>
          <p className="mt-1 text-[var(--m-muted)] text-xs font-light leading-relaxed line-clamp-2">
            {item.tip}
          </p>
          <p className="m-label mt-2 text-[var(--m-gold)]">@{item.influencer.handle}</p>
        </figcaption>
      </button>
    </figure>
  );
}

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: TutorialItem;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing tutorial: ${item.title}`}
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full h-full md:h-[90vh] flex flex-col md:flex-row items-stretch bg-[var(--m-black)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-full md:w-3/5 h-[45vh] md:h-full">
          <Image
            src={item.src}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority
          />

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
        </div>

        {/* Details panel */}
        <div className="relative w-full md:w-2/5 h-full overflow-y-auto p-6 md:p-8 flex flex-col gap-4">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-md bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-sm"
          >
            Close
          </button>

          <span className="m-label text-[var(--m-gold)]">{item.category}</span>
          <h2 className="font-display text-2xl md:text-3xl font-light text-white">{item.title}</h2>
          <hr className="m-divider" />
          <p className="text-white/80 text-sm leading-relaxed">{item.description}</p>

          <a
            href={item.influencer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-4 flex items-center gap-2 text-white/90 hover:text-[var(--m-gold)] transition-colors"
          >
            <span className="m-label">Tutorial by</span>
            <span className="z-label-1">@{item.influencer.handle}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
