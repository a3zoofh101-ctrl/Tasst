import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  ListOrdered,
  Wallet,
  LifeBuoy,
  type LucideIcon
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/services", label: "الخدمات", icon: ShoppingBag },
  { href: "/dashboard/new-order", label: "طلب جديد", icon: PlusCircle },
  { href: "/dashboard/orders", label: "طلباتي", icon: ListOrdered },
  { href: "/dashboard/wallet", label: "المحفظة", icon: Wallet },
  { href: "/dashboard/support", label: "الدعم الفني", icon: LifeBuoy }
];
