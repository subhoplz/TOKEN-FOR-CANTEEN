
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Shield, User as UserIcon, Store } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 text-4xl font-bold text-primary mb-2">
                <UtensilsCrossed className="h-10 w-10" />
                <span className="font-headline">SmartCanteen</span>
            </div>
            <p className="text-muted-foreground text-lg">Welcome! Please select your login type.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4 border border-primary/20">
                        <UserIcon className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle>User Login</CardTitle>
                    <CardDescription>Access your token balance and transaction history.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button size="lg" asChild>
                        <Link href="/login/user">Proceed to User Login</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4 border border-primary/20">
                        <Store className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle>Vendor Login</CardTitle>
                    <CardDescription>Scan QR codes and process meal transactions.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button size="lg" asChild>
                        <Link href="/login/vendor">Proceed to Vendor Login</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4 border border-primary/20">
                        <Shield className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle>Admin Login</CardTitle>
                    <CardDescription>Manage users, tokens, and system settings.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button size="lg" asChild>
                        <Link href="/login/admin">Proceed to Admin Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
