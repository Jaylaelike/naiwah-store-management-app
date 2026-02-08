'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Device } from '@prisma/client';
import { updateDevice } from '@/lib/actions/device';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

interface CiaTableProps {
    devices: Device[];
}

export function CiaTable({ devices }: CiaTableProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<Device>>({});
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleEdit = (device: Device) => {
        setEditingId(device.id);
        setEditData({
            c_score: device.c_score,
            i_score: device.i_score,
            a_score: device.a_score,
            hostId: device.hostId,
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSave = async (deviceId: number) => {
        setIsSaving(true);
        const device = devices.find((d) => d.id === deviceId);
        if (!device) return;

        const formData = new FormData();
        // Preserve existing fields
        formData.append('assetId', device.assetId);
        formData.append('status', device.status);
        if (device.function) formData.append('function', device.function);
        if (device.deviceName) formData.append('deviceName', device.deviceName);
        if (device.brand) formData.append('brand', device.brand);
        if (device.model) formData.append('model', device.model);
        if (device.serialNumber) formData.append('serialNumber', device.serialNumber);
        if (device.ipAddress) formData.append('ipAddress', device.ipAddress);
        if (device.macAddress) formData.append('macAddress', device.macAddress);
        if (device.section) formData.append('section', device.section);
        if (device.center) formData.append('center', device.center);
        if (device.station) formData.append('station', device.station);

        // Append new CIA fields
        formData.append('c_score', editData.c_score || '');
        formData.append('i_score', editData.i_score || '');
        formData.append('a_score', editData.a_score || '');
        formData.append('hostId', editData.hostId || '');

        try {
            await updateDevice(deviceId, {}, formData);
            toast.success('Asset Importance updated');
            setEditingId(null);
            router.refresh();
        } catch (error) {
            toast.error('Failed to update');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [centerFilter, setCenterFilter] = useState<string>('all');
    const [stationFilter, setStationFilter] = useState<string>('all');
    const [cFilter, setCFilter] = useState<string>('all');
    const [iFilter, setIFilter] = useState<string>('all');
    const [aFilter, setAFilter] = useState<string>('all');

    const sections = Array.from(new Set(devices.map(d => d.section).filter((s): s is string => !!s))).sort();
    const centers = Array.from(new Set(devices.map(d => d.center).filter((s): s is string => !!s))).sort();
    const stations = Array.from(new Set(devices.map(d => d.station).filter((s): s is string => !!s))).sort();

    const IMPORTANCE_LEVELS = [
        '1 - ต่ำ (Low)',
        '2 - ปานกลาง (Medium)',
        '3 - สูง (High)'
    ];

    const filteredDevices = devices.filter(device => {
        const cMatch = cFilter === 'all' || device.c_score === cFilter;
        const iMatch = iFilter === 'all' || device.i_score === iFilter;
        const aMatch = aFilter === 'all' || device.a_score === aFilter;
        const sectionMatch = sectionFilter === 'all' || device.section === sectionFilter;
        const centerMatch = centerFilter === 'all' || device.center === centerFilter;
        const stationMatch = stationFilter === 'all' || device.station === stationFilter;

        return cMatch && iMatch && aMatch && sectionMatch && centerMatch && stationMatch;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex gap-2 w-full md:w-auto flex-wrap">
                    <div className="w-[180px]">
                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sections</SelectItem>
                                {sections.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[180px]">
                        <Select value={centerFilter} onValueChange={setCenterFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Center" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Centers</SelectItem>
                                {centers.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[180px]">
                        <Select value={stationFilter} onValueChange={setStationFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Station" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stations</SelectItem>
                                {stations.map(st => (
                                    <SelectItem key={st} value={st}>{st}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <div className="w-[180px]">
                        <Select value={cFilter} onValueChange={setCFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter C" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Confidentiality</SelectItem>
                                {IMPORTANCE_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[180px]">
                        <Select value={iFilter} onValueChange={setIFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter I" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Integrity</SelectItem>
                                {IMPORTANCE_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[180px]">
                        <Select value={aFilter} onValueChange={setAFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter A" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Availability</SelectItem>
                                {IMPORTANCE_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset ID</TableHead>
                            <TableHead>Device Name</TableHead>
                            <TableHead>Host ID</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Center</TableHead>
                            <TableHead>Station</TableHead>
                            <TableHead className="w-[150px]">Confidentiality</TableHead>
                            <TableHead className="w-[150px]">Integrity</TableHead>
                            <TableHead className="w-[150px]">Availability</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDevices.map((device) => (
                            <TableRow key={device.id}>
                                <TableCell className="font-medium">{device.assetId}</TableCell>
                                <TableCell>{device.deviceName}</TableCell>
                                <TableCell>
                                    {editingId === device.id ? (
                                        <Input
                                            value={editData.hostId || ''}
                                            onChange={(e) => setEditData({ ...editData, hostId: e.target.value })}
                                            placeholder="Host ID"
                                        />
                                    ) : (
                                        device.hostId || '-'
                                    )}
                                </TableCell>
                                <TableCell>{device.section || '-'}</TableCell>
                                <TableCell>{device.center || '-'}</TableCell>
                                <TableCell>{device.station || '-'}</TableCell>
                                <TableCell>
                                    {editingId === device.id ? (
                                        <Select
                                            value={editData.c_score || ''}
                                            onValueChange={(val) => setEditData({ ...editData, c_score: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {IMPORTANCE_LEVELS.map((level) => (
                                                    <SelectItem key={level} value={level}>
                                                        {level}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${device.c_score?.includes('3') ? 'bg-red-100 text-red-700' :
                                            device.c_score?.includes('2') ? 'bg-yellow-100 text-yellow-700' :
                                                device.c_score?.includes('1') ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {device.c_score || '-'}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === device.id ? (
                                        <Select
                                            value={editData.i_score || ''}
                                            onValueChange={(val) => setEditData({ ...editData, i_score: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {IMPORTANCE_LEVELS.map((level) => (
                                                    <SelectItem key={level} value={level}>
                                                        {level}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${device.i_score?.includes('3') ? 'bg-red-100 text-red-700' :
                                            device.i_score?.includes('2') ? 'bg-yellow-100 text-yellow-700' :
                                                device.i_score?.includes('1') ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {device.i_score || '-'}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === device.id ? (
                                        <Select
                                            value={editData.a_score || ''}
                                            onValueChange={(val) => setEditData({ ...editData, a_score: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {IMPORTANCE_LEVELS.map((level) => (
                                                    <SelectItem key={level} value={level}>
                                                        {level}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${device.a_score?.includes('3') ? 'bg-red-100 text-red-700' :
                                            device.a_score?.includes('2') ? 'bg-yellow-100 text-yellow-700' :
                                                device.a_score?.includes('1') ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {device.a_score || '-'}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === device.id ? (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave(device.id)}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleCancel}
                                                disabled={isSaving}
                                            >
                                                X
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(device)}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
