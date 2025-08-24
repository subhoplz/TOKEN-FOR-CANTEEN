
"use client";

import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Store, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AddUserDialog from "@/components/app/AddUserDialog";

export default function VendorLoginPage() {
    const { users, switchUser, loading } = useCanteenPass();
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [addVendorOpen, setAddVendorOpen] = useState(false);

    const handleLogin = () => {
        if (selectedUser) {
            switchUser(selectedUser);
            router.push('/vendor/dashboard');
        }
    };
    
    if (loading) {
        return <p>Loading...</p>
    }

    const vendorUsers = users.filter(u => u.role === 'admin'); // For now, admins are vendors

    return (
        <>
            <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2 justify-center">
                            <UtensilsCrossed className="h-7 w-7" />
                            <span className="font-headline">SmartCanteen</span>
                        </div>
                        <CardTitle className="text-3xl">Vendor Login</CardTitle>
                        <CardDescription>Select a vendor account to begin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4  max-h-[40vh] overflow-y-auto pr-2 pl-4 py-4">
                        {vendorUsers.length > 0 ? (
                            <RadioGroup onValueChange={setSelectedUser} value={selectedUser || undefined}>
                                {vendorUsers.map(user => (
                                    <Label key={user.id} htmlFor={user.id} className="flex items-center gap-4 p-4 border rounded-md cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:bg-accent/80 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value={user.id} id={user.id} />
                                        <Store className="h-6 w-6 text-primary"/>
                                        <span className="font-semibold text-lg">{user.name}</span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        ) : (
                            <p className="text-center text-muted-foreground">No vendor accounts found.</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-6">
                        <Button size="lg" onClick={handleLogin} disabled={!selectedUser || loading} className="w-full">
                            Login as Vendor
                        </Button>
                        <Button onClick={() => setAddVendorOpen(true)} className="w-full" variant="secondary">
                            <PlusCircle className="mr-2 h-5 w-5" /> Create New Vendor
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                           <Link href="/login">Back to Login Selection</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <AddUserDialog open={addVendorOpen} onOpenChange={setAddVendorOpen} role="admin" />
        </>
    );
}
