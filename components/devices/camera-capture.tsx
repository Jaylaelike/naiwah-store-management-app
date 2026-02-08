'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Camera, SwitchCamera, X, Check, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    triggerLabel?: string;
    triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export function CameraCapture({
    onCapture,
    triggerLabel = 'ถ่ายรูป',
    triggerVariant = 'outline',
}: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [open, setOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async (facing: 'user' | 'environment') => {
        setError(null);
        setCapturedImage(null);

        // Stop existing stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
        } catch (err: any) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                setError('ไม่ได้รับอนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์');
            } else if (err.name === 'NotFoundError') {
                setError('ไม่พบกล้องในอุปกรณ์นี้');
            } else {
                setError('ไม่สามารถเปิดกล้องได้: ' + err.message);
            }
        }
    }, [stream]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (open) {
            startCamera(facingMode);
        } else {
            stopCamera();
            setCapturedImage(null);
            setError(null);
        }

        return () => {
            // Cleanup on unmount
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);

        // Pause video when captured
        stopCamera();
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera(facingMode);
    };

    const handleSwitchCamera = () => {
        const newFacing = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacing);
        startCamera(newFacing);
    };

    const handleConfirm = () => {
        if (!capturedImage) return;

        // Convert data URL to File
        fetch(capturedImage)
            .then(res => res.blob())
            .then(blob => {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const file = new File([blob], `camera-${timestamp}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
                setOpen(false);
            });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button type="button" variant={triggerVariant} className="gap-2">
                        <Camera className="h-4 w-4" />
                        {triggerLabel}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle>ถ่ายรูปอุปกรณ์</DialogTitle>
                        <DialogDescription>
                            ถ่ายรูปอุปกรณ์เพื่อแนบกับข้อมูล
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative bg-black aspect-[4/3] overflow-hidden">
                        {error ? (
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                                <p className="text-white text-center text-sm">{error}</p>
                            </div>
                        ) : capturedImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    <DialogFooter className="p-4 pt-2">
                        {!capturedImage ? (
                            <div className="flex w-full items-center justify-between">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="rounded-full h-14 w-14 p-0"
                                    onClick={handleCapture}
                                    disabled={!!error}
                                >
                                    <Camera className="h-6 w-6" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSwitchCamera}
                                    disabled={!!error}
                                >
                                    <SwitchCamera className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleRetake}
                                    className="gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    ถ่ายใหม่
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    ใช้รูปนี้
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
