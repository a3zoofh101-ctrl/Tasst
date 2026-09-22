import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { AdminShell } from "@/components/smm/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  const [unreadCount, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  return (
    <AdminShell
      name={user.name}
      email={user.email}
      unreadCount={unreadCount}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString()
      }))}
    >
      {children}
    </AdminShell>
  );
}
