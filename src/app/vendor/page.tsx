"use client";

import Header from "@/components/app/Header";
import QrValidator from "@/components/app/QrValidator";
import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VendorPage() {
    const { loading, currentUser } = useCanteenPass();
    const router = useRouter();

     useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                router.push('/login/admin');
            } else if (currentUser.role !== 'admin') {
                router.push('/login');
            }
        }
    }, [loading, currentUser, router]);

    if (loading || !currentUser || currentUser.role !== 'admin') {
        return <p>Loading or redirecting...</p>
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="max-w-2xl w-full">
                   <QrValidator />
                </div>
            </main>
        </div>
    )
}
