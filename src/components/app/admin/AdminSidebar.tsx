
"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Button } from "@/components/ui/button";
import { BarChart, Cog, HardDrive, Home, LogOut, Newspaper, QrCode, Ticket, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
    {
        href: "/admin",
        icon: Home,
        label: "Dashboard"
    },
    {
        href: "/admin/employees",
        icon: Users,
        label: "Employees"
    },
    {
        label: "Management",
        isTitle: true,
    },
     {
        href: "/admin/tokens",
        icon: Ticket,
        label: "Token Management"
    },
    {
        href: "/admin/menu",
        icon: Newspaper,
        label: "Menu Management"
    },
    {
        href: "/admin/reports",
        icon: BarChart,
        label: "Reports & Analytics"
    },
    {
        label: "Tools",
        isTitle: true,
    },
    {
        href: "/vendor",
        icon: QrCode,
        label: "Offline QR Validator"
    },
    {
        href: "/admin/offline-logs",
        icon: HardDrive,
        label: "Offline Sync Logs"
    },
     {
        label: "System",
        isTitle: true,
    },
    {
        href: "/admin/settings",
        icon: Cog,
        label: "Settings"
    }
]


export default function AdminSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { logout } = useCanteenPass();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    }
    
    return (
       <aside className={cn("h-screen sticky top-0 border-r bg-card hidden md:flex flex-col w-64", className)}>
           <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                         <UtensilsCrossed className="h-6 w-6 text-primary" />
                         <span className="">SmartCanteen</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {menuItems.map((item, index) => (
                             item.isTitle ? (
                                <h3 key={index} className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">{item.label}</h3>
                             ) : (
                                <Link
                                    key={index}
                                    href={item.href || '#'}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"}`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        ))}
                    </nav>
                </div>
                 <div className="mt-auto p-4">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
           </div>
       </aside>
    )
}
