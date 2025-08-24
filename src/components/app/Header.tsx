"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, UtensilsCrossed, Shield, User as UserIcon } from 'lucide-react';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { currentUser, logout } = useCanteenPass();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <header className="bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <UtensilsCrossed className="h-7 w-7" />
            <span className="font-headline">CanteenPass</span>
          </Link>
          <nav className='flex items-center gap-4'>
            {currentUser && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground hidden sm:inline'>
                    {currentUser.role === 'admin' ? <Shield className='inline-block mr-2 h-4 w-4 text-primary' /> : <UserIcon className='inline-block mr-2 h-4 w-4' />} 
                    Logged in as <span className='font-semibold'>{currentUser.name}</span>
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
