
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useCanteenPass } from "@/hooks/use-canteen-pass";
import { Download, Upload, Users } from "lucide-react";
import { useCallback, useState } from "react";

export default function TokenManagementPage() {
    const { users, addTokensToUser } = useCanteenPass();
    const [amount, setAmount] = useState('30');
    const [isLoading, setIsLoading] = useState(false);

    const handleBulkRefill = useCallback(() => {
        setIsLoading(true);
        const refillAmount = parseInt(amount, 10);
        if (isNaN(refillAmount) || refillAmount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a positive number for the token refill.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        // In a real app, this would be a single API call.
        // Here, we simulate it by iterating through users.
        setTimeout(() => {
            users.forEach(user => {
                if (user.role === 'user') {
                    addTokensToUser(user.id, refillAmount);
                }
            });
            toast({
                title: "Bulk Refill Complete",
                description: `Assigned ${refillAmount} tokens to all users.`,
            });
            setIsLoading(false);
        }, 1000); // Simulate network delay
    }, [addTokensToUser, users, amount]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Token Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Bulk Token Refill</CardTitle>
                    <CardDescription>Assign a set number of tokens to all users, for example at the start of a month.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                             <Label htmlFor="bulk-amount">Tokens to Assign</Label>
                             <Input 
                                id="bulk-amount" 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isLoading}
                             />
                        </div>
                        <Button onClick={handleBulkRefill} disabled={isLoading}>
                            <Users className="mr-2 h-4 w-4" /> {isLoading ? 'Assigning...' : 'Assign to All Users'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Token Distribution Logs</CardTitle>
                    <CardDescription>View a history of all token assignments and adjustments.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-48 text-center bg-secondary/50 rounded-lg">
                    <p className="text-muted-foreground">Distribution log placeholder.</p>
                    <p className="text-sm text-muted-foreground">A table of all token events would appear here.</p>
                    <div className="flex gap-4 mt-4">
                         <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                         <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" /> Import Adjustments
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
