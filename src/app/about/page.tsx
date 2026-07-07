// app/about/page.tsx
"use client";

import { useState } from "react";

export default function AboutPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    // Honeypot anti-spam
    if (formData.get("company")) {
      setStatus("success");
      return;
    }

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        e.currentTarget.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[var(--m-white)]">
      {/* HERO: full-screen with brand story overlay */}
      <section className="relative h-screen w-full bg-[var(--m-black)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            src="https://cdn.coverr.co/videos/coverr-sunlight-through-leaves-3540/1080p.mp4"
            className="w-full h-full object-cover opacity-50"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />

        <div className="relative z-10 h-full w-full flex items-center justify-center px-6 text-center">
          <div className="flex flex-col items-center gap-6 max-w-3xl animate-fadeInUp">
            <span className="m-label text-[var(--m-gold)]">Our Story</span>
            <h1 className="about-hero-title">
              Beauty Born from the Heart of Africa.
            </h1>
            <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-xl">
              Miera Beauty was born from a deep love for African heritage — its rituals, its botanicals, and its timeless approach to radiance.
            </p>
          </div>
        </div>
      </section>

      {/* BRAND VALUES */}
      <section className="w-full px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-64 py-24 bg-[var(--m-white)]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { title: "Heritage", body: "Every formula draws inspiration from ancestral African beauty rituals passed down through generations." },
            { title: "Purity", body: "We source only the finest natural ingredients — shea, marula, baobab — directly from the continent." },
            { title: "Luxury", body: "Crafted for those who believe that beauty is a ritual, not a routine. Every detail is intentional." },
          ].map((v) => (
            <div key={v.title} className="flex flex-col gap-4">
              <span className="m-label text-[var(--m-gold)]">{v.title}</span>
              <hr className="m-divider" />
              <p className="text-[var(--m-muted)] font-light leading-relaxed text-sm">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="w-full bg-[var(--m-blush)]" id="contact">
        <div className="mx-auto max-w-xl px-6 py-20">
          <div className="text-center mb-10">
            <span className="m-label text-[var(--m-gold)]">Get in touch</span>
            <h2 className="font-display text-3xl md:text-4xl font-light mt-3 text-[var(--m-black)]">
              Contact Us
            </h2>
            <p className="m-label text-[var(--m-muted)] mt-3">
              For collaborations, press, or any enquiry — we&apos;d love to hear from you.
            </p>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            aria-labelledby="contact-form-title"
          >
            <h3 id="contact-form-title" className="sr-only">Contact form</h3>

            {/* Honeypot — hidden from real users, traps bots */}
            <input type="text" name="company" title="Leave this field empty" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div>
              <label htmlFor="name" className="m-label block mb-2 text-[var(--m-black)]">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full border border-[var(--m-muted)]/40 bg-transparent px-4 py-3 text-[var(--m-black)] placeholder-[var(--m-subtle)] focus:border-[var(--m-gold)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="m-label block mb-2 text-[var(--m-black)]">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border border-[var(--m-muted)]/40 bg-transparent px-4 py-3 text-[var(--m-black)] placeholder-[var(--m-subtle)] focus:border-[var(--m-gold)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="message" className="m-label block mb-2 text-[var(--m-black)]">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Write your message…"
                className="w-full border border-[var(--m-muted)]/40 bg-transparent px-4 py-3 text-[var(--m-black)] placeholder-[var(--m-subtle)] focus:border-[var(--m-gold)] focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="m-btn m-btn--primary w-full py-4 disabled:opacity-60"
              aria-busy={status === "loading"}
            >
              {status === "loading" ? "Sending…" : "Send Message"}
            </button>

            {status === "success" && (
              <p className="text-center m-label text-green-700">
                Message sent — we&apos;ll reply soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-center m-label text-red-600">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
