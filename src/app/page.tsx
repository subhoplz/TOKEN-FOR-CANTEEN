
"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Skeleton } from '@/components/ui/skeleton';
import  Header  from '@/components/app/Header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BalanceCard from '@/components/app/BalanceCard';
import MenuCard from '@/components/app/MenuCard';
import { Button } from '@/components/ui/button';
import { QrCode, History, UserSquare } from 'lucide-react';
import PayVendorDialog from '@/components/app/PayVendorDialog';
import TransactionHistoryDialog from '@/components/app/TransactionHistoryDialog';
import MyQrCodeDialog from '@/components/app/MyQrCodeDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { loading, currentUser } = useCanteenPass();
  const router = useRouter();

  const [payVendorOpen, setPayVendorOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [myQrOpen, setMyQrOpen] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login/user');
    }
  }, [loading, currentUser, router]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  if (loading || !currentUser) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-md mx-auto space-y-6">
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                    <div className='flex gap-4'>
                        <Skeleton className="h-14 flex-1 rounded-xl" />
                        <Skeleton className="h-14 flex-1 rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
    )
  }

  return (
    <>
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-md mx-auto grid gap-6">
            
            <div className='flex items-center gap-4 p-4 bg-card rounded-xl shadow-sm'>
                <Avatar className='h-16 w-16 border-2 border-primary'>
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name}`} alt={currentUser.name} />
                    <AvatarFallback className='text-2xl'>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className='text-xl font-bold'>{currentUser.name}</h2>
                    <p className='text-sm text-muted-foreground'>{currentUser.employeeId}</p>
                </div>
                <Button variant="ghost" size="icon" className='ml-auto' onClick={() => setMyQrOpen(true)}>
                    <UserSquare className='h-7 w-7 text-primary' />
                </Button>
            </div>

            <BalanceCard />

            <MenuCard />

            <div className="grid grid-cols-2 gap-4">
                 <Button className='py-8 text-lg' onClick={() => setPayVendorOpen(true)}>
                    <QrCode className="mr-2 h-6 w-6" /> Scan QR
                </Button>
                <Button className='py-8 text-lg' variant="outline" onClick={() => setHistoryOpen(true)}>
                    <History className="mr-2 h-6 w-6" /> View History
                </Button>
            </div>

        </div>
      </main>
    </div>
    <PayVendorDialog open={payVendorOpen} onOpenChange={setPayVendorOpen} />
    <TransactionHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
    <MyQrCodeDialog open={myQrOpen} onOpenChange={setMyQrOpen} />
    </>
  );
}
