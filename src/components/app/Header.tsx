
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, UtensilsCrossed, Shield, User as UserIcon, Settings, Bell, UserCog, Download } from 'lucide-react';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface HeaderProps {
    onInstallClick?: () => void;
    showInstallButton?: boolean;
}

export default function Header({ onInstallClick, showInstallButton }: HeaderProps) {
  const { currentUser, logout } = useCanteenPass();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <UtensilsCrossed className="h-7 w-7" />
            <span className="font-headline">SmartCanteen</span>
          </Link>
          <nav className='flex items-center gap-2'>
            {currentUser ? (
              <>
                {showInstallButton && (
                    <Button variant="outline" size="sm" onClick={onInstallClick}>
                        <Download className="mr-2 h-4 w-4" />
                        Install App
                    </Button>
                )}
                <Button variant="ghost" size="icon" className='relative'>
                    <Bell className="h-5 w-5" />
                    <span className='absolute top-2 right-2 block h-2 w-2 rounded-full bg-primary' />
                    <span className='sr-only'>Notifications</span>
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className='relative h-10 w-10 rounded-full'>
                            <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name}`} alt={currentUser.name} />
                                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-56'>
                        <DropdownMenuLabel>
                           <p className='font-bold'>{currentUser.name}</p>
                           <p className='text-xs text-muted-foreground font-normal'>{currentUser.employeeId}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {currentUser.role === 'admin' && (
                            <>
                                <DropdownMenuItem onClick={() => router.push('/admin')}>
                                    <UserCog className='mr-2' /> Admin Panel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem>
                            <Settings className='mr-2'/> Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className='mr-2' /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
              </>
            ) : (
                 <Button variant="outline" onClick={() => router.push('/login')}>Login</Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
