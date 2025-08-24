"use client";

import { useState } from 'react';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Shield } from 'lucide-react';
import AddUserDialog from './AddUserDialog';
import { User } from '@/lib/types';
import { Badge } from '../ui/badge';

export default function UserManagement() {
  const { users, switchUser, currentUser } = useCanteenPass();
  const [addUserOpen, setAddUserOpen] = useState(false);

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
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => switchUser(user.id)}
                      disabled={currentUser?.id === user.id}
                    >
                      {currentUser?.id === user.id ? 'Active User' : 'Set Active'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
    </>
  );
}
