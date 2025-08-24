
"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, Utensils } from "lucide-react";

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
                    <CardTitle>Token Usage</CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart placeholder - a real chart would go here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
