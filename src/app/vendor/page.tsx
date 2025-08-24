"use client";

import Header from "@/components/app/Header";
import QrValidator from "@/components/app/QrValidator";
import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLayout from "../admin/layout";

export default function VendorPage() {
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
        return <p>Loading or redirecting...</p>
    }

    return (
        <AdminLayout>
            <div className="max-w-2xl w-full mx-auto">
                <QrValidator />
            </div>
        </AdminLayout>
    )
}
