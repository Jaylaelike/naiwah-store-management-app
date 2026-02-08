'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Clock } from 'lucide-react';
import { transferDevice } from '@/lib/actions/history';
import { toast } from 'sonner';

interface TransferDialogProps {
    deviceId: number;
    currentLocation?: {
        section?: string | null;
        center?: string | null;
        station?: string | null;
    };
}

export function TransferDialog({ deviceId, currentLocation }: TransferDialogProps) {
    const [open, setOpen] = useState(false);
    const [section, setSection] = useState(currentLocation?.section || '');
    const [center, setCenter] = useState(currentLocation?.center || '');
    const [station, setStation] = useState(currentLocation?.station || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await transferDevice(deviceId, section, center, station);
            if (result.success) {
                if (result.pending) {
                    toast.info('ส่งคำขอย้ายอุปกรณ์แล้ว รอการอนุมัติจากผู้ดูแลระบบ', {
                        icon: <Clock className="h-4 w-4" />,
                        duration: 5000,
                    });
                } else {
                    toast.success(result.message || 'Device transferred successfully');
                }
                setOpen(false);
            } else {
                toast.error(result.error || 'Failed to transfer device');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer Device</DialogTitle>
                    <DialogDescription>
                        Move this device to a new location. Transfer requests require admin approval.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="section">Section</Label>
                            <Input
                                id="section"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                placeholder="e.g. IT"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="center">Center</Label>
                            <Input
                                id="center"
                                value={center}
                                onChange={(e) => setCenter(e.target.value)}
                                placeholder="e.g. HQ"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="station">Station</Label>
                            <Input
                                id="station"
                                value={station}
                                onChange={(e) => setStation(e.target.value)}
                                placeholder="e.g. Desk 1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Transfer Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
