"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Skeleton } from '@/components/ui/skeleton';
import  Header  from '@/components/app/Header';
import  BalanceCard  from '@/components/app/BalanceCard';
import  ActionsCard  from '@/components/app/ActionsCard';
import  TransactionHistory  from '@/components/app/TransactionHistory';

export default function DashboardPage() {
  const { loading } = useCanteenPass();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid gap-8">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl md:col-span-2" />
              <Skeleton className="h-96 rounded-xl md:col-span-3" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <BalanceCard />
                    <ActionsCard />
                </div>
                <div className="lg:col-span-2">
                    <TransactionHistory />
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
