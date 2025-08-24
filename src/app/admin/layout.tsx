
"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/app/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { loading, currentUser } = useCanteenPass();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser || currentUser.role !== 'admin') {
                router.push('/login/admin');
            }
        }
    }, [loading, currentUser, router]);

    if (loading || !currentUser || currentUser.role !== 'admin') {
        return (
             <div className="flex h-screen items-center justify-center">
                <p>Loading or redirecting...</p>
             </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-secondary/50">
                {children}
            </main>
        </div>
    );
}
