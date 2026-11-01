import { Gift, LayoutDashboard, Trophy, User, Users, Wallet } from "lucide-react";

export const dashboardNav = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/accounts", key: "accounts", icon: Wallet },
  { href: "/dashboard/pass", key: "pass", icon: Trophy },
  { href: "/dashboard/payouts", key: "payouts", icon: Gift },
  { href: "/dashboard/referrals", key: "referrals", icon: Users },
  { href: "/dashboard/profile", key: "profile", icon: User },
] as const;
