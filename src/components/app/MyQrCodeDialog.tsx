
"use client";

import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { UserSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MyQrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MyQrCodeDialog({ open, onOpenChange }: MyQrCodeDialogProps) {
  const { currentUser } = useCanteenPass();
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      // The QR code for identification only needs the user's unique ID.
      const userData = {
        id: currentUser.id,
        name: currentUser.name,
        employeeId: currentUser.employeeId,
      }
      setQrData(JSON.stringify(userData, null, 2));
    }
  }, [currentUser]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserSquare /> My Personal QR Code
            </DialogTitle>
          <DialogDescription>
            An admin or vendor can scan this code to identify your account or assign tokens to you.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center gap-4 py-4'>
            {qrData ? (
                <Image 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`}
                    alt="My Personal QR Code"
                    width={250}
                    height={250}
                    className='rounded-lg border p-1'
                    data-ai-hint="qr code"
                />
            ) : (
                <p>Loading QR Code...</p>
            )}
        </div>
        <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className='w-full'>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
