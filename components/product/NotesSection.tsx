import { Locale, ProductNotes } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/utils";

export default function NotesSection({ notes, locale }: { notes: ProductNotes; locale: Locale }) {
  const dict = getDictionary(locale);
  const groups = [
    { label: dict.product.topNotes, items: notes.top },
    { label: dict.product.heartNotes, items: notes.heart },
    { label: dict.product.baseNotes, items: notes.base }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
      {groups.map((g) => (
        <div key={g.label} className="card-surface p-5 text-center">
          <p className="eyebrow mb-3">{g.label}</p>
          <p className="text-ink font-semibold text-sm leading-relaxed">
            {g.items.map((n) => t(n, locale)).join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}
