
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, QrCode, ShieldAlert, XCircle, ArrowLeft, Utensils, Ticket, VideoOff } from 'lucide-react';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import jsQR from "jsqr";

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
    const [validatedData, setValidatedData] = useState<QrCodeData | null>(null);
    const [scannedUser, setScannedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [signatureValid, setSignatureValid] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    const { users, spendTokensFromUser } = useCanteenPass();
    const { toast } = useToast();
    const router = useRouter();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const validateSignature = (data: QrCodeData) => {
        const dataString = `${data.employee_id}|${data.timestamp}|CanteenPass-Secret-Key`; // Added a static "secret"
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

    const handleValidate = useCallback((qrInput: string) => {
        setError(null);
        setValidatedData(null);
        setSignatureValid(false);
        setIsScanning(false); // Stop scanning once a QR code is processed

        if (!qrInput.trim()) {
            setError("QR data cannot be empty.");
            setIsScanning(true);
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
            setError("Invalid QR data format. Scanned data is not valid JSON.");
        }
    }, [users]);


    const tick = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && isScanning) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });

                    if (code) {
                        handleValidate(code.data);
                    }
                }
            }
        }
        if (isScanning) {
            requestAnimationFrame(tick);
        }
    }, [isScanning, handleValidate]);


    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setHasCameraPermission(true);
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this app.',
            });
          }
        };
    
        getCameraPermission();
    
        return () => {
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
        };
      }, [toast]);
      
      useEffect(() => {
        if (hasCameraPermission && isScanning) {
            const animationFrameId = requestAnimationFrame(tick);
            return () => cancelAnimationFrame(animationFrameId);
        }
    }, [hasCameraPermission, isScanning, tick]);


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
        setValidatedData(null);
        setScannedUser(null);
        setError(null);
        setSignatureValid(false);
        setIsScanning(true);
    }

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
                    {!validatedData && !error ? (
                        <>
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className="absolute inset-0 border-[8px] border-primary/50 rounded-lg" />
                            {hasCameraPermission === false && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4">
                                    <VideoOff className="h-12 w-12 mb-4" />
                                    <h3 className="text-xl font-bold">Camera Access Denied</h3>
                                    <p className="text-center">Please enable camera permissions to scan QR codes.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='space-y-4 p-4'>
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
                                                <p className='text-sm font-semibold'>Meal Available:</p>
                                                <p className='text-muted-foreground'>Breakfast / Lunch / Dinner</p>
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
                {validatedData && signatureValid && (
                    <>
                        <Button className="w-full h-12 text-lg" onClick={handleDeduct} disabled={scannedUser!.balance < 1}>
                           {scannedUser!.balance < 1 ? 'Insufficient Balance' : <><Utensils className='mr-2' /> Deduct 1 Token & Serve</>}
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="w-full">Cancel & Scan Next</Button>
                    </>
                )}

                {(error || (!isScanning && !validatedData)) && (
                     <Button onClick={handleReset} variant="outline" className='w-full'>Scan Another QR</Button>
                )}
            </CardFooter>
        </Card>
    );
}
