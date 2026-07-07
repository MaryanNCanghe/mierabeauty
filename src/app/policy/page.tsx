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
            We process orders within <strong className="text-[var(--m-black)]">1 to 2 business days</strong>. Delivery
            usually takes <strong className="text-[var(--m-black)]">3 to 7 business days</strong>.
          </p>
          <p>
            Tracking will be emailed once your order ships. Times may vary due to
            carrier delays or peak seasons.
          </p>
          <p>
            Shipping rates are calculated at checkout. Free shipping thresholds
            (if any) are shown at checkout.
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
            Returns accepted within <strong className="text-[var(--m-black)]">30 days</strong> for unopened items in
            original packaging (unless Final Sale).
          </p>
          <p>
            Start a return by emailing{" "}
            <a href="mailto:hello@mierabeauty.com" className="text-[var(--m-gold)] hover:underline">
              hello@mierabeauty.com
            </a>. Refunds processed within{" "}
            <strong className="text-[var(--m-black)]">5 to 10 business days</strong> after inspection.
          </p>
          <p>
            Shipping fees are non-refundable unless the item was defective. Exchanges are subject
            to stock availability.
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
          <p className="text-[var(--m-subtle)]">Last updated: January 6, 2026</p>
        </div>
      </section>
    </section>
  );
}
