"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "miera-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function respond(value: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[var(--m-black)] text-[var(--m-white)] px-4 py-4 md:px-8">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <p className="text-xs md:text-sm font-light leading-relaxed flex-1">
          We use cookies to keep your cart working, keep you signed in, and improve your shopping
          experience. See our{" "}
          <Link href="/policy#cookies" className="text-[var(--m-gold)] hover:underline">
            Cookie Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => respond("declined")}
            className="m-label text-xs px-4 py-2 border border-[var(--m-white)]/30 hover:border-[var(--m-white)] transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="m-btn m-btn--primary text-xs px-4 py-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
