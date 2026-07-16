export default function CrownIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 48 30"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 26 L2 8 L12 16 L18 4 L24 14 L30 4 L36 16 L46 8 L44 26 Z"
        fill="var(--m-gold)"
      />
      <rect x="2" y="26" width="44" height="3" rx="1" fill="var(--m-gold)" />
    </svg>
  );
}
