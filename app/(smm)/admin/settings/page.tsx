import { Card, CardContent } from "@/components/smm/ui/Card";
import { SettingsForm } from "@/components/smm/admin/SettingsForm";
import { ChangePasswordForm } from "@/components/smm/admin/ChangePasswordForm";
import { getSettings } from "@/lib/smm/settings";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted">إعدادات عامة للمنصة</p>
      </div>

      <Card>
        <CardContent>
          <SettingsForm defaults={settings} />
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
