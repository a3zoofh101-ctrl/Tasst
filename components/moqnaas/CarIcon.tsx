import { CarId } from "@/lib/moqnaas/types";

export default function CarIcon({ carId, className }: { carId: CarId; className?: string }) {
  if (carId === "landcruiser") {
    return (
      <svg viewBox="0 0 220 110" className={className} aria-hidden>
        <ellipse cx="110" cy="92" rx="95" ry="10" fill="#000" opacity="0.18" />
        <path
          d="M20 78 L28 42 L52 24 L150 24 L176 46 L198 60 L198 78 Z"
          fill="#e9e4d8"
          stroke="#8a8371"
          strokeWidth="2"
        />
        <path d="M62 30 L72 46 L128 46 L142 30 Z" fill="#9ecbe0" opacity="0.75" />
        <rect x="16" y="66" width="186" height="16" rx="4" fill="#8a8371" />
        <rect x="170" y="52" width="26" height="18" rx="3" fill="#b3763b" />
        <circle cx="56" cy="86" r="16" fill="#1c1a16" />
        <circle cx="56" cy="86" r="7" fill="#5c5648" />
        <circle cx="164" cy="86" r="16" fill="#1c1a16" />
        <circle cx="164" cy="86" r="7" fill="#5c5648" />
      </svg>
    );
  }
  if (carId === "gmc") {
    return (
      <svg viewBox="0 0 220 110" className={className} aria-hidden>
        <ellipse cx="110" cy="92" rx="95" ry="10" fill="#000" opacity="0.18" />
        <path
          d="M14 80 L20 40 L44 22 L168 22 L192 42 L206 60 L206 80 Z"
          fill="#c8b48a"
          stroke="#6b5a3c"
          strokeWidth="2"
        />
        <path d="M54 28 L62 44 L156 44 L166 28 Z" fill="#9ecbe0" opacity="0.7" />
        <rect x="10" y="68" width="196" height="18" rx="4" fill="#6b5a3c" />
        <rect x="176" y="50" width="26" height="20" rx="3" fill="#7a3b2e" />
        <circle cx="52" cy="88" r="17" fill="#1c1a16" />
        <circle cx="52" cy="88" r="7" fill="#5c5648" />
        <circle cx="172" cy="88" r="17" fill="#1c1a16" />
        <circle cx="172" cy="88" r="7" fill="#5c5648" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 110" className={className} aria-hidden>
      <ellipse cx="110" cy="92" rx="90" ry="9" fill="#000" opacity="0.18" />
      <path
        d="M24 78 L30 50 L48 34 L146 34 L168 50 L192 62 L192 78 Z"
        fill="#d7d2c4"
        stroke="#9a8f6f"
        strokeWidth="2"
      />
      <path d="M58 38 L66 50 L134 50 L144 38 Z" fill="#9ecbe0" opacity="0.75" />
      <rect x="20" y="68" width="176" height="14" rx="4" fill="#9a8f6f" />
      <rect x="166" y="56" width="22" height="16" rx="3" fill="#25543a" />
      <circle cx="58" cy="86" r="14" fill="#1c1a16" />
      <circle cx="58" cy="86" r="6" fill="#5c5648" />
      <circle cx="156" cy="86" r="14" fill="#1c1a16" />
      <circle cx="156" cy="86" r="6" fill="#5c5648" />
    </svg>
  );
}
