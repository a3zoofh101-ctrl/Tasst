import { NextResponse, type NextRequest } from "next/server";
import { findOrdersDueForSync, syncOrderStatus } from "@/lib/smm/order-sync";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  const query = request.nextUrl.searchParams.get("secret");
  return query === secret;
}

// Polls in-flight orders and refreshes their status from the provider.
// Meant to be invoked by a scheduled job (cron / Vercel Cron / systemd
// timer), never by the browser — protected by CRON_SECRET only.
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await findOrdersDueForSync(100);

  let succeeded = 0;
  let failed = 0;
  const errors: { orderId: string; message: string }[] = [];

  for (const order of orders) {
    try {
      await syncOrderStatus(order.id);
      succeeded++;
    } catch (err) {
      failed++;
      errors.push({ orderId: order.id, message: err instanceof Error ? err.message : "unknown error" });
    }
  }

  return NextResponse.json({ checked: orders.length, succeeded, failed, errors });
}

export const POST = GET;
