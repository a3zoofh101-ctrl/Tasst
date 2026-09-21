import Link from "next/link";
import { Landmark, TrendingDown } from "lucide-react";
import { formatMoney } from "@/lib/smm/money";

// Persistent balance/spending pair shown at the top of every dashboard
// page — so a user browsing services always sees what they have to spend
// without a trip to the wallet page first.
export function AccountSummary({ balance, totalSpent }: { balance: string; totalSpent: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/dashboard/wallet"
        className="flex items-center gap-3 rounded-2xl border border-border2 bg-surface p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-700"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
          <Landmark className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">رصيد الحساب</p>
          <p className="truncate text-lg font-bold text-fg">{formatMoney(balance)}</p>
        </div>
      </Link>

      <div className="flex items-center gap-3 rounded-2xl border border-border2 bg-surface p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-dark dark:text-accent">
          <TrendingDown className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">إجمالي الإنفاق</p>
          <p className="truncate text-lg font-bold text-fg">{formatMoney(totalSpent)}</p>
        </div>
      </div>
    </div>
  );
}
