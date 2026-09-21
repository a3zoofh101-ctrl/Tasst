import { NextRequest, NextResponse } from "next/server";
import { completeRedirectDeposit } from "@/lib/smm/payments/complete";

export const dynamic = "force-dynamic";

// The browser lands here after the customer finishes (or abandons) the
// Moyasar-hosted payment page. Moyasar appends its own status to the
// query string, but we never trust that directly — only the `id` is used
// to look up the payment, and completeRedirectDeposit() re-verifies the
// real status via an authenticated call to Moyasar before crediting
// anything. This is a convenience for the user (instant feedback); the
// webhook is the reliable path if the browser is closed before landing here.
export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("id");
  const redirectTo = new URL("/dashboard/wallet", request.url);

  if (!paymentId) {
    redirectTo.searchParams.set("payment", "error");
    return NextResponse.redirect(redirectTo);
  }

  try {
    const payment = await completeRedirectDeposit(paymentId);
    const outcome = payment?.status === "SUCCEEDED" ? "success" : payment?.status === "FAILED" ? "failed" : "pending";
    redirectTo.searchParams.set("payment", outcome);
  } catch (err) {
    console.error("Moyasar callback verification failed", err);
    redirectTo.searchParams.set("payment", "error");
  }

  return NextResponse.redirect(redirectTo);
}
