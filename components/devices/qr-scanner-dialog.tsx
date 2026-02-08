'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, Loader2 } from 'lucide-react';
import { getDeviceByAssetId, getDeviceByUuid } from '@/lib/actions/device';
import { toast } from 'sonner';

export function QRScannerDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleScan = async (detectedCodes: any[]) => {
        if (loading || !detectedCodes.length) return;

        const code = detectedCodes[0].rawValue;
        if (!code) return;

        setLoading(true);
        try {
            let device = await getDeviceByUuid(code);
            if (!device) {
                device = await getDeviceByAssetId(code);
            }
            if (device) {
                toast.success('Device found!', {
                    description: `Redirecting to ${device.deviceName || device.assetId}...`,
                });
                setOpen(false);
                router.push(`/dashboard/devices/${device.id}`);
            } else {
                toast.error('Device not found', {
                    description: `No device found with Asset ID: ${code}`,
                });
            }
        } catch (error) {
            console.error('Scan error:', error);
            toast.error('Error', {
                description: 'Failed to look up device.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Device QR Code</DialogTitle>
                    <DialogDescription>
                        Point your camera at a device QR code to view its details.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-4">
                    <div className="aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border bg-muted relative">
                        {open && (
                            <Scanner
                                onScan={handleScan}
                                onError={(error) => console.error(error)}
                                components={{
                                    onOff: true,
                                    torch: true,
                                }}
                            />
                        )}
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
