
"use client";

import Header from "@/components/app/Header";
import QrValidator from "@/components/app/QrValidator";
import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VendorScanPage() {
    const { loading, currentUser } = useCanteenPass();
    const router = useRouter();

     useEffect(() => {
        if (!loading && (!currentUser || !['admin', 'vendor'].includes(currentUser.role))) {
            router.push('/login/vendor');
        }
    }, [loading, currentUser, router]);

    if (loading || !currentUser) {
        return <p>Loading or redirecting...</p>
    }

    return (
       <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                 <div className="max-w-2xl w-full mx-auto">
                    <QrValidator />
                </div>
            </main>
        </div>
    )
}
