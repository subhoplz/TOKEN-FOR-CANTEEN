
"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BalanceCard from '@/components/app/BalanceCard';
import MenuCard from '@/components/app/MenuCard';
import { Button } from '@/components/ui/button';
import { Download, LogOut, UserSquare, ShieldCheck, AlertTriangle } from 'lucide-react';
import MyQrCodeDialog from '@/components/app/MyQrCodeDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserLayout from '@/components/app/UserLayout';
import { usePersistentStorage } from '@/hooks/use-persistent-storage';
import ActionsCard from '@/components/app/ActionsCard';
import TransactionHistory from '@/components/app/TransactionHistory';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string,
    }>;
    prompt(): Promise<void>;
}

export default function DashboardPage() {
  const { loading, currentUser, logout } = useCanteenPass();
  const router = useRouter();

  const [myQrOpen, setMyQrOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { state: storageState, request: requestStorage } = usePersistentStorage();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login/user');
    }
  }, [loading, currentUser, router]);


  const handleInstallClick = () => {
    if (installPrompt) {
        installPrompt.prompt();
    }
  };

  if (loading || !currentUser) {
    return (
        <UserLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                    </div>
                    <div className="space-y-6">
                         <Skeleton className="h-[200px] w-full rounded-xl" />
                         <Skeleton className="h-[200px] w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </UserLayout>
    );
  }
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  

  return (
    <UserLayout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">{getGreeting()}, {currentUser.name.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground">Welcome back to your CanteenPass dashboard.</p>
                </div>
                <div className="flex items-center gap-2">
                    {installPrompt && (
                        <Button onClick={handleInstallClick}>
                            <Download className="mr-2 h-4 w-4" /> Install App
                        </Button>
                    )}
                     <Button variant="outline" onClick={() => setMyQrOpen(true)}>
                        <UserSquare className="mr-2 h-4 w-4" /> My Code
                    </Button>
                </div>
            </div>

            {storageState === 'prompt' && (
                <Card className='bg-blue-50 border-blue-200'>
                    <CardHeader className='flex-row gap-4 items-center'>
                        <ShieldCheck className='h-8 w-8 text-blue-600' />
                        <div>
                            <CardTitle className='text-lg'>Enable Enhanced Offline Mode</CardTitle>
                            <CardDescription className='text-blue-900'>Allow persistent storage for a more reliable offline experience.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Button onClick={requestStorage} className='bg-blue-600 hover:bg-blue-700'>
                           Allow Storage
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className='md:col-span-2 space-y-6'>
                    <BalanceCard />
                    <TransactionHistory />
                </div>
                <div className="space-y-6">
                    <ActionsCard />
                    <MenuCard />
                </div>
            </div>
        </div>
        <MyQrCodeDialog open={myQrOpen} onOpenChange={setMyQrOpen} />
    </UserLayout>
  );
}
