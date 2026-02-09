'use client';

import { useState, useMemo } from 'react';
import { Device } from '@prisma/client';
import { CiaStats } from '@/components/cia/cia-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { updateDeviceCia } from '@/lib/actions/device';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Save, X } from 'lucide-react';

interface CiaClientWrapperProps {
    devices: Device[];
}

export function CiaClientWrapper({ devices }: CiaClientWrapperProps) {
    const router = useRouter();

    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<Device>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Filter state - shared between table and stats
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [centerFilter, setCenterFilter] = useState<string>('all');
    const [stationFilter, setStationFilter] = useState<string>('all');
    const [cFilter, setCFilter] = useState<string>('all');
    const [iFilter, setIFilter] = useState<string>('all');
    const [aFilter, setAFilter] = useState<string>('all');

    // Extract unique values for filter dropdowns
    const sections = useMemo(() =>
        Array.from(new Set(devices.map(d => d.section).filter((s): s is string => !!s))).sort(),
        [devices]
    );
    const centers = useMemo(() =>
        Array.from(new Set(devices.map(d => d.center).filter((s): s is string => !!s))).sort(),
        [devices]
    );
    const stations = useMemo(() =>
        Array.from(new Set(devices.map(d => d.station).filter((s): s is string => !!s))).sort(),
        [devices]
    );

    const IMPORTANCE_LEVELS = [
        '1 - ต่ำ (Low)',
        '2 - ปานกลาง (Medium)',
        '3 - สูง (High)'
    ];

    // Check if any filter is active
    const hasActiveFilters = sectionFilter !== 'all' || centerFilter !== 'all' || stationFilter !== 'all' || cFilter !== 'all' || iFilter !== 'all' || aFilter !== 'all';

    // Clear all filters
    const handleClearFilters = () => {
        setSectionFilter('all');
        setCenterFilter('all');
        setStationFilter('all');
        setCFilter('all');
        setIFilter('all');
        setAFilter('all');
    };

    // Filter devices - used by BOTH stats and table
    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const cMatch = cFilter === 'all' || device.c_score === cFilter;
            const iMatch = iFilter === 'all' || device.i_score === iFilter;
            const aMatch = aFilter === 'all' || device.a_score === aFilter;
            const sectionMatch = sectionFilter === 'all' || device.section === sectionFilter;
            const centerMatch = centerFilter === 'all' || device.center === centerFilter;
            const stationMatch = stationFilter === 'all' || device.station === stationFilter;

            return cMatch && iMatch && aMatch && sectionMatch && centerMatch && stationMatch;
        });
    }, [devices, cFilter, iFilter, aFilter, sectionFilter, centerFilter, stationFilter]);

    // Edit handlers
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

        const formData = new FormData();
        formData.append('c_score', editData.c_score || '');
        formData.append('i_score', editData.i_score || '');
        formData.append('a_score', editData.a_score || '');
        formData.append('hostId', editData.hostId || '');

        try {
            const result = await updateDeviceCia(deviceId, formData);
            if (result.success) {
                toast.success(result.message || 'Asset Importance updated');
                setEditingId(null);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update');
            }
        } catch (error) {
            toast.error('Failed to update');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats charts - use FILTERED devices */}
            <CiaStats devices={filteredDevices} />

            {/* Table with filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Asset Importance Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Filter controls */}
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

                            {/* Clear filter button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="whitespace-nowrap"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    ล้างตัวกรอง
                                </Button>
                            )}
                        </div>

                        {/* Table */}
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
                </CardContent>
            </Card>
        </div>
    );
}
