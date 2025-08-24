
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

  // This is a simplified "hash" for demonstration. In a real app, use a proper crypto library.
  const createSignature = (data: { employee_id: string, timestamp: string }) => {
    const dataString = `${data.employee_id}|${data.timestamp}|CanteenPass-Secret-Key`; // Added a static "secret"
    let hash = 0;
    if (dataString.length === 0) return `sig-0`;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `sig-${hash}`;
  };

  useEffect(() => {
    if (currentUser) {
      const timestamp = new Date().toISOString();
      const qrPayload = {
        employee_id: currentUser.employeeId,
        timestamp: timestamp,
      }
      const signature = createSignature(qrPayload);

      const fullQrData = {
        ...qrPayload,
        device_signature: signature
      }
      
      setQrData(JSON.stringify(fullQrData, null, 2));
    }
  }, [currentUser, open]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserSquare /> My Personal QR Code
            </DialogTitle>
          <DialogDescription>
            An admin or vendor can scan this to identify you, even when offline.
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
