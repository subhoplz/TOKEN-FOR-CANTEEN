
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, QrCode, ShieldAlert, XCircle, ArrowLeft, Utensils, Ticket, VideoOff, Loader2 } from 'lucide-react';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import jsQR from "jsqr";
import { cn } from '@/lib/utils';

interface QrCodeData {
    employee_id: string;
    timestamp: string;
    device_signature: string;
    name?: string;
    balance?: number;
    transaction?: {
        amount: number;
        description: string;
    }
}

export default function QrValidator() {
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [validatedData, setValidatedData] = useState<QrCodeData | null>(null);
    const [scannedUser, setScannedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [signatureValid, setSignatureValid] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { users, spendTokensFromUser } = useCanteenPass();
    const { toast } = useToast();
    const router = useRouter();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const validateSignature = (data: QrCodeData) => {
        const dataString = `${data.employee_id}|${data.timestamp}|CanteenPass-Secret-Key`;
        let hash = 0;
        if (dataString.length === 0) return data.device_signature === `sig-0`;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const expectedSignature = `sig-${hash}`;
        return data.device_signature === expectedSignature;
    };

    const handleValidationResult = useCallback((qrInput: string) => {
        setIsProcessing(true);
        setError(null);
        setValidatedData(null);
        setScannedUser(null);
        setSignatureValid(false);

        if (!qrInput.trim()) {
            setError("QR data is empty.");
            setIsProcessing(false);
            return;
        }

        try {
            const parsed = JSON.parse(qrInput) as QrCodeData;
            
            const requiredFields: (keyof QrCodeData)[] = ['employee_id', 'timestamp', 'device_signature'];
            if (requiredFields.some(field => !(field in parsed))) {
                throw new Error("Missing required field in QR data.");
            }

            const userInDb = users.find(u => u.employeeId === parsed.employee_id);
            if (!userInDb) {
                 setError("User not found in the local database. The vendor app may need to be online to sync.");
                 setSignatureValid(false);
                 setScannedUser(null);
                 setIsProcessing(false);
                 return;
            }

            setScannedUser(userInDb);
            const displayData = { ...parsed, name: parsed.name || userInDb.name };
            setValidatedData(displayData);
            
            const isValid = validateSignature(parsed);
            setSignatureValid(isValid);
            if (!isValid) {
                setError("Digital signature is invalid! Data may have been tampered with.");
            }
        } catch (e) {
            setError("Invalid QR code. Scanned data is not valid JSON.");
        } finally {
            setIsProcessing(false);
        }
    }, [users]);
    
    
    const stopScanning = useCallback(() => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const tick = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !streamRef.current) {
            return;
        };

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            
            if (context) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });

                if (code && code.data) {
                    setScannedCode(code.data);
                    stopScanning();
                    handleValidationResult(code.data);
                    return; 
                }
            }
        }
        animationFrameIdRef.current = requestAnimationFrame(tick);
    }, [stopScanning, handleValidationResult]);


    const startScanning = useCallback(async () => {
        if (streamRef.current) return; // Camera is already running

        setHasCameraPermission(null);
        setError(null);
        setScannedCode(null);
        setValidatedData(null);
        setScannedUser(null);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setHasCameraPermission(true);
            animationFrameIdRef.current = requestAnimationFrame(tick);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            setError("Camera permission denied. Please allow camera access in your browser settings.");
        }
    }, [tick]);
      
    useEffect(() => {
        startScanning();
        return () => {
            stopScanning();
        };
    }, [startScanning, stopScanning]);

    const handleDeduct = async () => {
        if (!scannedUser || !validatedData) return;
        setIsProcessing(true);

        const mealCost = 1; // Or get from validatedData if transaction is included
        const mealDescription = validatedData.transaction?.description || "Meal served";

        if (scannedUser.balance < mealCost) {
            toast({
                title: "Insufficient Balance",
                description: `${scannedUser.name} has only ${scannedUser.balance} tokens.`,
                variant: 'destructive'
            });
            setIsProcessing(false);
            return;
        }

        const result = await spendTokensFromUser(scannedUser.id, mealCost, mealDescription);
        
        if (result.success) {
            toast({
                title: "Success",
                description: `${mealCost} token deducted from ${scannedUser.name}. New balance: ${scannedUser.balance - mealCost}`,
            });
            handleReset();
        } else {
             toast({
                title: "Failed",
                description: result.data,
                variant: 'destructive'
            });
        }
        setIsProcessing(false);
    }
    
    const handleReset = () => {
        setIsProcessing(false);
        startScanning();
    }

    const isScanning = hasCameraPermission && !scannedCode;
    const showResults = validatedData && scannedUser;
    const showPermissionDenied = hasCameraPermission === false;
    const showLoading = hasCameraPermission === null;


    return (
        <Card className="w-full shadow-lg">
             <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <CardHeader className='text-center pt-12'>
                <CardTitle className='flex items-center gap-2 justify-center text-3xl'><QrCode/> Scan & Validate</CardTitle>
                <CardDescription>Position the user's QR code within the frame to validate.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border bg-secondary">
                    
                    {showLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    )}
                    
                    {showPermissionDenied && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 h-full text-center">
                            <VideoOff className="h-12 w-12 mb-4" />
                            <h3 className="text-xl font-bold">Camera Access Denied</h3>
                            <p>{error}</p>
                        </div>
                    )}

                    <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !isScanning })} autoPlay playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {isScanning && <div className="absolute inset-0 border-[8px] border-primary/50 rounded-lg" />}

                    {(showResults || error) && !isScanning && (
                        <div className='space-y-4 p-4'>
                             {error && (
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Validation Failed</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {showResults && (
                                <>
                                    {signatureValid ? (
                                        <Alert className='bg-green-600/10 border-green-600 text-green-700'>
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertTitle className='text-green-800'>Signature Valid & User Verified</AlertTitle>
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
                                    <Card className='bg-background'>
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
                                                <p className='text-sm font-semibold'>Meal Cost:</p>
                                                <p className='text-muted-foreground'>1 Token</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-2 pt-4'>
                {showResults && signatureValid ? (
                    <>
                        <Button className="w-full h-12 text-lg" onClick={handleDeduct} disabled={scannedUser.balance < 1 || isProcessing}>
                           {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Utensils className='mr-2' />}
                           {isProcessing ? 'Processing...' : scannedUser.balance < 1 ? 'Insufficient Balance' : 'Deduct 1 Token & Serve'}
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="w-full" disabled={isProcessing}>Cancel & Scan Next</Button>
                    </>
                ) : (
                     <Button onClick={handleReset} variant="outline" className='w-full' disabled={isScanning}>
                        {isScanning ? 'Scanning...' : 'Scan Another QR'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

    