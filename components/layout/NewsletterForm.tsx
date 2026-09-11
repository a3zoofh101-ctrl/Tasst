"use client";

export default function NewsletterForm({
  placeholder,
  cta
}: {
  placeholder: string;
  cta: string;
}) {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
      <input
        type="email"
        required
        placeholder={placeholder}
        className="flex-1 min-w-0 rounded-full bg-cream/10 border border-cream/25 px-4 py-2.5 text-sm placeholder:text-cream/40 outline-none focus:border-gold"
      />
      <button
        type="submit"
        className="rounded-full bg-gold px-4 py-2.5 text-sm font-semibold shrink-0 hover:bg-gold-dark transition-colors"
      >
        {cta}
      </button>
    </form>
  );
}
