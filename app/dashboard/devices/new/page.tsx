import { DeviceForm } from '@/components/devices/device-form';

export default function NewDevicePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Add New Device</h2>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <DeviceForm />
            </div>
        </div>
    );
}
