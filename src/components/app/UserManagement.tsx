"use client";

import { useState } from 'react';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Shield, Edit, Trash2, Plus } from 'lucide-react';
import AddUserDialog from './AddUserDialog';
import { User } from '@/lib/types';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';

export default function UserManagement() {
  const { users, switchUser, currentUser, deleteUser, editUser, addTokensToUser } = useCanteenPass();
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editedName, setEditedName] = useState('');
  const [userToFund, setUserToFund] = useState<User | null>(null);
  const [fundAmount, setFundAmount] = useState('');

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const handleEditSave = () => {
    if (userToEdit && editedName.trim()) {
      editUser(userToEdit.id, editedName.trim());
      setUserToEdit(null);
      setEditedName('');
    } else {
        toast({ title: "Edit failed", description: "Name cannot be empty.", variant: "destructive"})
    }
  }

  const handleFundSave = () => {
    const amount = parseInt(fundAmount, 10);
    if (userToFund && !isNaN(amount) && amount > 0) {
        addTokensToUser(userToFund.id, amount);
        setUserToFund(null);
        setFundAmount('');
    } else {
        toast({ title: "Funding failed", description: "Please enter a valid positive amount.", variant: "destructive"})
    }
  }

  return (
    <>
      <Card className="shadow-md rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2"><Users /> User Management</CardTitle>
                <CardDescription>View and manage user accounts and their token balances.</CardDescription>
            </div>
            <Button onClick={() => setAddUserOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add User
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id} className={currentUser?.id === user.id ? 'bg-secondary' : ''}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' && <Shield className='mr-1 h-3 w-3'/>}
                        {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{user.balance} Tokens</TableCell>
                  <TableCell className="text-center space-x-2">
                     <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => switchUser(user.id)}
                      disabled={currentUser?.id === user.id}
                    >
                      {currentUser?.id === user.id ? 'Active' : 'Set Active'}
                    </Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={currentUser?.id === user.id && user.role === 'admin'}>
                                ...
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                             <DropdownMenuItem onClick={() => setUserToFund(user)}>
                                <Plus className='mr-2 h-4 w-4' />
                                Add Tokens
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setUserToEdit(user); setEditedName(user.name); }}>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className='text-red-500' 
                                onClick={() => setUserToDelete(user)} 
                                disabled={user.role === 'admin'}
                            >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user account for <strong>{userToDelete?.name}</strong> and all associated data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className='bg-destructive hover:bg-destructive/90'>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Change the name for {userToEdit?.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                    <Input id="edit-name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className='col-span-3' />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setUserToEdit(null)}>Cancel</Button>
                <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!userToFund} onOpenChange={(open) => !open && setUserToFund(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Tokens to {userToFund?.name}</DialogTitle>
                <DialogDescription>Enter the amount of tokens to add to this user's balance.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fund-amount" className="text-right">Amount</Label>
                    <Input id="fund-amount" type="number" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} className='col-span-3' placeholder='e.g., 500' />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setUserToFund(null)}>Cancel</Button>
                <Button onClick={handleFundSave}>Add Tokens</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
