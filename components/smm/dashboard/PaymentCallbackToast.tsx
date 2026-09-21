"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, { fn: typeof toast.success; text: string }> = {
  success: { fn: toast.success, text: "تم تأكيد الدفع وإضافة الرصيد بنجاح" },
  failed: { fn: toast.error, text: "فشلت عملية الدفع، لم يُخصم أي مبلغ" },
  pending: { fn: toast.info, text: "الدفع قيد المعالجة، سيتم إضافة الرصيد فور التأكيد" },
  error: { fn: toast.error, text: "تعذّر تأكيد حالة الدفع" }
};

// Reads the ?payment= outcome the Moyasar callback route redirects back
// with, shows a toast once, then strips the query param so a refresh
// doesn't repeat it. The actual wallet balance always comes from the
// server-rendered page below, not from this param.
export function PaymentCallbackToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const outcome = searchParams.get("payment");

  useEffect(() => {
    if (!outcome) return;
    const cfg = MESSAGES[outcome];
    if (cfg) cfg.fn(cfg.text);
    router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  return null;
}
