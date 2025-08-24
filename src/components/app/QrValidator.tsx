"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, QrCode, ShieldAlert, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/lib/types';

interface ValidatedData extends User {
    signature: string;
}

export default function QrValidator() {
    const [qrInput, setQrInput] = useState('');
    const [validatedData, setValidatedData] = useState<ValidatedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [signatureValid, setSignatureValid] = useState(false);

    // This must be the same simple "hash" function as in the hook.
    // In a real app, this would be a proper cryptographic verification.
    const validateSignature = (data: Omit<ValidatedData, 'signature' | 'transactions'>) => {
        const dataString = `${data.id}|${data.employeeId}|${data.name}|${data.balance}|${data.lastUpdated}`;
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash_ = hash & hash; // Convert to 32bit integer
        }
        const expectedSignature = `sig-${hash}`;
        return data.signature === expectedSignature;
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
            const parsed = JSON.parse(qrInput) as ValidatedData;
            
            // Basic validation for all required fields
            const requiredFields: (keyof ValidatedData)[] = ['id', 'employeeId', 'name', 'balance', 'role', 'lastUpdated', 'signature'];
            const missingField = requiredFields.find(field => !(field in parsed));
            if (missingField) {
                throw new Error(`Missing required field in QR data: ${missingField}`);
            }
            
            setValidatedData(parsed);
            
            const isValid = validateSignature(parsed);
            setSignatureValid(isValid);
            if (!isValid) {
                setError("Digital signature is invalid! The data may have been tampered with.");
            }

        } catch (e) {
            setError("Invalid QR data format. Please paste the correct JSON data.");
        }
    };
    
    const handleReset = () => {
        setQrInput('');
        setValidatedData(null);
        setError(null);
        setSignatureValid(false);
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><QrCode/> Offline Transaction Validator</CardTitle>
                <CardDescription>Paste the QR code data from the user's app to validate the payment details offline.</CardDescription>
            </CardHeader>
            <CardContent>
                {validatedData || error ? (
                    <div className='space-y-4'>
                        {error && !signatureValid && (
                             <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Validation Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {validatedData && (
                            <>
                                {signatureValid ? (
                                    <Alert className='bg-accent/10 border-accent text-accent-foreground'>
                                        <CheckCircle className="h-4 w-4 text-accent" />
                                        <AlertTitle className='text-accent-foreground/90'>Payment Data Validated</AlertTitle>
                                        <AlertDescription className='text-accent-foreground/80'>
                                            The digital signature is valid.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <ShieldAlert className="h-4 w-4" />
                                        <AlertTitle>Signature Invalid!</AlertTitle>
                                        <AlertDescription>
                                            The QR code data may be fraudulent. Do not accept this payment.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <div className='p-4 border rounded-md space-y-2 text-sm'>
                                    <h3 className='font-semibold mb-2 text-base'>User Details</h3>
                                    <p><strong>Name:</strong> {validatedData.name}</p>
                                    <p><strong>Employee ID:</strong> {validatedData.employeeId}</p>
                                    <p><strong>Final Balance:</strong> {validatedData.balance} Tokens</p>
                                    <p><strong>Last Updated:</strong> {format(new Date(validatedData.lastUpdated), 'PPp')}</p>
                                    <p className='font-mono text-xs text-muted-foreground pt-2'>
                                        <strong>User ID:</strong> {validatedData.id}<br/>
                                        <strong>Signature:</strong> {validatedData.signature}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <Textarea 
                        placeholder='Paste QR data here... e.g., {"id": "...", "employeeId": "E12345", ...}'
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
                    <Button onClick={handleValidate}>Validate Payment Data</Button>
                )}
            </CardFooter>
        </Card>
    );
}
