"use client";

import { colorNameToSwatchClassName } from "@/lib/hairCustomization";

export default function ColorSwatchButton({
  name,
  active,
  onClick,
  disabled = false,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={disabled ? `Color ${name} — coming soon` : `Color ${name}`}
      aria-pressed={active}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      title={disabled ? `${name} — coming soon` : name}
      className={[
        "w-8 h-8 rounded-full ring-1 relative",
        disabled
          ? "opacity-30 grayscale cursor-not-allowed"
          : active
            ? "ring-[var(--m-gold)] ring-2"
            : "ring-gray-300",
        colorNameToSwatchClassName(name) ?? "bg-gray-300",
      ].join(" ")}
    />
  );
}
