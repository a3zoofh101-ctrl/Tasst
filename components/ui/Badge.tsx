import { cx } from "@/lib/utils";

export default function Badge({
  children,
  tone = "dark"
}: {
  children: React.ReactNode;
  tone?: "dark" | "gold" | "maroon";
}) {
  const tones = {
    dark: "bg-ink text-cream",
    gold: "bg-gold text-white",
    maroon: "bg-maroon text-cream"
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-bold tracking-wide",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
