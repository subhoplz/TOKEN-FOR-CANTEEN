"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TransactionHistory() {
  const { transactions } = useCanteenPass();

  return (
    <Card className="shadow-md rounded-xl h-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>A record of your recent token activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'credit' ? 'default' : 'secondary'} className={cn(tx.type === 'credit' && 'bg-accent text-accent-foreground')}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(tx.timestamp), 'PPp')}</TableCell>
                    <TableCell className={cn("text-right font-semibold", tx.type === 'credit' ? 'text-green-600' : 'text-red-600')}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
