import { Building2, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function SidebarContent() {
    const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/authorities", icon: Building2, label: "Authorities" },
    { href: "/admin/users", icon: User, label: "Users" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
