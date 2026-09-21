import { Sidebar } from "@/components/smm/dashboard/Sidebar";
import { MobileNav } from "@/components/smm/dashboard/MobileNav";
import { NotificationBell, type NotificationDto } from "@/components/smm/dashboard/NotificationBell";
import { UserMenu } from "@/components/smm/dashboard/UserMenu";
import { ThemeToggle } from "@/components/smm/ui/ThemeToggle";
import { Logo } from "@/components/smm/ui/Logo";

export function DashboardShell({
  name,
  email,
  isAdmin,
  notifications,
  unreadCount,
  children
}: {
  name: string;
  email: string;
  isAdmin: boolean;
  notifications: NotificationDto[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border2 bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
            <UserMenu name={name} email={email} />
          </div>
        </header>
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
