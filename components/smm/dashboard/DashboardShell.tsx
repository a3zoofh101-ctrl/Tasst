import { Sidebar } from "@/components/smm/dashboard/Sidebar";
import { MobileNav } from "@/components/smm/dashboard/MobileNav";
import { NotificationBell, type NotificationDto } from "@/components/smm/dashboard/NotificationBell";
import { UserMenu } from "@/components/smm/dashboard/UserMenu";
import { AccountSummary } from "@/components/smm/dashboard/AccountSummary";
import { ThemeToggle } from "@/components/smm/ui/ThemeToggle";
import { Logo } from "@/components/smm/ui/Logo";
import { MobileDrawer } from "@/components/smm/ui/MobileDrawer";

export function DashboardShell({
  name,
  email,
  isAdmin,
  balance,
  totalSpent,
  notifications,
  unreadCount,
  children
}: {
  name: string;
  email: string;
  isAdmin: boolean;
  balance: string;
  totalSpent: string;
  notifications: NotificationDto[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border2 bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <MobileDrawer variant="dashboard" isAdmin={isAdmin} name={name} email={email} balance={balance} logoSubtitle="لوحة العميل" />
            <Logo size="sm" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
            <UserMenu name={name} email={email} />
          </div>
        </header>
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:pb-8">
          <div className="mb-5">
            <AccountSummary balance={balance} totalSpent={totalSpent} />
          </div>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
