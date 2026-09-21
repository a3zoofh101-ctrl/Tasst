import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthCard({
  title,
  description,
  children,
  footer
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/smm" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Sparkles className="size-5" />
          </span>
          <span className="text-xl font-extrabold text-fg">تَسّت</span>
        </Link>
        <div className="rounded-2xl border border-border2 bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-fg">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
