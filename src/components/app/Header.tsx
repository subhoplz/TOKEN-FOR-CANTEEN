"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <UtensilsCrossed className="h-7 w-7" />
            <span className="font-headline">CanteenPass</span>
          </Link>
          <nav className='flex items-center gap-2'>
            <Button variant="ghost" asChild>
              <Link href="/vendor">Vendor Mode</Link>
            </Button>
            <Button variant="outline" asChild className='border-primary/50 text-primary hover:bg-primary/10 hover:text-primary'>
              <Link href="/admin"><Shield className='mr-2'/> Admin Panel</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}