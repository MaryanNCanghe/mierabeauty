"use client";

import { colorNameToSwatchClassName } from "@/lib/hairCustomization";

export default function ColorSwatchButton({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Color ${name}`}
      aria-pressed={active}
      onClick={onClick}
      title={name}
      className={[
        "w-8 h-8 rounded-full ring-1",
        active ? "ring-[var(--m-gold)] ring-2" : "ring-gray-300",
        colorNameToSwatchClassName(name) ?? "bg-gray-300",
      ].join(" ")}
    />
  );
}
