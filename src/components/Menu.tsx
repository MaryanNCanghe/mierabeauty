"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
const Menu = () => {
  const [open, setOpen] = useState(false);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      {/* Ícone hamburguer */}
      <Image
        src="/menu.png"
        alt="Menu"
        width={24}
        height={24}
        onClick={() => setOpen((prev) => !prev)}
        priority
      />

      {/* Overlay para clicar fora */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Painel do menu (coluna) */}
      <nav
        className={`fixed top-20 left-0 z-50 w-full h-[calc(100vh-80px)] bg-transparent text-white
                    transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="flex flex-col items-center justify-center gap-8 h-full z-title-md bg-transparent">
          <li>
            <Link href="/" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-white transition-colors duration-300 pb-2">
              Home
            </Link>
          </li>
          <li>
            <Link href="/list" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-white transition-colors duration-300 pb-2">
              Shop
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-white transition-colors duration-300 pb-2">
              About
            </Link>
          </li>
          <li>
            <Link href="/gallery" onClick={() => setOpen(false)} className="border-b border-transparent hover:border-white transition-colors duration-300 pb-2">
              Gallery
            </Link>
          </li>
         
        </ul>
      </nav>
    </div>
  );
};

export default Menu;
