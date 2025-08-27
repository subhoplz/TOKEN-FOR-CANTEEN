
"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TransactionHistory() {
  const { transactions, currentUser } = useCanteenPass();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Card className="shadow-md rounded-xl h-full border-none">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>A record of recent token activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>User</TableHead>}
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    {isAdmin && <TableCell className="font-medium">{tx.userName || 'N/A'}</TableCell>}
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
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center h-24 text-muted-foreground">
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
