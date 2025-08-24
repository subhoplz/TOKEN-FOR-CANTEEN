"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, User as UserIcon, PlusCircle, KeyRound } from "lucide-react";
import AddUserDialog from "@/components/app/AddUserDialog";
import { useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function UserLoginPage() {
    const { users, switchUser, loading } = useCanteenPass();
    const router = useRouter();
    const [addUserOpen, setAddUserOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const { toast } = useToast();


    const handleLogin = () => {
        if (!selectedUserId) {
            toast({ title: 'Please select a user.', variant: 'destructive'});
            return;
        }
        if (!password) {
            toast({ title: 'Please enter your password.', variant: 'destructive'});
            return;
        }
        switchUser(selectedUserId, password);
        router.push('/');
    };

    if (loading) {
        return <p>Loading...</p>
    }

    const userAccounts = users.filter(u => u.role === 'user');

    return (
        <>
            <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                         <div className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2 justify-center">
                            <UtensilsCrossed className="h-7 w-7" />
                            <span className="font-headline">SmartCanteen</span>
                        </div>
                        <CardTitle className="text-3xl">User Login</CardTitle>
                        <CardDescription>Select your account and enter your password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="user-select">Select User</Label>
                             <Select onValueChange={setSelectedUserId} value={selectedUserId || undefined}>
                                <SelectTrigger id="user-select">
                                    <SelectValue placeholder="Select your account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userAccounts.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="h-4 w-4" />
                                                {user.name} ({user.employeeId})
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {userAccounts.length === 0 && (
                            <p className="text-center text-muted-foreground pt-4">No user accounts found. Create one below!</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-4 pt-6">
                        <Button size="lg" onClick={handleLogin} className="w-full">
                            Login
                        </Button>
                        <Button onClick={() => setAddUserOpen(true)} className="w-full" variant="secondary">
                            <PlusCircle className="mr-2 h-5 w-5" /> Create New Account
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                           <Link href="/login">Back to Login Selection</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
        </>
    );
}
