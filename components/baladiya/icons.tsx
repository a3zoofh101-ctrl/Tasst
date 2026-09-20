import { SVGProps } from "react";

export function IconEmblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M24 12c-2.6 3-4 6.6-4 10.4 0 4.4 1.7 8.2 4 10.6 2.3-2.4 4-6.2 4-10.6 0-3.8-1.4-7.4-4-10.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M24 22.4V33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M14 33h20M16 29.5c3-1.2 5.4-1.8 8-1.8s5 .6 8 1.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <path
        d="M12 3.5 5 6v5.4c0 4.6 3 7.9 7 9.1 4-1.2 7-4.5 7-9.1V6l-7-2.5Z"
        strokeLinejoin="round"
      />
      <path d="m9 12 2.2 2.2L15.5 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBuildings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <path d="M4 21V8.5L10 5v16" strokeLinejoin="round" />
      <path d="M10 9h10v12H10" strokeLinejoin="round" />
      <path d="M13 12.5h1M13 15.5h1M13 18.5h1M17 12.5h1M17 15.5h1M17 18.5h1M6.5 11h1M6.5 14h1M6.5 17h1" strokeLinecap="round" />
    </svg>
  );
}

export function IconCoins(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <ellipse cx="9" cy="7" rx="5.5" ry="3" />
      <path d="M3.5 7v4c0 1.66 2.46 3 5.5 3s5.5-1.34 5.5-3V7" />
      <path d="M3.5 11v4c0 1.66 2.46 3 5.5 3s5.5-1.34 5.5-3v-4" />
      <ellipse cx="16" cy="14.5" rx="4.5" ry="2.5" />
      <path d="M11.5 14.5v3c0 1.38 2.01 2.5 4.5 2.5s4.5-1.12 4.5-2.5v-3" />
    </svg>
  );
}

export function IconChartLine(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <path d="M4 20V4" strokeLinecap="round" />
      <path d="M4 20h16" strokeLinecap="round" />
      <path d="M6.5 16 11 10.5l3 3 5-6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 6h3.5v3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconGlobe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.3 3.7 5.2 3.7 8.5s-1.3 6.2-3.7 8.5c-2.4-2.3-3.7-5.2-3.7-8.5S9.6 5.8 12 3.5Z" />
    </svg>
  );
}

export function IconMail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPhone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path
        d="M6.5 3.5c1 0 2.6 2.3 2.6 3.3s-1.4 1.8-1.4 2.7c0 1.8 3 4.8 4.8 4.8.9 0 1.8-1.4 2.7-1.4 1 0 3.3 1.6 3.3 2.6 0 1.4-1.8 3-3.1 3-3.9 0-9.4-5.5-9.4-9.4 0-1.3 1.6-3.1 3-3.1Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMapPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function IconTwitterX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.6 10.6 20 3.8h-2l-5.5 5.9L8 3.8H3.5l6.7 9.2-6.7 7h2l5.9-6.3 4.8 6.3H20l-6.4-9.4Zm-2.1 2.3-.7-.9L5.9 5h1.9l4.4 6 .7.9 5.7 7.8h-1.9l-4.6-6.8Z" />
    </svg>
  );
}

export function IconInstagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
