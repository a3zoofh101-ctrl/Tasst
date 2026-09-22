import Link from "next/link";
import { Landmark, TrendingDown, Plus } from "lucide-react";
import { formatMoney } from "@/lib/smm/money";

// Persistent wallet card shown at the top of every dashboard page — so a
// user browsing services always sees what they have to spend without a
// trip to the wallet page first. One gradient hero card (not two flat
// boxes) so it reads as the page's focal point, not just another stat tile.
export function AccountSummary({ balance, totalSpent }: { balance: string; totalSpent: string }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-brand-gradient p-5 text-white shadow-glowLg">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/70">رصيد الحساب</p>
          <p className="mt-1 truncate text-3xl font-extrabold">{formatMoney(balance)}</p>
        </div>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Landmark className="size-6" />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3 text-sm">
        <span className="flex items-center gap-1.5 text-white/80">
          <TrendingDown className="size-4" />
          إجمالي الإنفاق: <span className="font-bold text-white">{formatMoney(totalSpent)}</span>
        </span>
        <Link href="/dashboard/wallet" className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/25">
          إضافة رصيد
          <Plus className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
