
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/app/Header";
import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { HardDrive, QrCode, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VendorDashboardPage() {
    const { loading, currentUser } = useCanteenPass();
    const router = useRouter();

     useEffect(() => {
        if (!loading && (!currentUser || currentUser.role !== 'admin')) {
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
                <div className="max-w-md mx-auto grid gap-6">
                    <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
                     <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full h-24 text-xl" onClick={() => router.push('/vendor/scan')}>
                                <QrCode className="mr-4 h-8 w-8" /> Scan User QR
                            </Button>
                        </CardContent>
                     </Card>

                     <div className="grid grid-cols-2 gap-4">
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Meals Served Today</CardTitle>
                                <Utensils className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">Will update after transactions</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Syncs</CardTitle>
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">All transactions are saved locally</p>
                            </CardContent>
                        </Card>
                     </div>
                </div>
            </main>
        </div>
    )
}
