"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <UtensilsCrossed className="h-7 w-7" />
            <span className="font-headline">CanteenPass</span>
          </Link>
          <nav>
            <Button variant="ghost" asChild>
              <Link href="/vendor">Vendor Mode</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
