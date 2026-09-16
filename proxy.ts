import { NextRequest, NextResponse } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

const standaloneRoutes = ["/moqnaas"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStandalone = standaloneRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isStandalone) return;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"]
};
