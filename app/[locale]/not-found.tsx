import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x section-y min-h-[50vh] flex flex-col items-center justify-center text-center gap-4">
      <p className="font-latin text-5xl text-gold-dark">404</p>
      <p className="text-ink/60">Page not found</p>
      <Link href="/" className="btn-primary">
        Home
      </Link>
    </div>
  );
}
