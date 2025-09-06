
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
import QRCode from 'qrcode';


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
    const [scanResult, setScanResult] = useState<{data: QrCodeData, user: User, signatureValid: boolean} | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraState, setCameraState] = useState<'loading' | 'denied' | 'active' | 'inactive'>('loading');

    const { users, spendTokensFromUser } = useCanteenPass();
    const { toast } = useToast();
    const router = useRouter();

    const videoRef = useRef<HTMLVideoElement>(null);
    const animationFrameIdRef = useRef<number | null>(null);

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
    
    const stopScanning = useCallback(() => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraState('inactive');
    }, []);

    const handleScan = useCallback((code: string) => {
        stopScanning();
        setIsProcessing(true);
        setError(null);
        setScanResult(null);

        try {
            const parsed = JSON.parse(code) as QrCodeData;
            if (!parsed.employee_id || !parsed.timestamp || !parsed.device_signature) {
                throw new Error("QR code is missing required data.");
            }

            const signatureValid = validateSignature(parsed);
            if (!signatureValid) {
                 setError("Digital signature is invalid! Data may have been tampered with.");
                 setScanResult({ data: parsed, user: {} as User, signatureValid: false });
                 setIsProcessing(false);
                 return;
            }
            
            let userInDb = users.find(u => u.employeeId === parsed.employee_id);
            let finalUser: User;

            if (userInDb) {
                finalUser = userInDb;
            } else {
                 toast({
                    title: "User not in local records",
                    description: "Proceeding based on QR data. Sync app when online.",
                 });
                 finalUser = {
                     id: parsed.employee_id, // Use employeeId as a temporary ID
                     employeeId: parsed.employee_id,
                     name: parsed.name || 'Unknown User',
                     balance: parsed.balance !== undefined ? parsed.balance : 0,
                     transactions: [],
                     role: 'user',
                     lastUpdated: new Date(parsed.timestamp).getTime()
                 };
            }
            
            setScanResult({ data: parsed, user: finalUser, signatureValid });

        } catch (e) {
            setError("Invalid QR code format. Please scan a valid CanteenPass QR code.");
            console.error("QR Parse Error:", e);
        } finally {
            setIsProcessing(false);
        }
    }, [stopScanning, users, toast]);
    
    const tick = useCallback(() => {
        if (!videoRef.current || !videoRef.current.HAVE_ENOUGH_DATA) {
            animationFrameIdRef.current = requestAnimationFrame(tick);
            return;
        }

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code?.data) {
                    handleScan(code.data);
                    return; // Stop ticking once a code is found and handled
                }
            } catch (error) {
                console.error("Error processing video frame for QR", error)
            }
        }
        animationFrameIdRef.current = requestAnimationFrame(tick);
    }, [handleScan]);

    const startScanning = useCallback(async () => {
        if (cameraState === 'active' || isProcessing) return;
        setCameraState('loading');
        setError(null);
        setScanResult(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraState('active');
                animationFrameIdRef.current = requestAnimationFrame(tick);
            }
        } catch (err) {
            console.error('Camera permission error:', err);
            setCameraState('denied');
            setError("Camera permission denied. Please allow camera access in your browser settings.");
        }
    }, [tick, cameraState, isProcessing]);

    useEffect(() => {
        startScanning();
        return () => {
            stopScanning();
        };
    }, [startScanning, stopScanning]);


    const handleDeduct = async () => {
        if (!scanResult?.user || !scanResult.signatureValid) return;
        setIsProcessing(true);

        const mealCost = 1; // Assuming a fixed cost for simplicity
        const mealDescription = scanResult.data.transaction?.description || "Meal served";

        if (scanResult.user.balance < mealCost) {
            toast({
                title: "Insufficient Balance",
                description: `${scanResult.user.name} has only ${scanResult.user.balance} tokens.`,
                variant: 'destructive'
            });
            setIsProcessing(false);
            return;
        }

        const result = await spendTokensFromUser(scanResult.user.id, mealCost, mealDescription);
        
        if (result.success) {
            toast({
                title: "Success",
                description: `${mealCost} token deducted from ${scanResult.user.name}.`,
            });
            router.push('/vendor/dashboard');
        } else {
             toast({
                title: "Deduction Failed",
                description: result.data || "An error occurred.",
                variant: 'destructive'
            });
             setIsProcessing(false);
        }
    }
    
    const handleReset = () => {
        setIsProcessing(false);
        setScanResult(null);
        setError(null);
        startScanning();
    }

    const renderContent = () => {
        if (isProcessing && !scanResult) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                </div>
            );
        }

        if (cameraState === 'loading') {
            return (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            );
        }
        if (cameraState === 'denied') {
             return (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 h-full text-center">
                    <VideoOff className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-bold">Camera Access Denied</h3>
                    <p>{error}</p>
                </div>
            );
        }
        if (scanResult) {
            return (
                <div className='space-y-4 p-4'>
                    {error && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Validation Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {scanResult.signatureValid ? (
                        <Alert className='bg-green-600/10 border-green-600 text-green-700'>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle className='text-green-800'>Signature Valid & User Verified</AlertTitle>
                        </Alert>
                    ) : (
                        <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Signature Invalid!</AlertTitle>
                            <AlertDescription>The QR code data may be fraudulent. Do not trust this data.</AlertDescription>
                        </Alert>
                    )}
                     <Card className='bg-background'>
                        <CardHeader>
                            <CardTitle>{scanResult.user.name}</CardTitle>
                            <CardDescription>{scanResult.user.employeeId}</CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-between items-center'>
                            <div className='flex items-center gap-2'>
                                <Ticket className='h-6 w-6 text-primary'/>
                                <span className='text-xl font-bold'>{scanResult.user.balance}</span>
                                <span className='text-muted-foreground'>Tokens</span>
                            </div>
                            <div>
                                <p className='text-sm font-semibold'>Meal Cost:</p>
                                <p className='text-muted-foreground'>1 Token</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
        return null; // When camera is active, we just show the video feed.
    }


    return (
        <Card className="w-full shadow-lg">
             <Button variant="ghost" size="sm" className="absolute top-4 left-4 z-10" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <CardHeader className='text-center pt-12'>
                <CardTitle className='flex items-center gap-2 justify-center text-3xl'><QrCode/> Scan & Validate</CardTitle>
                <CardDescription>Position the user's QR code within the frame.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border bg-secondary">
                    <video ref={videoRef} className={cn("w-full h-full object-cover", cameraState !== 'active' && 'hidden')} autoPlay playsInline muted />
                    {cameraState === 'active' && !scanResult && <div className="absolute inset-0 border-[8px] border-primary/50 rounded-lg" />}
                    {renderContent()}
                </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-2 pt-4'>
                {scanResult && scanResult.signatureValid ? (
                    <>
                        <Button className="w-full h-12 text-lg" onClick={handleDeduct} disabled={scanResult.user.balance < 1 || isProcessing}>
                           {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Utensils className='mr-2' />}
                           {isProcessing ? 'Processing...' : scanResult.user.balance < 1 ? 'Insufficient Balance' : 'Deduct 1 Token & Serve'}
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="w-full" disabled={isProcessing}>Cancel & Scan Next</Button>
                    </>
                ) : (
                     <Button onClick={handleReset} variant="outline" className='w-full' disabled={cameraState === 'active' || isProcessing}>
                        {scanResult && !scanResult.signatureValid ? 'Scan Another QR' : 'Cancel'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
