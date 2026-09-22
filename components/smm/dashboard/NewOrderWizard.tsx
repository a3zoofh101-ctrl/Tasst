"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { CheckCircle2, Wallet } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label, Textarea, FieldError } from "@/components/smm/ui/Input";
import { Dialog, DialogContent, DialogClose } from "@/components/smm/ui/Dialog";
import { PlatformIcon } from "@/components/smm/ui/PlatformIcon";
import { ServicePicker } from "@/components/smm/dashboard/ServicePicker";
import { createOrderAction } from "@/lib/smm/actions/orders";
import { formatMoney, formatNumber } from "@/lib/smm/money";

export type ServiceOption = {
  id: string;
  providerRefId: string;
  name: string;
  description: string | null;
  platformId: string;
  categoryId: string;
  categoryName: string;
  pricePer1000: string;
  minQuantity: number;
  maxQuantity: number;
  refill: boolean;
  averageTime: string | null;
  available: boolean;
};

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">{n}</span>
      <Label className="mb-0">{children}</Label>
    </div>
  );
}

export function NewOrderWizard({
  platforms,
  services,
  balance
}: {
  platforms: { id: string; name: string; slug: string }[];
  services: ServiceOption[];
  balance: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = services.find((s) => s.id === searchParams.get("serviceId"));

  const [platformId, setPlatformId] = useState(preselected?.platformId ?? platforms[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(preselected?.categoryId ?? "");
  const [serviceId, setServiceId] = useState(preselected?.id ?? "");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ link?: string; quantity?: string }>({});
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [success, setSuccess] = useState<{ orderId: string } | null>(null);

  const platformServices = useMemo(() => services.filter((s) => s.platformId === platformId), [services, platformId]);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of platformServices) if (!seen.has(s.categoryId)) seen.set(s.categoryId, s.categoryName);
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [platformServices]);

  // Falls back to the platform's first category/service whenever the
  // current selection doesn't belong under the current platform, without
  // needing an effect.
  const effectiveCategoryId = categories.some((c) => c.id === categoryId) ? categoryId : (categories[0]?.id ?? "");
  const categoryServices = useMemo(
    () => platformServices.filter((s) => s.categoryId === effectiveCategoryId),
    [platformServices, effectiveCategoryId]
  );
  const effectiveServiceId = categoryServices.some((s) => s.id === serviceId)
    ? serviceId
    : (categoryServices.find((s) => s.available)?.id ?? categoryServices[0]?.id ?? "");
  const service = services.find((s) => s.id === effectiveServiceId);

  function handlePlatformChange(nextPlatformId: string) {
    setPlatformId(nextPlatformId);
    setCategoryId("");
    setServiceId("");
  }

  function handleCategoryChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setServiceId("");
  }

  const qtyNum = Number(quantity);
  const total = service && qtyNum > 0 ? new Decimal(qtyNum).dividedBy(1000).times(service.pricePer1000).toDecimalPlaces(2) : null;
  const insufficientBalance = total ? total.greaterThan(balance) : false;
  const balanceAfter = total ? new Decimal(balance).minus(total) : null;

  function validate(): boolean {
    const next: typeof errors = {};
    if (!link.trim()) next.link = "أدخل الرابط أو اسم المستخدم";
    if (!service) next.quantity = undefined;
    else if (!qtyNum || qtyNum < service.minQuantity || qtyNum > service.maxQuantity) {
      next.quantity = `الكمية يجب أن تكون بين ${formatNumber(service.minQuantity)} و ${formatNumber(service.maxQuantity)}`;
    }
    setErrors(next);
    return !next.link && !next.quantity;
  }

  async function handleConfirm() {
    if (!service) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("serviceId", service.id);
      formData.set("link", link.trim());
      formData.set("quantity", quantity);
      formData.set("idempotencyKey", idempotencyKey);

      const res = await createOrderAction(formData);
      if (res.ok) {
        setSuccess({ orderId: res.orderId });
        setConfirmOpen(false);
      } else {
        toast.error(res.error);
        setConfirmOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-bg text-success">
            <CheckCircle2 className="size-7" />
          </span>
          <h2 className="text-xl font-bold text-fg">تم إنشاء طلبك بنجاح</h2>
          <p className="text-sm text-muted">سيتم تحديث حالة الطلب تلقائيًا أولًا بأول</p>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => router.push(`/dashboard/orders/${success.orderId}`)}>عرض الطلب</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(null);
                setLink("");
                setQuantity("");
              }}
            >
              طلب آخر
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div>
          <StepLabel n={1}>المنصة</StepLabel>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlatformChange(p.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-colors",
                  platformId === p.id ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" : "border-border2 text-fg hover:border-brand-300 dark:hover:border-brand-700"
                )}
              >
                <PlatformIcon slug={p.slug} size="sm" />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <StepLabel n={2}>نوع الخدمة</StepLabel>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryChange(c.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    effectiveCategoryId === c.id ? "bg-brand-600 text-white" : "bg-surface2 text-muted hover:text-fg"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <StepLabel n={3}>الخدمة</StepLabel>
          {categoryServices.length === 0 ? (
            <p className="rounded-xl border border-border2 p-3 text-center text-sm text-muted">لا توجد خدمات متاحة</p>
          ) : (
            <ServicePicker services={categoryServices} value={effectiveServiceId} onChange={setServiceId} />
          )}
        </div>

        {service?.description && <p className="text-xs text-muted">{service.description}</p>}

        <div>
          <StepLabel n={4}>الرابط أو اسم المستخدم</StepLabel>
          <Textarea
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://... أو @username"
            rows={2}
          />
          <FieldError>{errors.link}</FieldError>
        </div>

        <div>
          <StepLabel n={5}>الكمية</StepLabel>
          <Input
            type="number"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={service ? `${service.minQuantity} - ${service.maxQuantity}` : ""}
          />
          <FieldError>{errors.quantity}</FieldError>
        </div>

        <div className="rounded-xl border border-border2 p-4">
          <p className="mb-2.5 text-xs font-bold text-muted">6. السعر</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">السعر لكل 1000</span>
              <span className="font-medium text-fg">{service ? `${service.pricePer1000} ر.س` : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">الكمية</span>
              <span className="font-medium text-fg">{qtyNum > 0 ? formatNumber(qtyNum) : "—"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border2 pt-1.5">
              <span className="font-semibold text-fg">الإجمالي</span>
              <span className="text-lg font-extrabold text-fg">{total ? formatMoney(total.toFixed(2)) : "—"}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-border2 pt-3 text-sm text-muted">
            <Wallet className="size-4" /> رصيدك الحالي: <span className="font-semibold text-fg">{formatMoney(balance)}</span>
          </div>
        </div>

        {insufficientBalance && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
            رصيدك الحالي لا يكفي لإتمام هذا الطلب.
          </p>
        )}

        {service && !service.available && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
            هذه الخدمة غير متاحة حاليًا، اختر خدمة أخرى.
          </p>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={!service || !service.available || insufficientBalance}
          onClick={() => {
            if (validate()) setConfirmOpen(true);
          }}
        >
          مراجعة الطلب
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent title="تأكيد الطلب" description="تحقق من التفاصيل قبل التأكيد">
            {service && (
              <div className="space-y-2 text-sm">
                <Row label="الخدمة" value={service.name} />
                <Row label="الرابط" value={link} />
                <Row label="الكمية" value={formatNumber(qtyNum)} />
                <Row label="الإجمالي" value={total ? formatMoney(total.toFixed(2)) : "—"} bold />
                <Row label="الرصيد بعد الطلب" value={balanceAfter ? formatMoney(balanceAfter.toFixed(2)) : "—"} />
              </div>
            )}
            <div className="mt-5 flex items-center justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  إلغاء
                </Button>
              </DialogClose>
              <Button loading={submitting} onClick={handleConfirm}>
                تأكيد وإرسال الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border2 py-2 last:border-0">
      <span className="text-muted">{label}</span>
      <span className={bold ? "font-extrabold text-fg" : "font-medium text-fg"}>{value}</span>
    </div>
  );
}
