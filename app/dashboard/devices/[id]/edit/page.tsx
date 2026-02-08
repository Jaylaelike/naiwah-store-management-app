import { DeviceForm } from '@/components/devices/device-form';
import { getDeviceById } from '@/lib/actions/device';
import { notFound } from 'next/navigation';

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // We need to parse the id to integer as our DB uses Int
    const deviceId = parseInt(id);
    if (isNaN(deviceId)) {
        notFound();
    }

    const device = await getDeviceById(deviceId);

    if (!device) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Device</h2>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <DeviceForm device={device} />
            </div>
        </div>
    );
}
