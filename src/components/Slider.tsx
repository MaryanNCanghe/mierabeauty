"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  mediaType: "image" | "video";
  img?: string | null;
  videoSrc?: string | null;
  url: string;
  cta: string;
  bg?: string;
};

const slides: Slide[] = [
  {
    id: 1,
    eyebrow: "New Arrivals",
    title: "The Art of\nRadiant Beauty.",
    subtitle: "Luxury skincare made for every girl, rooted in the richness of nature.",
    mediaType: "image",
    img: "https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg?auto=compress&cs=tinysrgb&w=1600",
    url: "/shop",
    cta: "SHOP ALL PRODUCTS",
    bg: "bg-[#0A0A0A]",
  },
  {
    id: 2,
    eyebrow: "Skincare Ritual",
    title: "Radiance,\nRefined.",
    subtitle: "Premium formulas inspired by timeless beauty traditions.",
    mediaType: "image",
    img: "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1600",
    url: "/shop",
    cta: "SHOP SKINCARE",
    bg: "bg-[#0A0A0A]",
  },
  {
    id: 3,
    eyebrow: "Body & Soul",
    title: "Rooted in\nTradition.",
    subtitle: "Every product tells a story of heritage, craft, and care.",
    mediaType: "image",
    img: "https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=1600",
    url: "/shop",
    cta: "DISCOVER MORE",
    bg: "bg-[#0A0A0A]",
  },
];

const SLIDE_INTERVAL_MS = 5000;

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, SLIDE_INTERVAL_MS);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    startAutoplay();
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-screen overflow-hidden"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* Track */}
      <div
        className="slider-track w-max h-full flex"
        style={{ "--slider-offset": `-${current * 100}vw` } as React.CSSProperties}
      >
        {slides.map((slide) => (
          <section
            key={slide.id}
            aria-roledescription="slide"
            aria-label={slide.eyebrow}
            className={`relative w-screen h-full ${slide.bg ?? ""}`}
          >
            {/* Full-bleed media */}
            <div className="absolute inset-0">
              {slide.mediaType === "video" && slide.videoSrc ? (
                <video
                  src={slide.videoSrc}
                  className="w-full h-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={slide.img || ""}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={slide.id === 1}
                />
              )}
            </div>

            {/* Rich dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

            {/* Text — Apple-style: large, left-aligned */}
            <div className="relative z-10 w-full h-full flex items-end pb-24 md:pb-32 px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-64">
              <div className="flex flex-col gap-5 max-w-2xl">
                <span className="m-label text-[var(--m-gold)] animate-fadeInUp animate-delay-100">
                  {slide.eyebrow}
                </span>

                <h1 className="slider-hero-title animate-fadeInUp animate-delay-200">
                  {slide.title}
                </h1>

                <p className="slider-hero-subtitle animate-fadeInUp animate-delay-300">
                  {slide.subtitle}
                </p>

                <Link
                  href={slide.url}
                  className="m-btn m-btn--ghost self-start animate-fadeInUp animate-delay-400"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Vertical dot indicators */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`block rounded-full transition-all duration-300 ${
              current === index
                ? "w-1 h-6 bg-[var(--m-gold)]"
                : "w-1 h-3 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
