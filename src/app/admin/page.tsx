"use client";

import Header from "@/components/app/Header";
import UserManagement from "@/components/app/UserManagement";
import { useCanteenPass } from "@/hooks/use-canteen-pass";

export default function AdminPage() {
    const { loading } = useCanteenPass();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                       <p>Loading user data...</p>
                    ) : (
                        <UserManagement />
                    )}
                </div>
            </main>
        </div>
    )
}