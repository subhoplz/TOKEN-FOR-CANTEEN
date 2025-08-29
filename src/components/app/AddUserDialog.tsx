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
import { User } from '@/lib/types';

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: User['role'];
}

export default function AddUserDialog({ open, onOpenChange, role = 'user' }: AddUserDialogProps) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const { addUser } = useCanteenPass();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: 'Invalid Name',
        description: `Please enter a name for the new ${role}.`,
        variant: 'destructive',
      });
      return;
    }
    if (!employeeId.trim()) {
        toast({
            title: 'Invalid ID',
            description: 'Please enter an ID.',
            variant: 'destructive',
        });
        return;
    }
    if (!password.trim() && role === 'user') {
        toast({
            title: 'Password required',
            description: 'Please enter a password for the new user.',
            variant: 'destructive',
        });
        return;
    }

    addUser(name, employeeId, role, password);
    setName('');
    setEmployeeId('');
    setPassword('');
    onOpenChange(false);
  };
  
  const getTitle = () => {
    switch (role) {
      case 'admin':
        return 'Add New Admin';
      case 'vendor':
        return 'Add New Vendor';
      default:
        return 'Create Account';
    }
  }

  const getDescription = () => {
    switch (role) {
      case 'admin':
        return "Create a new admin account. Admins can manage users and vendors.";
      case 'vendor':
        return "Create a new vendor account. Vendors can scan QR codes to process payments.";
      default:
        return "Create a new user account. They will start with a balance of 0 tokens.";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder={role === 'admin' ? "e.g., Head Operator" : "e.g., Jane Doe"}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employeeId" className="text-right">
              {role === 'vendor' ? 'Vendor ID' : 'Employee ID'}
            </Label>
            <Input
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="col-span-3"
              placeholder={role === 'admin' ? "e.g., A00001" : role === 'vendor' ? "e.g., V123" : "e.g., E12345"}
            />
          </div>
          {role !== 'vendor' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Create a password"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Create {role.charAt(0).toUpperCase() + role.slice(1)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
