
"use client";

import { Button } from "@/components/ui/button";
import { History, QrCode, UserSquare } from "lucide-react";

interface BottomNavbarProps {
    onPayClick: () => void;
    onHistoryClick: () => void;
    onQrClick: () => void;
}

export default function BottomNavbar({ onPayClick, onHistoryClick, onQrClick }: BottomNavbarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg md:hidden z-50">
            <div className="grid grid-cols-3 h-16">
                <Button variant="ghost" className="flex flex-col h-full rounded-none" onClick={onPayClick}>
                    <QrCode className="h-6 w-6" />
                    <span className="text-xs">Pay</span>
                </Button>
                <Button variant="ghost" className="flex flex-col h-full rounded-none" onClick={onHistoryClick}>
                    <History className="h-6 w-6" />
                    <span className="text-xs">History</span>
                </Button>
                <Button variant="ghost" className="flex flex-col h-full rounded-none" onClick={onQrClick}>
                    <UserSquare className="h-6 w-6" />
                    <span className="text-xs">My QR</span>
                </Button>
            </div>
        </div>
    )
}

