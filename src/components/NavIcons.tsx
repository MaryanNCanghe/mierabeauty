"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "@/contexts/cart";
import { supabaseClient } from "@/lib/supabase/client";
import CartModal from "@/components/CartModal";

function NavIcons({ light = false }: { light?: boolean }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { items } = useCart();

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  useEffect(() => {
    let mounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsLoggedIn(!!data.session);
    });

    const { data: sub } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      setIsProfileOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <div className="flex items-center gap-4 xl:gap-6 relative">

      {/* Profile / Login */}
      {isLoggedIn ? (
        <div className="relative" ref={profileRef}>
          <Image
            src="/profile.png"
            alt="Profile"
            width={26}
            height={26}
            className={`cursor-pointer transition-[filter] duration-300 ${light ? "brightness-0 invert" : ""}`}
            onClick={() => setIsProfileOpen(prev => !prev)}
          />

          {isProfileOpen && (
            <div className="absolute top-12 right-0 p-4 rounded-md bg-white text-sm shadow-[0_3px_10px_rgb(0,0,0,0.2)] z-20 flex flex-col gap-2">
              <Link
                href="/profile"
                className="z-btn z-btn-primary"
                onClick={() => setIsProfileOpen(false)}
              >
                Profile
              </Link>
              <button type="button" className="z-btn z-btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className={`text-sm z-label-1 hover:underline transition-colors duration-300 ${light ? "text-white" : ""}`}>
          Login
        </Link>
      )}

      {/* Cart */}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsCartOpen(prev => !prev)}
        aria-label={`Cart (${totalItems})`}
      >
        <Image
          src="/cart.png"
          alt="Cart"
          width={22}
          height={22}
          className={`transition-[filter] duration-300 ${light ? "brightness-0 invert" : ""}`}
        />

        {totalItems > 0 && (
          <div className="absolute -top-3 -right-3 min-w-6 h-5 rounded-full bg-red-600 text-white text-sm flex items-center justify-center px-1">
            {totalItems}
          </div>
        )}

        {isCartOpen && <CartModal />}
      </div>
    </div>
  );
}

export default NavIcons;
