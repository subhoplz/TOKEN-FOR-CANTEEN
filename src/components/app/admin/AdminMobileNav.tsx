
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, UtensilsCrossed } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import Link from "next/link";
import { useState } from "react";

export default function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
            <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                <span className="sr-only">SmartCanteen</span>
            </Link>
            <div className="ml-auto">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-full max-w-[280px]">
                        <AdminSidebar className="flex !sticky !h-auto border-none" />
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
