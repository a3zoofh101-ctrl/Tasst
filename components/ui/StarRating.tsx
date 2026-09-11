import { IconStar } from "@/components/icons";
import { cx } from "@/lib/utils";

export default function StarRating({
  rating,
  size = "sm"
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar
          key={i}
          className={cx(dims, i <= Math.round(rating) ? "text-gold" : "text-line")}
        />
      ))}
    </div>
  );
}
