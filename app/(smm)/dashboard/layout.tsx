import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { DashboardShell } from "@/components/smm/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const [unreadCount, notifications, wallet, spent] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.wallet.findUnique({ where: { userId: user.id } }),
    prisma.walletTransaction.aggregate({
      where: { wallet: { userId: user.id }, type: "PURCHASE" },
      _sum: { amount: true }
    })
  ]);

  return (
    <DashboardShell
      name={user.name}
      email={user.email}
      isAdmin={user.role === "ADMIN"}
      balance={(wallet?.balance ?? 0).toString()}
      totalSpent={(spent._sum.amount ?? 0).toString()}
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
    </DashboardShell>
  );
}
