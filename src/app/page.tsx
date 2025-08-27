
"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BalanceCard from '@/components/app/BalanceCard';
import MenuCard from '@/components/app/MenuCard';
import { Button } from '@/components/ui/button';
import { Download, LogOut, UserSquare } from 'lucide-react';
import MyQrCodeDialog from '@/components/app/MyQrCodeDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import UserLayout from '@/components/app/UserLayout';

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

  const handleInstallClick = () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      installPrompt.userChoice.then(() => {
          setInstallPrompt(null);
      });
  };

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login/user');
    }
  }, [loading, currentUser, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  if (loading || !currentUser) {
    return (
      <UserLayout>
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-md mx-auto space-y-6">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                    <div className='flex gap-4'>
                        <Skeleton className="h-20 flex-1 rounded-xl" />
                        <Skeleton className="h-20 flex-1 rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
      </UserLayout>
    )
  }

  return (
    <>
    <UserLayout>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
        <div className="max-w-md mx-auto grid gap-6">
            
            <Card className='flex items-center gap-4 p-4 shadow-sm'>
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
            </Card>

            <BalanceCard />

            {installPrompt && (
              <Card>
                <CardContent className="p-4">
                  <Button className="w-full h-12" onClick={handleInstallClick}>
                      <Download className="mr-2 h-5 w-5" />
                      Install App to your Phone
                  </Button>
                </CardContent>
              </Card>
            )}

            <MenuCard />
            
            <Button variant="link" className='text-muted-foreground' onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </div>
      </main>
    </UserLayout>
    <MyQrCodeDialog open={myQrOpen} onOpenChange={setMyQrOpen} />
    </>
  );
}
