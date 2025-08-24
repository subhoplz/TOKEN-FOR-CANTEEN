"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, User as UserIcon } from "lucide-react";

export default function UserLoginPage() {
    const { users, switchUser, loading } = useCanteenPass();
    const router = useRouter();

    const handleLogin = (userId: string) => {
        switchUser(userId);
        router.push('/');
    };

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                     <div className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2 justify-center">
                        <UtensilsCrossed className="h-7 w-7" />
                        <span className="font-headline">CanteenPass</span>
                    </div>
                    <CardTitle className="text-3xl">User Login</CardTitle>
                    <CardDescription>Select your account to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {users.filter(u => u.role === 'user').map(user => (
                        <Button key={user.id} onClick={() => handleLogin(user.id)} className="w-full justify-start text-lg py-6" variant="outline">
                            <UserIcon className="mr-4 h-6 w-6"/> {user.name}
                        </Button>
                    ))}
                    {users.filter(u => u.role === 'user').length === 0 && (
                        <p className="text-center text-muted-foreground">No user accounts found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}