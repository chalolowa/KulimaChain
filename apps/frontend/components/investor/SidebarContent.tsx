"use client";

import { LayoutDashboard, Landmark, Handshake, Coins, User, BarChart, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

export default function SidebarContent() {
  const pathname = usePathname();
  const navItems = [
    { href: "/investor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/investor/marketplace", icon: Landmark, label: "Marketplace" },
    { href: "/investor/bids", icon: Handshake, label: "My Bids" },
    { href: "/investor/tokens", icon: Coins, label: "My Tokens" },
    { href: "/investor/profile", icon: User, label: "Profile" }
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