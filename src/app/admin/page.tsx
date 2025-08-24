
"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, Utensils, BarChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
    const { users, transactions } = useCanteenPass();

    const totalUsers = users.length;
    const totalTokensDistributed = users.reduce((acc, user) => acc + user.balance, 0);
    const mealsToday = transactions.filter(t => {
        const today = new Date();
        const txDate = new Date(t.timestamp);
        return t.type === 'debit' && txDate.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">All registered accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tokens in Circulation</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTokensDistributed.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total balance across all users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Meals Today</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mealsToday}</div>
                         <p className="text-xs text-muted-foreground">Based on debit transactions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reports & Analytics</CardTitle>
                    <CardDescription>
                        Dive deeper into your canteen's data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center flex-col gap-4">
                    <p className="text-muted-foreground">View detailed reports and analytics.</p>
                    <Button asChild>
                        <Link href="/admin/reports">
                            <BarChart className="mr-2 h-4 w-4" /> Go to Reports
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
