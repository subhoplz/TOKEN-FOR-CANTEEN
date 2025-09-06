
"use client";

import TransactionHistory from "@/components/app/TransactionHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { User, Utensils } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { subDays, format } from "date-fns";

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

    const getTokenUsageData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));
        const data = last7Days.map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            const dayShort = format(day, 'MMM d');
            const dailyTotal = transactions
                .filter(t => t.type === 'debit' && format(new Date(t.timestamp), 'yyyy-MM-dd') === dayString)
                .reduce((acc, t) => acc + t.amount, 0);

            return { date: dayShort, total: dailyTotal };
        }).reverse();
        
        return data;
    };
    
    const tokenUsageData = getTokenUsageData();

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
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Token Usage (Last 7 Days)</CardTitle>
                    <CardDescription>Total tokens spent per day.</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ChartContainer config={{}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tokenUsageData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <Tooltip 
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Bar dataKey="total" fill="var(--color-primary)" radius={8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <TransactionHistory />
        </div>
    )
}
