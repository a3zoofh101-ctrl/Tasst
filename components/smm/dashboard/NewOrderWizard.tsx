"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { CheckCircle2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/smm/ui/Input";
import { Dialog, DialogContent, DialogClose } from "@/components/smm/ui/Dialog";
import { createOrderAction } from "@/lib/smm/actions/orders";
import { formatMoney, formatNumber } from "@/lib/smm/money";

export type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  platformId: string;
  categoryName: string;
  pricePer1000: string;
  minQuantity: number;
  maxQuantity: number;
  refill: boolean;
  averageTime: string | null;
};

export function NewOrderWizard({
  platforms,
  services,
  balance
}: {
  platforms: { id: string; name: string }[];
  services: ServiceOption[];
  balance: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = services.find((s) => s.id === searchParams.get("serviceId"));

  const [platformId, setPlatformId] = useState(preselected?.platformId ?? platforms[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(preselected?.id ?? "");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ link?: string; quantity?: string }>({});
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [success, setSuccess] = useState<{ orderId: string } | null>(null);

  const platformServices = useMemo(() => services.filter((s) => s.platformId === platformId), [services, platformId]);
  // Falls back to the platform's first service whenever the selected one
  // doesn't belong to the current platform, without needing an effect.
  const effectiveServiceId = platformServices.some((s) => s.id === serviceId) ? serviceId : (platformServices[0]?.id ?? "");
  const service = services.find((s) => s.id === effectiveServiceId);

  function handlePlatformChange(nextPlatformId: string) {
    setPlatformId(nextPlatformId);
    setServiceId(services.find((s) => s.platformId === nextPlatformId)?.id ?? "");
  }

  const qtyNum = Number(quantity);
  const total = service && qtyNum > 0 ? new Decimal(qtyNum).dividedBy(1000).times(service.pricePer1000).toDecimalPlaces(2) : null;
  const insufficientBalance = total ? total.greaterThan(balance) : false;

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
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="platform">المنصة</Label>
          <Select id="platform" value={platformId} onChange={(e) => handlePlatformChange(e.target.value)}>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="service">الخدمة</Label>
          <Select id="service" value={effectiveServiceId} onChange={(e) => setServiceId(e.target.value)}>
            {platformServices.length === 0 && <option value="">لا توجد خدمات متاحة لهذه المنصة</option>}
            {platformServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.categoryName}
              </option>
            ))}
          </Select>
        </div>

        {service && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface2 p-3 text-sm sm:grid-cols-4">
            <Info label="السعر / 1000" value={`${service.pricePer1000} ر.س`} />
            <Info label="الحد الأدنى" value={formatNumber(service.minQuantity)} />
            <Info label="الحد الأعلى" value={formatNumber(service.maxQuantity)} />
            <Info label="الوقت المتوقع" value={service.averageTime ?? "—"} />
          </div>
        )}

        {service?.description && <p className="text-xs text-muted">{service.description}</p>}

        <div>
          <Label htmlFor="link">الرابط أو اسم المستخدم</Label>
          <Textarea
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://... أو @username"
            rows={2}
          />
          <FieldError>{errors.link}</FieldError>
        </div>

        <div>
          <Label htmlFor="quantity">الكمية</Label>
          <Input
            id="quantity"
            type="number"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={service ? `${service.minQuantity} - ${service.maxQuantity}` : ""}
          />
          <FieldError>{errors.quantity}</FieldError>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border2 p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Wallet className="size-4" /> رصيدك: {formatMoney(balance)}
          </div>
          <div className="text-left">
            <p className="text-xs text-muted">الإجمالي</p>
            <p className="text-xl font-extrabold text-fg">{total ? formatMoney(total.toFixed(2)) : "—"}</p>
          </div>
        </div>

        {insufficientBalance && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
            رصيدك الحالي لا يكفي لإتمام هذا الطلب.
          </p>
        )}

        <Button
          className="w-full"
          disabled={!service || insufficientBalance}
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className="font-semibold text-fg">{value}</p>
    </div>
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
