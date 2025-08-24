
"use client";

import TransactionHistory from "@/components/app/TransactionHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { User, Utensils } from "lucide-react";

export default function ReportsPage() {
    const { transactions, users } = useCanteenPass();

    const mealsToday = transactions.filter(t => {
        const today = new Date();
        const txDate = new Date(t.timestamp);
        return t.type === 'debit' && txDate.toDateString() === today.toDateString();
    }).length;

    const getTopSpender = () => {
        if (users.length === 0) return { name: 'N/A', count: 0 };
        
        const userMealCounts = users.map(user => ({
            name: user.name,
            count: user.transactions.filter(t => t.type === 'debit').length
        }));

        if (userMealCounts.length === 0) return { name: 'N/A', count: 0 };

        return userMealCounts.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    }

    const topSpender = getTopSpender();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meals Served Today</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mealsToday}</div>
                        <p className="text-xs text-muted-foreground">All debit transactions today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top User</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topSpender.name}</div>
                        <p className="text-xs text-muted-foreground">{topSpender.count} meals consumed</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Token Usage</CardTitle>
                    </CardHeader>
                    <CardContent className="h-20 flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Chart placeholder</p>
                    </CardContent>
                </Card>
            </div>

            <TransactionHistory />
        </div>
    )
}
