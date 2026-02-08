import { PdfExportButton } from '@/components/devices/pdf-export-button';
import { getDeviceHistory } from '@/lib/actions/history';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { getDeviceById } from '@/lib/actions/device';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { notFound } from 'next/navigation';
import QRCode from 'react-qr-code';
import { StatusBadge } from '@/components/status-badge';
import { ImageGallery } from '@/components/devices/image-gallery';
import { ImageUpload } from '@/components/devices/image-upload';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryList } from '@/components/devices/history-list';
import { AddRepairDialog } from '@/components/devices/add-repair-dialog';
import { TransferDialog } from '@/components/devices/transfer-dialog';

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deviceId = parseInt(id);
    if (isNaN(deviceId)) notFound();

    const device = await getDeviceById(deviceId);
    if (!device) notFound();

    const history = await getDeviceHistory(deviceId);
    const repairs = history.filter((item) => item.type === 'Repair');
    const audits = history.filter((item) => item.type === 'Update' || item.type === 'Transfer');

    // --- FILENAME GENERATION ---
    const dateStr = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
    const assetIdClean = (device.assetId || 'Unknown').replace(/\s+/g, '_');
    const exportFileName = `${assetIdClean}_Report_${dateStr}`;

    // --- STYLE VARIABLES ---
    const formalBorderStyle = '1px solid #000000';
    const formalCellPadding = '0.4rem 0.75rem';
    const formalHeaderBg = '#f3f4f6';

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return '-';
        return format(date, 'dd/MM/yyyy HH:mm');
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                .official-font { font-family: 'Sarabun', sans-serif; }
                
                /* Override Tailwind 4 variables for html2canvas compatibility */
                #formal-report-content {
                    --background: #ffffff;
                    --foreground: #000000;
                    --card: #ffffff;
                    --card-foreground: #000000;
                    --popover: #ffffff;
                    --popover-foreground: #000000;
                    --primary: #000000;
                    --primary-foreground: #ffffff;
                    --secondary: #f3f4f6;
                    --secondary-foreground: #000000;
                    --muted: #f3f4f6;
                    --muted-foreground: #6b7280;
                    --accent: #f3f4f6;
                    --accent-foreground: #000000;
                    --destructive: #ef4444;
                    --border: #e5e7eb;
                    --input: #e5e7eb;
                    --ring: #000000;
                    --radius: 0;
                }
                #formal-report-content * {
                    border-color: #e5e7eb; /* Fallback */
                }
            `}} />

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/devices">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{device.deviceName || device.assetId}</h2>
                        <p className="text-muted-foreground">Asset ID: {device.assetId}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <TransferDialog
                        deviceId={device.id}
                        currentLocation={{
                            section: device.section,
                            center: device.center,
                            station: device.station
                        }}
                    />
                    <AddRepairDialog deviceId={device.id} />
                    {/* Replaced PrintButton with PdfExportButton for formal report */}
                    <PdfExportButton elementId="formal-report-content" fileName={exportFileName} />
                    <Button asChild>
                        <Link href={`/dashboard/devices/${device.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Device Information</CardTitle>
                            <CardDescription>General details about the device.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                                    <div className="mt-1">
                                        <StatusBadge status={device.status} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Function</h4>
                                    <div className="mt-1 text-sm font-medium">{device.function || '-'}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
                                    <div className="mt-1 text-sm font-medium">{device.brand || '-'}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Model</h4>
                                    <div className="mt-1 text-sm font-medium">{device.model || '-'}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Serial Number</h4>
                                    <div className="mt-1 text-sm font-medium">{device.serialNumber || '-'}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">IP Address</h4>
                                    <div className="mt-1 text-sm font-medium">{device.ipAddress || '-'}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">MAC Address</h4>
                                    <div className="mt-1 text-sm font-medium">{device.macAddress || '-'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                            <CardDescription>Where the device is currently located.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Section</h4>
                                    <div className="mt-1 text-sm font-medium">{device.section || '-'}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Center</h4>
                                    <div className="mt-1 text-sm font-medium">{device.center || '-'}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Station</h4>
                                    <div className="mt-1 text-sm font-medium">{device.station || '-'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Asset Importance (CIA)</CardTitle>
                            <CardDescription>Security categorization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Confidentiality</h4>
                                    <div className="mt-1">
                                        {device.c_score ? (
                                            <Badge className={cn(
                                                "text-sm px-3 py-1",
                                                device.c_score.includes('3') ? "bg-red-500 hover:bg-red-600 text-white" :
                                                    device.c_score.includes('2') ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                                                        "bg-green-500 hover:bg-green-600 text-white"
                                            )}>
                                                {device.c_score}
                                            </Badge>
                                        ) : <span className="text-muted-foreground">-</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Integrity</h4>
                                    <div className="mt-1">
                                        {device.i_score ? (
                                            <Badge className={cn(
                                                "text-sm px-3 py-1",
                                                device.i_score.includes('3') ? "bg-red-500 hover:bg-red-600 text-white" :
                                                    device.i_score.includes('2') ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                                                        "bg-green-500 hover:bg-green-600 text-white"
                                            )}>
                                                {device.i_score}
                                            </Badge>
                                        ) : <span className="text-muted-foreground">-</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Availability</h4>
                                    <div className="mt-1">
                                        {device.a_score ? (
                                            <Badge className={cn(
                                                "text-sm px-3 py-1",
                                                device.a_score.includes('3') ? "bg-red-500 hover:bg-red-600 text-white" :
                                                    device.a_score.includes('2') ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                                                        "bg-green-500 hover:bg-green-600 text-white"
                                            )}>
                                                {device.a_score}
                                            </Badge>
                                        ) : <span className="text-muted-foreground">-</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Host ID</h4>
                                    <div className="mt-1 text-sm font-medium">{device.hostId || '-'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Images</CardTitle>
                            <CardDescription>Device photos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ImageGallery images={device.images || []} canDelete={true} />
                            <Separator />
                            <div className="max-w-sm">
                                <h4 className="text-sm font-medium mb-3">Upload New Image</h4>
                                <ImageUpload deviceId={device.id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Section */}
                    <HistoryList deviceId={device.id} />
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code</CardTitle>
                            <CardDescription>Scan to view device details.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <QRCode value={device.uuid || device.assetId} size={150} />
                            </div>
                            <p className="mt-4 text-sm text-center text-muted-foreground font-mono">
                                {device.assetId}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- HIDDEN PRINT TEMPLATE (Formal Official Style) --- */}
            <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
                <div id="formal-report-content">
                    {/* Page 1: Device Details & Location */}
                    <div
                        className="pdf-page official-font"
                        style={{
                            width: '210mm',
                            height: '296mm', // Slightly less than 297 to avoid overflow issues often
                            backgroundColor: '#ffffff',
                            padding: '15mm 20mm',
                            color: '#000000',
                            fontSize: '16px',
                            lineHeight: '1.4',
                            position: 'relative'
                        }}
                    >
                        {/* Header with Logo */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 0.25rem 0', color: '#000' }}>
                                แบบฟอร์มทะเบียนทรัพย์สิน (Asset Registration Form)
                            </h1>
                            <p style={{ fontSize: '16px', margin: 0 }}>
                                ฝ่ายบริหารจัดการทรัพย์สิน (Asset Management Department)
                            </p>
                            <div style={{ position: 'absolute', top: '15mm', right: '20mm', textAlign: 'right', fontSize: '12px' }}>
                                <p style={{ margin: 0 }}><strong>Page 1</strong></p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0 }}><strong>Asset ID:</strong> {device.assetId}</p>
                                <p style={{ margin: 0 }}><strong>Date:</strong> {formatDate(new Date())}</p>
                            </div>
                        </div>

                        {/* Table 1: Device Details */}
                        <div style={{ border: formalBorderStyle, marginBottom: '1.5rem' }}>
                            <div style={{ backgroundColor: formalHeaderBg, padding: formalCellPadding, borderBottom: formalBorderStyle, fontWeight: 'bold' }}>
                                1. ข้อมูลอุปกรณ์ (Device Information)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: formalBorderStyle }}>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>ชื่ออุปกรณ์ (Device Name)</span>
                                    <strong>{device.deviceName || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>รหัสทรัพย์สิน (Asset ID)</span>
                                    <strong>{device.assetId}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: formalBorderStyle }}>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>ยี่ห้อ (Brand)</span>
                                    <strong>{device.brand || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>รุ่น (Model)</span>
                                    <strong>{device.model || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Serial Number</span>
                                    <strong>{device.serialNumber || "-"}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: formalBorderStyle }}>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>IP Address</span>
                                    <strong>{device.ipAddress || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>MAC Address</span>
                                    <strong>{device.macAddress || "-"}</strong>
                                </div>
                            </div>
                            <div style={{ padding: formalCellPadding }}>
                                <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Function/Role</span>
                                <strong>{device.function || "-"}</strong>
                            </div>
                        </div>

                        {/* Table 2: Location & CIA */}
                        <div style={{ border: formalBorderStyle, marginBottom: '1.5rem' }}>
                            <div style={{ backgroundColor: formalHeaderBg, padding: formalCellPadding, borderBottom: formalBorderStyle, fontWeight: 'bold' }}>
                                2. สถานที่ตั้งและความสำคัญ (Location & Importance)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: formalBorderStyle }}>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Section</span>
                                    <strong>{device.section || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Center</span>
                                    <strong>{device.center || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Station</span>
                                    <strong>{device.station || "-"}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: formalBorderStyle }}>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Host ID</span>
                                    <strong>{device.hostId || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Confidentiality</span>
                                    <strong>{device.c_score || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Integrity</span>
                                    <strong>{device.i_score || "-"}</strong>
                                </div>
                                <div style={{ padding: formalCellPadding }}>
                                    <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>Availability</span>
                                    <strong>{device.a_score || "-"}</strong>
                                </div>
                            </div>
                        </div>

                        {/* If no history, show Signatures here? Or just always put signatures on Page 1 if space permits? */}
                        {/* For consistency with "multi-page for long data", let's put signatures on Page 1 if history is empty. 
                            But to simplify logic for "too long data", I'll put signatures on a final page or at bottom of last content.
                            Let's add a condition: if (repairs.length + audits.length === 0) render Signatures here.
                        */}
                        {repairs.length === 0 && audits.length === 0 && (
                            <div style={{ marginTop: '3rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                                    <div style={{ textAlign: 'center', width: '40%' }}>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <p style={{ margin: 0, fontSize: '14px' }}>ลงชื่อ ........................................................... ผู้ตรวจสอบ</p>
                                        </div>
                                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>(................................................)</p>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>ตำแหน่ง: เจ้าหน้าที่</p>
                                    </div>
                                    <div style={{ textAlign: 'center', width: '40%' }}>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <p style={{ margin: 0, fontSize: '14px' }}>ลงชื่อ ........................................................... ผู้อนุมัติ</p>
                                        </div>
                                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>(................................................)</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                    <QRCode value={device.uuid || device.assetId} size={100} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* History Pages */}
                    {(() => {
                        const ITEMS_PER_PAGE = 18;
                        const pages = [];
                        let allHistory = [
                            ...repairs.map(r => ({ ...r, category: 'Repair' })),
                            ...audits.map(a => ({ ...a, category: 'Edit' }))
                        ]; // Just chunking them separately is better for headers

                        // Chunk Repairs
                        for (let i = 0; i < repairs.length; i += ITEMS_PER_PAGE) {
                            pages.push({
                                type: 'Repair',
                                items: repairs.slice(i, i + ITEMS_PER_PAGE),
                                pageNum: pages.length + 2
                            });
                        }

                        // Chunk Audits
                        for (let i = 0; i < audits.length; i += ITEMS_PER_PAGE) {
                            pages.push({
                                type: 'Edit',
                                items: audits.slice(i, i + ITEMS_PER_PAGE),
                                pageNum: pages.length + 2
                            });
                        }

                        // If we have history pages, render them
                        return pages.map((page, pageIndex) => (
                            <div
                                key={`history-page-${pageIndex}`}
                                className="pdf-page official-font"
                                style={{
                                    width: '210mm',
                                    height: '296mm',
                                    backgroundColor: '#ffffff',
                                    padding: '15mm 20mm',
                                    color: '#000000',
                                    fontSize: '16px',
                                    lineHeight: '1.4',
                                    position: 'relative',
                                    marginTop: '20px' // Separation needed? html-to-image captures standard elements.
                                    // Actually hidden div layout matters. keeping them stacked is fine.
                                }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                                        {page.type === 'Repair' ? '3. ประวัติการซ่อม (Repair History)' : '4. ประวัติการแก้ไขข้อมูล (Edit History)'}
                                    </h4>
                                    <p style={{ fontSize: '14px', margin: 0, color: '#666' }}>
                                        (Continued) - {device.deviceName} ({device.assetId})
                                    </p>
                                    <div style={{ position: 'absolute', top: '15mm', right: '20mm', textAlign: 'right', fontSize: '12px' }}>
                                        <p style={{ margin: 0 }}><strong>Page {page.pageNum}</strong></p>
                                    </div>
                                </div>

                                <div style={{ border: formalBorderStyle }}>
                                    {page.type === 'Repair' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 150px', borderBottom: formalBorderStyle, fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>Date</div>
                                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>Description</div>
                                            <div style={{ padding: formalCellPadding }}>Logged By</div>
                                        </div>
                                    )}
                                    {page.type === 'Edit' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '150px 100px 1fr 150px', borderBottom: formalBorderStyle, fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>Date</div>
                                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>Type</div>
                                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>Description</div>
                                            <div style={{ padding: formalCellPadding }}>User</div>
                                        </div>
                                    )}

                                    {page.items.map((item, idx) => (
                                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: page.type === 'Repair' ? '150px 1fr 150px' : '150px 100px 1fr 150px', borderBottom: idx === page.items.length - 1 ? 'none' : formalBorderStyle }}>
                                            {page.type === 'Repair' ? (
                                                <>
                                                    <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle, fontSize: '14px' }}>
                                                        {formatDate(item.date)}
                                                    </div>
                                                    <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle, fontSize: '14px' }}>
                                                        {item.description}
                                                    </div>
                                                    <div style={{ padding: formalCellPadding, fontSize: '14px' }}>
                                                        {item.user?.name || '-'}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle, fontSize: '14px' }}>
                                                        {formatDate(item.date)}
                                                    </div>
                                                    <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle, fontSize: '14px' }}>
                                                        {(item as any).type}
                                                    </div>
                                                    <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle, fontSize: '14px' }}>
                                                        {item.description}
                                                        {(item as any).type === 'Transfer' && (item as any).details.from && (
                                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                {(item as any).details.from} &rarr; {(item as any).details.to}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: formalCellPadding, fontSize: '14px' }}>
                                                        {item.user?.name || '-'}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Signatures on the VERY LAST page */}
                                {pageIndex === pages.length - 1 && (
                                    <div style={{ marginTop: '3rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                                            <div style={{ textAlign: 'center', width: '40%' }}>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <p style={{ margin: 0, fontSize: '14px' }}>ลงชื่อ ........................................................... ผู้ตรวจสอบ</p>
                                                </div>
                                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>(................................................)</p>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>ตำแหน่ง: เจ้าหน้าที่</p>
                                            </div>
                                            <div style={{ textAlign: 'center', width: '40%' }}>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <p style={{ margin: 0, fontSize: '14px' }}>ลงชื่อ ........................................................... ผู้อนุมัติ</p>
                                                </div>
                                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>(................................................)</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                            <QRCode value={device.uuid || device.assetId} size={100} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ));
                    })()}
                </div>
            </div>

        </div>
    );
}
