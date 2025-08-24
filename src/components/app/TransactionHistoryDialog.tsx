
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TransactionHistory from './TransactionHistory';

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TransactionHistoryDialog({ open, onOpenChange }: TransactionHistoryDialogProps) {
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <TransactionHistory />
      </DialogContent>
    </Dialog>
  );
}
