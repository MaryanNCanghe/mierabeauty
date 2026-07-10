export default function PolicyPage() {
  return (
    <section className="mt-24 max-w-3xl mx-auto px-4 py-8 text-[var(--m-black)]">
      <h1 className="m-title-md ls-wider border-b border-[var(--m-gold)] pb-3 mb-10">
        Store Policies
      </h1>

      {/* Shipment Policy */}
      <section className="mb-10">
        <h2 className="m-label text-[var(--m-gold)] mb-4 uppercase tracking-widest">
          Shipment Policy
        </h2>
        <div className="space-y-3 text-sm font-light text-[var(--m-muted)] leading-relaxed">
          <p>
            We process orders within <strong className="text-[var(--m-black)]">1 to 3 business days</strong>. Standard
            delivery usually takes <strong className="text-[var(--m-black)]">7 to 15 business days</strong>, depending
            on your location and carrier volumes.
          </p>
          <p>
            <strong className="text-[var(--m-black)]">Pre-order items</strong> take longer than standard delivery —
            the expected timeframe is shown on the product page and at checkout before you confirm your order.
          </p>
          <p>
            Tracking will be emailed once your order ships. Times may vary due to
            carrier delays, customs, or peak seasons.
          </p>
          <p>
            Shipping rates are calculated at checkout. Free shipping thresholds
            (if any) are shown at checkout.
          </p>
          <p>
            <strong className="text-[var(--m-black)]">Buyer Protection:</strong> if your order doesn&apos;t arrive,
            arrives damaged, or isn&apos;t as described, we&apos;ll issue a full refund or replacement — no questions asked.
          </p>
          <p>
            For delivery issues, contact us at{" "}
            <a href="mailto:hello@mierabeauty.com" className="text-[var(--m-gold)] hover:underline">
              hello@mierabeauty.com
            </a>.
          </p>
        </div>
      </section>

      {/* Return Policy */}
      <section className="mb-10">
        <h2 className="m-label text-[var(--m-gold)] mb-4 uppercase tracking-widest">
          Return Policy
        </h2>
        <div className="space-y-3 text-sm font-light text-[var(--m-muted)] leading-relaxed">
          <p>
            Returns accepted within <strong className="text-[var(--m-black)]">90 days</strong> of delivery for unopened
            items in original packaging (unless Final Sale).
          </p>
          <p>
            Start a return by emailing{" "}
            <a href="mailto:hello@mierabeauty.com" className="text-[var(--m-gold)] hover:underline">
              hello@mierabeauty.com
            </a>. Refunds processed within{" "}
            <strong className="text-[var(--m-black)]">5 to 10 business days</strong> after inspection.
          </p>
          <p>
            Shipping fees are non-refundable unless the item was defective or covered by Buyer Protection.
            Exchanges are subject to stock availability.
          </p>
        </div>
      </section>

      {/* Privacy Policy */}
      <section className="mb-10">
        <h2 className="m-label text-[var(--m-gold)] mb-4 uppercase tracking-widest">
          Privacy Policy
        </h2>
        <div className="space-y-3 text-sm font-light text-[var(--m-muted)] leading-relaxed">
          <p>
            We collect information to process orders and improve our services. We do not sell
            personal data to third parties.
          </p>
          <p>
            We share limited data with service providers (payments, shipping) solely to
            fulfil your order.
          </p>
          <p>
            To request access, correction, or deletion of your data, contact us at{" "}
            <a href="mailto:hello@mierabeauty.com" className="text-[var(--m-gold)] hover:underline">
              hello@mierabeauty.com
            </a>.
          </p>
          <p>
            We may update this policy periodically; continued use of the site indicates consent.
          </p>
        </div>
      </section>

      {/* Cookie Policy */}
      <section id="cookies" className="mb-10">
        <h2 className="m-label text-[var(--m-gold)] mb-4 uppercase tracking-widest">
          Cookie Policy
        </h2>
        <div className="space-y-3 text-sm font-light text-[var(--m-muted)] leading-relaxed">
          <p>
            We use essential cookies to keep you signed in, remember your cart, and process
            checkout securely. We also use cookies to understand site usage and improve the
            shopping experience.
          </p>
          <p>
            By continuing to browse, or by accepting cookies via the banner shown on your first
            visit, you consent to this use. You can clear cookies at any time through your browser
            settings.
          </p>
          <p>
            By placing an order, you confirm you have read and agree to this Cookie Policy and to
            our Terms &amp; Conditions.
          </p>
        </div>
      </section>

      {/* Legal & Terms */}
      <section className="mb-10">
        <h2 className="m-label text-[var(--m-gold)] mb-4 uppercase tracking-widest">
          Legal &amp; Terms
        </h2>
        <div className="space-y-3 text-sm font-light text-[var(--m-muted)] leading-relaxed">
          <p>Site content is protected by applicable intellectual property laws.</p>
          <p>
            By placing an order, you agree to our policies and any terms presented at checkout.
            We may update terms at any time.
          </p>
          <p>
            We are not liable for indirect or consequential damages to the extent permitted by law.
          </p>
          <p>
            Legal enquiries:{" "}
            <a href="mailto:hello@mierabeauty.com" className="text-[var(--m-gold)] hover:underline">
              hello@mierabeauty.com
            </a>.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="mb-4">
        <h2 className="m-label text-[var(--m-gold)] mb-4 uppercase tracking-widest">
          Contact
        </h2>
        <div className="space-y-3 text-sm font-light text-[var(--m-muted)] leading-relaxed">
          <p>
            Questions? Email us at{" "}
            <a href="mailto:hello@mierabeauty.com" className="text-[var(--m-gold)] hover:underline">
              hello@mierabeauty.com
            </a>.
          </p>
          <p className="text-[var(--m-subtle)]">Last updated: July 10, 2026</p>
        </div>
      </section>
    </section>
  );
}
