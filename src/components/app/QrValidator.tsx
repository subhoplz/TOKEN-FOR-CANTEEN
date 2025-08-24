"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, QrCode, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ValidatedData {
    transactionId: string;
    userId: string;
    amount: number;
    description: string;
    timestamp: number;
}

export default function QrValidator() {
    const [qrInput, setQrInput] = useState('');
    const [validatedData, setValidatedData] = useState<ValidatedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = () => {
        setError(null);
        setValidatedData(null);

        if (!qrInput.trim()) {
            setError("QR data cannot be empty.");
            return;
        }

        try {
            const parsed = JSON.parse(qrInput);
            // Basic validation
            if (parsed.transactionId && parsed.userId && parsed.amount && parsed.description && parsed.timestamp) {
                setValidatedData(parsed);
            } else {
                throw new Error("Missing required fields in QR data.");
            }
        } catch (e) {
            setError("Invalid QR data format. Please paste the correct JSON data.");
        }
    };
    
    const handleReset = () => {
        setQrInput('');
        setValidatedData(null);
        setError(null);
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><QrCode/> Vendor Transaction Validator</CardTitle>
                <CardDescription>Paste the QR code data from the user's app to validate the payment.</CardDescription>
            </CardHeader>
            <CardContent>
                {validatedData || error ? (
                    <div className='space-y-4'>
                        {error && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Validation Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {validatedData && (
                            <Alert className='bg-accent/10 border-accent text-accent-foreground'>
                                <CheckCircle className="h-4 w-4 text-accent" />
                                <AlertTitle className='text-accent-foreground/90'>Payment Validated Successfully</AlertTitle>
                                <AlertDescription className='text-accent-foreground/80'>
                                   <div className='mt-2 space-y-1 text-sm'>
                                        <p><strong>Amount:</strong> {validatedData.amount} Tokens</p>
                                        <p><strong>For:</strong> {validatedData.description}</p>
                                        <p><strong>User ID:</strong> {validatedData.userId}</p>
                                        <p><strong>Time:</strong> {format(new Date(validatedData.timestamp), 'PPp')}</p>
                                        <p><strong>Transaction ID:</strong> {validatedData.transactionId}</p>
                                   </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                ) : (
                    <Textarea 
                        placeholder='Paste QR data here... e.g., {"transactionId": "...", ...}'
                        value={qrInput}
                        onChange={e => setQrInput(e.target.value)}
                        rows={8}
                    />
                )}
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
                {validatedData || error ? (
                    <Button onClick={handleReset} variant="outline">Scan Another</Button>
                ) : (
                    <Button onClick={handleValidate}>Validate Payment</Button>
                )}
            </CardFooter>
        </Card>
    );
}
