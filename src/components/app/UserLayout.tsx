
"use client";

import { useEffect, useState } from 'react';
import BottomNavbar from './BottomNavbar';
import Header from './Header';
import PayVendorDialog from './PayVendorDialog';
import TransactionHistoryDialog from './TransactionHistoryDialog';
import MyQrCodeDialog from './MyQrCodeDialog';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string,
    }>;
    prompt(): Promise<void>;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const [payVendorOpen, setPayVendorOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [myQrOpen, setMyQrOpen] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(() => {
            setInstallPrompt(null);
        });
    };
    
    return (
        <>
            <div className="flex flex-col min-h-screen bg-secondary/50">
                <Header onInstallClick={handleInstallClick} showInstallButton={!!installPrompt} />
                <div className="flex-1">
                    {children}
                </div>
                <BottomNavbar 
                    onPayClick={() => setPayVendorOpen(true)}
                    onHistoryClick={() => setHistoryOpen(true)}
                    onQrClick={() => setMyQrOpen(true)}
                />
            </div>
            <PayVendorDialog open={payVendorOpen} onOpenChange={setPayVendorOpen} />
            <TransactionHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
            <MyQrCodeDialog open={myQrOpen} onOpenChange={setMyQrOpen} />
        </>
    );
}
