import { prisma } from "@/lib/smm/db/prisma";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { SettingsForm } from "@/components/smm/admin/SettingsForm";
import { ChangePasswordForm } from "@/components/smm/admin/ChangePasswordForm";

const DEFAULTS = {
  siteName: "بوست",
  supportEmail: "support@tasst.local",
  minDepositAmount: "10",
  maxDepositAmount: "50000"
};

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted">إعدادات عامة للمنصة</p>
      </div>

      <Card>
        <CardContent>
          <SettingsForm
            defaults={{
              siteName: String(map.siteName ?? DEFAULTS.siteName),
              supportEmail: String(map.supportEmail ?? DEFAULTS.supportEmail),
              minDepositAmount: String(map.minDepositAmount ?? DEFAULTS.minDepositAmount),
              maxDepositAmount: String(map.maxDepositAmount ?? DEFAULTS.maxDepositAmount)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-1 font-bold text-fg">تغيير كلمة المرور</h2>
          <p className="mb-4 text-sm text-muted">غيّر كلمة مرور حسابك الحالي (غيّرها فورًا إذا كنت لسا تستخدم كلمة المرور الافتراضية)</p>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
