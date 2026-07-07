import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="py-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 bg-[var(--m-black)] text-[var(--m-white)] text-sm mt-24">
      {/* TOP */}
      <div className="flex flex-col md:flex-row justify-between gap-24">
        {/* LEFT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8">
          <Link href="/">
            <div className="font-display text-2xl tracking-widest text-[var(--m-white)]">
              MIERA
            </div>
          </Link>
          <p className="m-label text-[var(--m-subtle)]">
            Crafted for the radiant.<br />Rooted in Africa.
          </p>
          <a href="mailto:hello@mierabeauty.com" className="m-title-sm text-[var(--m-gold)] hover:underline">hello@mierabeauty.com</a>
          <div className="flex gap-6">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Image src="/instagram.png" alt="Instagram" width={16} height={16} className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Image src="/youtube.png" alt="YouTube" width={16} height={16} className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" />
            </a>
            <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <Image src="/pinterest.png" alt="Pinterest" width={16} height={16} className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" />
            </a>
          </div>
          <div className="flex flex-row gap-6 m-label">
            <Link href="/about" className="text-[var(--m-subtle)] hover:text-[var(--m-gold)] transition-colors border-b border-[var(--m-subtle)] hover:border-[var(--m-gold)] pb-0.5">
              Contact Us
            </Link>
            <Link href="/policy" className="text-[var(--m-subtle)] hover:text-[var(--m-gold)] transition-colors border-b border-[var(--m-subtle)] hover:border-[var(--m-gold)] pb-0.5">
              Legal &amp; Privacy
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8 mx-auto">
          <h2 className="m-title-md text-[var(--m-white)] tracking-widest">SUBSCRIBE</h2>
          <p className="m-label text-[var(--m-subtle)]">
            Be the first to discover new arrivals, rituals, and exclusive offers.
          </p>
          <div className="flex border border-[var(--m-gold)]/40 hover:border-[var(--m-gold)] transition-colors">
            <input
              type="email"
              placeholder="Your email address"
              className="p-4 w-3/4 m-label bg-transparent text-[var(--m-white)] placeholder-[var(--m-subtle)] outline-none"
            />
            <button type="button" className="w-1/4 m-btn bg-white text-[var(--m-black)] border-l border-[var(--m-gold)]/40">
              JOIN
            </button>
          </div>
          <span className="m-title-sm text-[var(--m-subtle)] tracking-widest">Secure Payments</span>
          <div className="flex gap-4">
            <Image src="/paypal.png" alt="PayPal" width={40} height={20} className="opacity-60" />
            <Image src="/mastercard.png" alt="Mastercard" width={40} height={20} className="opacity-60" />
            <Image src="/visa.png" alt="Visa" width={40} height={20} className="opacity-60" />
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="mt-16 h-px bg-[var(--m-gold)]/20" />

      {/* BOTTOM */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
        <div className="m-label text-[var(--m-subtle)]">© 2026 MIERA</div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div>
            <span className="m-label text-[var(--m-subtle)] mr-4">Language</span>
            <span className="m-label text-[var(--m-white)]">ENG | English</span>
          </div>
          <div>
            <span className="m-label text-[var(--m-subtle)] mr-4">Currency</span>
            <span className="m-label text-[var(--m-white)]">€ EUR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
