
"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from 'lucide-react';
import { Progress } from '../ui/progress';
import { format } from 'date-fns';

export default function BalanceCard() {
  const { balance, currentUser } = useCanteenPass();
  const maxTokens = 30; // Assuming a monthly/default cap of 30 for the progress bar

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-primary to-blue-400 text-primary-foreground">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Tokens Remaining</span>
          <Ticket className="h-5 w-5 text-primary-foreground/80" />
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className="text-5xl font-bold font-headline text-center pb-2">
          {balance.toLocaleString()}
        </div>
        <Progress value={(balance / maxTokens) * 100} className="h-3 bg-primary-foreground/30" />
        <p className="text-xs text-primary-foreground/80 pt-2 text-center">
          Last updated: {currentUser ? format(new Date(currentUser.lastUpdated), 'PPp') : 'N/A'}
        </p>
      </CardContent>
    </Card>
  );
}
