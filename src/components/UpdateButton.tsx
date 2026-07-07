
// src/components/UpdateButton.tsx
"use client";
import { useState } from "react";

type Props = {
  onClick?: () => Promise<void> | void;
  className?: string;
  children?: React.ReactNode;
};

export default function UpdateButton({ onClick, className, children }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!onClick) return;
    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick ? handleClick : undefined}
      disabled={loading}
      className={className ?? "bg-lama text-white p-2 rounded-md disabled:bg-pink-200 disabled:cursor-not-allowed max-w-96"}
    >
      {loading ? "Updating..." : children ?? "Update"}
    </button>
  );
}
