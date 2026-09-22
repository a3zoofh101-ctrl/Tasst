import {
  LayoutDashboard,
  Users,
  ListOrdered,
  ShoppingBag,
  Server,
  FolderTree,
  CreditCard,
  Receipt,
  Settings,
  LifeBuoy,
  type LucideIcon
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/orders", label: "الطلبات", icon: ListOrdered },
  { href: "/admin/services", label: "الخدمات", icon: ShoppingBag },
  { href: "/admin/providers", label: "المزودون", icon: Server },
  { href: "/admin/categories", label: "التصنيفات", icon: FolderTree },
  { href: "/admin/support", label: "الدعم الفني", icon: LifeBuoy },
  { href: "/admin/payments", label: "المدفوعات", icon: CreditCard },
  { href: "/admin/transactions", label: "المعاملات", icon: Receipt },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings }
];
