
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, QrCode, ShieldAlert, XCircle, ArrowLeft, Utensils, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface QrCodeData {
    employee_id: string;
    timestamp: string;
    device_signature: string;
    // Optional fields for display - not used in signature
    name?: string;
    balance?: number;
    transaction?: {
        amount: number;
        description: string;
    }
}

export default function QrValidator() {
    const [qrInput, setQrInput] = useState('');
    const [validatedData, setValidatedData] = useState<QrCodeData | null>(null);
    const [scannedUser, setScannedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [signatureValid, setSignatureValid] = useState(false);
    const { users, addTokensToUser, spendTokensFromUser } = useCanteenPass();
    const { toast } = useToast();
    const router = useRouter();


    const validateSignature = (data: QrCodeData) => {
        const dataString = `${data.employee_id}|${data.timestamp}`;
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const expectedSignature = `sig-${hash}`;
        return data.device_signature === expectedSignature;
    };

    const handleValidate = () => {
        setError(null);
        setValidatedData(null);
        setSignatureValid(false);

        if (!qrInput.trim()) {
            setError("QR data cannot be empty.");
            return;
        }

        try {
            const parsed = JSON.parse(qrInput) as QrCodeData;
            
            const requiredFields: (keyof QrCodeData)[] = ['employee_id', 'timestamp', 'device_signature'];
            const missingField = requiredFields.find(field => !(field in parsed));
            if (missingField) {
                throw new Error(`Missing required field in QR data: ${missingField}`);
            }

            const userInDb = users.find(u => u.employeeId === parsed.employee_id);
            if (!userInDb) {
                 setError("User not found in the local database. The vendor app may need to sync.");
                 setSignatureValid(false); // Can't proceed if user is unknown
                 return;
            }
            setScannedUser(userInDb);
            
            const displayData = { ...parsed, name: parsed.name || userInDb.name };
            setValidatedData(displayData);
            
            const isValid = validateSignature(parsed);
            setSignatureValid(isValid);
            if (!isValid) {
                setError("Digital signature is invalid! The data may have been tampered with.");
            }

        } catch (e) {
            setError("Invalid QR data format. Please paste the correct JSON data.");
        }
    };

    const handleDeduct = () => {
        if (!scannedUser || !validatedData) return;

        // For a meal, we'll deduct 1 token by default. This can be made dynamic later.
        const mealCost = 1;
        const mealDescription = "Meal served";

        const result = spendTokensFromUser(scannedUser.id, mealCost, mealDescription);
        
        if (result.success) {
            toast({
                title: "Success",
                description: `${mealCost} token deducted from ${scannedUser.name}.`,
            });
            handleReset(); // Reset for the next scan
        } else {
             toast({
                title: "Failed",
                description: result.data,
                variant: 'destructive'
            });
        }

    }
    
    const handleReset = () => {
        setQrInput('');
        setValidatedData(null);
        setScannedUser(null);
        setError(null);
        setSignatureValid(false);
    }

    return (
        <Card className="w-full shadow-lg">
             <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <CardHeader className='text-center pt-12'>
                <CardTitle className='flex items-center gap-2 justify-center text-3xl'><QrCode/> Scan & Validate</CardTitle>
                <CardDescription>Paste the QR code from the user's app to validate and complete the transaction.</CardDescription>
            </CardHeader>
            <CardContent>
                {!validatedData && !error && (
                     <Textarea 
                        placeholder='Paste QR data here... e.g., {"employee_id": "E12345", ...}'
                        value={qrInput}
                        onChange={e => setQrInput(e.target.value)}
                        rows={8}
                        className="text-base"
                    />
                )}
                
                {(validatedData || error) && (
                    <div className='space-y-4'>
                        {error && !signatureValid && (
                             <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Validation Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {validatedData && scannedUser && (
                            <>
                                {signatureValid ? (
                                    <Alert className='bg-accent/10 border-accent text-accent-foreground'>
                                        <CheckCircle className="h-4 w-4 text-accent" />
                                        <AlertTitle className='text-accent-foreground/90'>Signature Valid & User Verified</AlertTitle>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <ShieldAlert className="h-4 w-4" />
                                        <AlertTitle>Signature Invalid!</AlertTitle>
                                        <AlertDescription>
                                            The QR code data may be fraudulent. Do not trust this data.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Card className='bg-secondary/50'>
                                    <CardHeader>
                                        <CardTitle>{scannedUser.name}</CardTitle>
                                        <CardDescription>{scannedUser.employeeId}</CardDescription>
                                    </CardHeader>
                                    <CardContent className='flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <Ticket className='h-6 w-6 text-primary'/>
                                            <span className='text-xl font-bold'>{scannedUser.balance}</span>
                                            <span className='text-muted-foreground'>Tokens</span>
                                        </div>
                                        <div>
                                            <p className='text-sm font-semibold'>Meal Available:</p>
                                            <p className='text-muted-foreground'>Breakfast / Lunch / Dinner</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className='flex flex-col gap-2'>
                {validatedData && signatureValid && (
                    <>
                        <Button className="w-full h-12 text-lg" onClick={handleDeduct} disabled={scannedUser!.balance < 1}>
                           {scannedUser!.balance < 1 ? 'Insufficient Balance' : <><Utensils className='mr-2' /> Deduct 1 Token & Serve</>}
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="w-full">Cancel & Scan Next</Button>
                    </>
                )}

                {error && (
                     <Button onClick={handleReset} variant="outline" className='w-full'>Scan Another</Button>
                )}

                {!(validatedData || error) && (
                    <Button onClick={handleValidate} className='w-full h-12 text-lg'>Validate QR Data</Button>
                )}
            </CardFooter>
        </Card>
    );
}
