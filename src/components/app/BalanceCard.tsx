"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function BalanceCard() {
  const { balance, user } = useCanteenPass();

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-primary to-blue-400 text-primary-foreground">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
        <Wallet className="h-5 w-5 text-primary-foreground/80" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-headline">
          {balance.toLocaleString()} Tokens
        </div>
        <p className="text-xs text-primary-foreground/80 pt-2">
          Welcome, {user.name}
        </p>
      </CardContent>
    </Card>
  );
}
