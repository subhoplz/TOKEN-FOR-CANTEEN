"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, User as UserIcon, PlusCircle } from "lucide-react";
import AddUserDialog from "@/components/app/AddUserDialog";
import { useState } from "react";
import Link from "next/link";

export default function UserLoginPage() {
    const { users, switchUser, loading } = useCanteenPass();
    const router = useRouter();
    const [addUserOpen, setAddUserOpen] = useState(false);

    const handleLogin = (userId: string) => {
        switchUser(userId);
        router.push('/');
    };

    if (loading) {
        return <p>Loading...</p>
    }

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
                        <CardDescription>Select your account to continue</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 pl-4 py-4">
                        {users.filter(u => u.role === 'user').map(user => (
                            <Button key={user.id} onClick={() => handleLogin(user.id)} className="w-full justify-start text-lg py-6" variant="outline">
                                <UserIcon className="mr-4 h-6 w-6"/> {user.name}
                            </Button>
                        ))}
                        {users.filter(u => u.role === 'user').length === 0 && (
                            <p className="text-center text-muted-foreground">No user accounts found. Create one below!</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-4 pt-6">
                        <Button onClick={() => setAddUserOpen(true)} className="w-full">
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
