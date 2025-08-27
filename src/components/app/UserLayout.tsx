
"use client";

import { useState } from 'react';
import BottomNavbar from './BottomNavbar';
import Header from './Header';
import PayVendorDialog from './PayVendorDialog';
import TransactionHistoryDialog from './TransactionHistoryDialog';
import MyQrCodeDialog from './MyQrCodeDialog';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const [payVendorOpen, setPayVendorOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [myQrOpen, setMyQrOpen] = useState(false);
    
    return (
        <>
            <div className="flex flex-col min-h-screen bg-secondary/50">
                <Header />
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
