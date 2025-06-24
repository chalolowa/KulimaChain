"use client";

import {
  Coins,
  LandPlot,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export default function SidebarContent() {
  const pathname = usePathname();
  const navItems = [
    { href: "/farmer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/farmer/tokenization", icon: LandPlot, label: "Tokenization" },
    { href: "/farmer/insurance", icon: ShieldCheck, label: "Insurance" },
    { href: "/farmer/selling", icon: Coins, label: "Tokens Market" },
    { href: "/farmer/profile", icon: User, label: "Profile" }
  ];

  return (
    <div className="p-4 flex flex-col h-[calc(100vh-65px)]">
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
