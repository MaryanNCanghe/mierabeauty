// src/app/maintenance/page.tsx

type Tip = { title: string; body: string };
type Section = { label: string; heading: string; tips: Tip[] };

const SECTIONS: Section[] = [
  {
    label: "Lifespan",
    heading: "How Long Your Hair Lasts",
    tips: [
      {
        title: "6–12 months, with the right routine",
        body: "Quality human hair holds up beautifully when it's cared for properly — the same bundle that lasts a year in the right hands can wear thin in a few months without one.",
      },
      {
        title: "The cuticle is what you're protecting",
        body: "Our hair is cuticle-intact and aligned in one direction, which is what keeps it soft and tangle-free — heat, friction, and harsh product are what wear that protection down over time.",
      },
    ],
  },
  {
    label: "Washing",
    heading: "Washing",
    tips: [
      {
        title: "Less is more",
        body: "Clip-ins and ponytails only need washing after 15–20 wears. Tape-ins, wefts, and closures installed longer-term should be washed every 1–2 weeks — over-washing dries hair out faster than anything else.",
      },
      {
        title: "Brush first, always",
        body: "Detangle gently from ends to roots before any water touches the hair — wet hair is at its most fragile, and brushing it out first prevents matting in the shower.",
      },
      {
        title: "Lukewarm water, sulfate-free everything",
        body: "Hot water strips shine and colour. Use a sulfate-free, alcohol-free shampoo, smoothed downward in the direction of the cuticle — never scrubbed, rubbed, or twisted.",
      },
      {
        title: "Condition mid-length to ends",
        body: "Keep conditioner away from the bonds, clips, or wefts themselves — buildup at the root is what causes slipping and shedding.",
      },
    ],
  },
  {
    label: "Drying",
    heading: "Drying & Overnight Care",
    tips: [
      {
        title: "Dry before bed",
        body: "If you wash at night, blow-dry to at least 80% before sleeping — hair left damp for hours is far more prone to tangling and matting.",
      },
      {
        title: "Sleep on silk or satin",
        body: "A silk or satin pillowcase (or a loose braid wrapped in a scarf) causes far less friction overnight than cotton, which is one of the simplest ways to add months to your hair's life.",
      },
    ],
  },
  {
    label: "Heat Styling",
    heading: "Curling, Straightening & Your Babyliss",
    tips: [
      {
        title: "Real human hair takes heat — synthetic doesn't",
        body: "This is one of the real advantages of 100% human hair: you can curl, straighten, and style it just like your own. Synthetic fibers melt; ours doesn't.",
      },
      {
        title: "Protect it every time",
        body: "Apply a heat protectant before every session with a babyliss, wand, or flat iron — no exceptions, even for a quick touch-up.",
      },
      {
        title: "Stay under 180°C (356°F)",
        body: "Higher temperatures are rarely necessary and shorten your hair's lifespan fast. Keep the tool away from the wefts, clips, or bonds themselves — style the length, not the attachment point.",
      },
      {
        title: "1–2 times a week is plenty",
        body: "Reserve heat styling for when you actually need it. The less frequently you reach for hot tools, the longer the shine and movement last.",
      },
    ],
  },
];

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[var(--m-white)] mt-20">
      <header className="w-full px-4 sm:px-6 lg:px-16 pt-10 pb-10">
        <span className="m-label text-[var(--m-gold)]">Care Guide</span>
        <h1 className="font-display text-2xl md:text-3xl font-light mt-2 text-[var(--m-black)]">
          Hair Maintenance
        </h1>
        <p className="z-label-1 mt-3 max-w-xl text-[var(--m-muted)]">
          Real, ethically-sourced human hair rewards a little care. Here&apos;s how to keep
          yours soft, tangle-free, and radiant for as long as possible.
        </p>
      </header>

      <div className="px-4 sm:px-6 lg:px-16 pb-24 max-w-3xl">
        {SECTIONS.map((section, i) => (
          <section
            key={section.label}
            className={`py-10 ${i > 0 ? "border-t border-[var(--m-black)]/10" : ""}`}
          >
            <span className="m-label text-[var(--m-gold)]">{section.label}</span>
            <h2 className="font-display text-xl md:text-2xl font-light mt-2 mb-6 text-[var(--m-black)]">
              {section.heading}
            </h2>
            <div className="flex flex-col gap-5">
              {section.tips.map((tip) => (
                <div key={tip.title} className="flex flex-col gap-1.5">
                  <h3 className="m-title-sm text-[var(--m-black)]">{tip.title}</h3>
                  <p className="text-[var(--m-muted)] text-sm font-light leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
