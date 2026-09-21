import { NextRequest, NextResponse } from "next/server";
import { completeRedirectDeposit } from "@/lib/smm/payments/complete";

export const dynamic = "force-dynamic";

// Register this URL in the Moyasar dashboard as:
//   https://your-domain.com/api/payments/moyasar/webhook?token=<MOYASAR_WEBHOOK_SECRET>
// The token only guards against noise/abuse — the actual money-moving
// decision always comes from completeRedirectDeposit()'s own authenticated
// re-check against Moyasar's API, never from this request's body, so a
// forged call here can trigger a legitimate re-check at worst, never a
// fraudulent credit.
export async function POST(request: NextRequest) {
  const expectedToken = process.env.MOYASAR_WEBHOOK_SECRET;
  if (expectedToken && request.nextUrl.searchParams.get("token") !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const paymentId: string | undefined = body?.data?.id ?? body?.id;
  if (!paymentId) {
    return NextResponse.json({ error: "Malformed webhook payload" }, { status: 400 });
  }

  try {
    await completeRedirectDeposit(paymentId);
  } catch (err) {
    console.error("Moyasar webhook processing failed", err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
