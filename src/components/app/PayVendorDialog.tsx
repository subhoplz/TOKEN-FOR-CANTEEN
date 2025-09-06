
"use client";

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, QrCode, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface PayVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PayVendorDialog({ open, onOpenChange }: PayVendorDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { balance, spendTokens, currentUser } = useCanteenPass();
  const { toast } = useToast();

  const handleGenerateQR = async () => {
    if (!currentUser) {
        toast({ title: 'No User Active', description: 'Please select a user first.', variant: 'destructive' });
        return;
    }
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive number.', variant: 'destructive' });
      return;
    }
    if (balance < numericAmount) {
      toast({ title: 'Insufficient Balance', description: `You only have ${balance} tokens.`, variant: 'destructive' });
      return;
    }
    if (!description.trim()) {
        toast({ title: 'Description Required', description: 'Please enter a payment description.', variant: 'destructive' });
        return;
    }

    setIsGenerating(true);
    const result = await spendTokens(numericAmount, description);
    
    if (result.success && result.data) {
        QRCode.toDataURL(result.data, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.9,
            margin: 1,
        })
        .then(url => {
            setQrCodeUrl(url);
        })
        .catch(err => {
            console.error("Failed to generate QR code:", err);
            toast({ title: 'QR Generation Failed', description: 'Could not create QR code.', variant: 'destructive' });
        })
        .finally(() => {
            setIsGenerating(false);
        });
    } else {
        setIsGenerating(false);
        toast({ title: 'Payment Failed', description: result.data || 'An unknown error occurred.', variant: 'destructive' });
    }
  };
  
  const handleClose = () => {
    setAmount('');
    setDescription('');
    setQrCodeUrl(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Vendor</DialogTitle>
          <DialogDescription>
            {qrCodeUrl ? 'Show this QR code to the vendor to complete your payment.' : 'Enter payment details to generate a QR code for offline validation.'}
          </DialogDescription>
        </DialogHeader>
        {qrCodeUrl ? (
            <div className='flex flex-col items-center gap-4 py-4'>
                <Image 
                    src={qrCodeUrl}
                    alt="Payment QR Code"
                    width={250}
                    height={250}
                    className='rounded-lg border p-1'
                    data-ai-hint="qr code"
                />
                <Alert variant="default" className='bg-accent/10 border-accent/50'>
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <AlertTitle>Tokens Deducted & QR Generated</AlertTitle>
                    <AlertDescription>
                        {amount} tokens have been deducted from your balance. The QR code contains the new balance and a secure signature.
                    </AlertDescription>
                </Alert>
            </div>
        ) : (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="e.g., 25" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">For</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="e.g., Lunch" />
                </div>
            </div>
        )}
        <DialogFooter>
            {qrCodeUrl ? (
                <Button onClick={handleClose} className='w-full'>Done</Button>
            ) : (
                <Button onClick={handleGenerateQR} disabled={!currentUser || isGenerating} className='w-full'>
                    {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <QrCode className='mr-2 h-4 w-4' />}
                    {isGenerating ? 'Generating...' : 'Generate Payment QR'}
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
