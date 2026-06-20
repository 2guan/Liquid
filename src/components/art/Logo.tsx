import { useId } from "react";

/**
 * The Sip & Sigh emblem — a brass medallion enclosing a drop & a glass.
 * Used in the sidebar header and the loading veil.
 */
export default function LogoMark({ size = 44 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="The Sip & Sigh">
      <defs>
        <radialGradient id={`lg-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F0B14B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D89C3A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`lr-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3C684" />
          <stop offset="100%" stopColor="#A88945" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#lg-${uid})`} />
      <circle cx="32" cy="32" r="29" fill="none" stroke={`url(#lr-${uid})`} strokeWidth="1.4" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="#C8A45D" strokeOpacity="0.45" strokeWidth="0.8" />
      {/* drop */}
      <path
        d="M32 14c0 0 9 11 9 17a9 9 0 0 1-18 0c0-6 9-17 9-17z"
        fill="none"
        stroke="#E3C684"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* inner liquid */}
      <path d="M25 33a7 7 0 0 0 14 0c0-1.4-.4-2.9-1-4.4H26c-.6 1.5-1 3-1 4.4z" fill="#D89C3A" fillOpacity="0.55" />
      {/* base bar line */}
      <path d="M20 46h24" stroke="#C8A45D" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 49h16" stroke="#C8A45D" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
