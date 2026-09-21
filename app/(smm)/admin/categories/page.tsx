import { prisma } from "@/lib/smm/db/prisma";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { CreatePlatformForm, CreateCategoryForm, ToggleChip } from "@/components/smm/admin/CatalogForms";

export default async function AdminCategoriesPage() {
  const platforms = await prisma.platform.findMany({
    orderBy: { sortOrder: "asc" },
    include: { categories: { orderBy: { sortOrder: "asc" } }, _count: { select: { services: true } } }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">التصنيفات والمنصات</h1>
        <p className="mt-1 text-sm text-muted">إدارة المنصات (X، إنستغرام، تيك توك...) والتصنيفات داخل كل منصة</p>
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 font-bold text-fg">إضافة منصة جديدة</h2>
          <CreatePlatformForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-3 font-bold text-fg">إضافة تصنيف جديد</h2>
          <CreateCategoryForm platforms={platforms.map((p) => ({ id: p.id, name: p.name }))} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {platforms.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-fg">{p.name}</h3>
              <ToggleChip id={p.id} active={p.active} kind="platform" />
            </div>
            <p className="mt-1 text-xs text-muted">{p._count.services} خدمة</p>
            <ul className="mt-3 space-y-1.5">
              {p.categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg bg-surface2 px-3 py-1.5 text-sm">
                  <span className="text-fg">{c.name}</span>
                  <ToggleChip id={c.id} active={c.active} kind="category" />
                </li>
              ))}
              {p.categories.length === 0 && <li className="text-xs text-muted">لا توجد تصنيفات بعد</li>}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
