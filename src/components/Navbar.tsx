"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Menu from "./Menu";
import NavIcons from "./NavIcons";
import MobileInlineSearch from "./MobileInlineSearch";
import SearchBar from "./SearchBar";
import CurrencySwitcher from "./CurrencySwitcher";
import type { Category } from "@/lib/categories";

// Routes with a full-bleed dark hero directly under the navbar —
// everywhere else has a light background at the top, so white text
// would be unreadable before the user scrolls.
const HAS_DARK_HERO = new Set(["/", "/about"]);

const Navbar = ({ categories = [] }: { categories?: Category[] }) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const overDarkHero = HAS_DARK_HERO.has(pathname) && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const linkColor = overDarkHero ? "text-white" : "text-[var(--m-black)]";

  return (
    <div
      className={`
        fixed top-0 left-0 w-full z-50
        pt-[env(safe-area-inset-top)]
        transition-all duration-300
        ${scrolled ? "navbar-glass" : "bg-transparent"}
      `}
    >
      {/* ── Main nav bar ── */}
      <div className="h-14 md:h-20 px-3 md:px-8 lg:px-16 xl:px-32 2xl:px-64">

        {/* MOBILE */}
        <div className="md:hidden h-full grid grid-cols-3 items-center gap-2">
          <Link href="/">
            <span className={`font-display text-base leading-none tracking-widest truncate transition-colors duration-300 ${linkColor}`}>
              MIERA
            </span>
          </Link>
          <div className="min-w-0 flex justify-center">
            <MobileInlineSearch />
          </div>
          <div className="flex items-center justify-end gap-2">
            <CurrencySwitcher light={overDarkHero} />
            <NavIcons light={overDarkHero} />
            <Menu categories={categories} light={overDarkHero} />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center justify-between h-full">
          {/* LEFT: brand + nav links */}
          <div className="flex items-center gap-10">
            <Link href="/">
              <span className={`font-display text-xl lg:text-2xl leading-none tracking-widest transition-colors duration-300 ${linkColor}`}>
                MIERA
              </span>
            </Link>
            <div className={`hidden xl:flex gap-6 m-title-sm transition-colors duration-300 ${linkColor}`}>
              {[
                { href: "/",       label: "Home" },
                { href: "/shop",   label: "Shop"     },
                { href: "/about",  label: "About"    },
                { href: "/gallery",label: "Tutorials"},
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="hover:text-[var(--m-gold)] transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: search icon + icons + hamburger */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Open search"}
              onClick={() => setSearchOpen((v) => !v)}
              className={`transition-colors duration-200 hover:text-[var(--m-gold)] ${linkColor}`}
            >
              {searchOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4" />
                  <line x1="12" y1="12" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <CurrencySwitcher light={overDarkHero} />
            <NavIcons light={overDarkHero} />
            <Menu categories={categories} light={overDarkHero} />
          </div>
        </div>
      </div>

      {/* ── Expandable search bar (desktop only) ── */}
      <div
        className={`
          hidden md:block overflow-hidden
          transition-[max-height,opacity] duration-500 ease-in-out
          bg-[var(--m-white)]
          ${searchOpen
            ? "max-h-24 opacity-100 border-b border-[var(--m-gold)]/25"
            : "max-h-0 opacity-0"
          }
        `}
      >
        <div className="px-8 lg:px-16 xl:px-32 2xl:px-64 py-5">
          <SearchBar onClose={() => setSearchOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
