import { Logo } from "@/components/smm/ui/Logo";

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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-10">
      <div className="smm-mesh" />

      <div className="w-full max-w-md">
        <div className="animate-fadeUp mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="smm-glass animate-fadeUp rounded-2xl p-6 shadow-sm sm:p-8 [animation-delay:80ms]">
          <h1 className="text-xl font-bold text-fg">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="animate-fadeUp mt-6 text-center text-sm text-muted [animation-delay:160ms]">{footer}</div>}
      </div>
    </div>
  );
}
