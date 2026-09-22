import { AdminSidebar } from "@/components/smm/admin/AdminSidebar";
import { NotificationBell, type NotificationDto } from "@/components/smm/dashboard/NotificationBell";
import { UserMenu } from "@/components/smm/dashboard/UserMenu";
import { ThemeToggle } from "@/components/smm/ui/ThemeToggle";
import { MobileDrawer } from "@/components/smm/ui/MobileDrawer";

export function AdminShell({
  name,
  email,
  notifications,
  unreadCount,
  children
}: {
  name: string;
  email: string;
  notifications: NotificationDto[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <AdminSidebar />
      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border2 bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <MobileDrawer variant="admin" name={name} email={email} logoSubtitle="إدارة" />
            <span className="text-base font-extrabold text-fg lg:hidden">لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
            <UserMenu name={name} email={email} />
          </div>
        </header>
        <main className="flex-1 px-4 pb-8 pt-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
