'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Upload, HardDrive, Clock, FileArchive, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface BackupInfo {
    database: {
        path: string;
        size: number;
        lastModified: string;
    };
    backups: {
        name: string;
        size: number;
        date: string;
    }[];
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function BackupPage() {
    const [info, setInfo] = useState<BackupInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchInfo = useCallback(async () => {
        try {
            const res = await fetch('/api/backup/info');
            if (res.ok) {
                const data = await res.json();
                setInfo(data);
            }
        } catch {
            console.error('Failed to fetch backup info');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    const handleExport = async () => {
        setExporting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/backup/export');
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const disposition = res.headers.get('Content-Disposition');
            const match = disposition?.match(/filename="(.+)"/);
            a.download = match?.[1] || 'backup.db';

            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'ส่งออกฐานข้อมูลสำเร็จ' });
            fetchInfo();
        } catch {
            setMessage({ type: 'error', text: 'ส่งออกฐานข้อมูลล้มเหลว' });
        } finally {
            setExporting(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) return;

        setRestoring(true);
        setMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch('/api/backup/restore', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Restore failed');
            }

            setMessage({ type: 'success', text: data.message || 'กู้คืนฐานข้อมูลสำเร็จ กรุณารีสตาร์ทแอปพลิเคชัน' });
            setSelectedFile(null);

            // Reset file input
            const fileInput = document.getElementById('db-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            fetchInfo();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'กู้คืนฐานข้อมูลล้มเหลว' });
        } finally {
            setRestoring(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">สำรองและกู้คืนข้อมูล</h2>
                <p className="text-muted-foreground">
                    จัดการการสำรองและกู้คืนฐานข้อมูล SQLite
                </p>
            </div>

            {message && (
                <div className={`flex items-center gap-2 p-4 rounded-lg border ${message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                    : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
                    }`}>
                    {message.type === 'success'
                        ? <CheckCircle className="h-5 w-5" />
                        : <AlertTriangle className="h-5 w-5" />
                    }
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Database Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        ข้อมูลฐานข้อมูล
                    </CardTitle>
                    <CardDescription>สถานะฐานข้อมูลปัจจุบัน</CardDescription>
                </CardHeader>
                <CardContent>
                    {info?.database ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">ขนาดไฟล์</p>
                                <p className="text-lg font-semibold">{formatBytes(info.database.size)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">แก้ไขล่าสุด</p>
                                <p className="text-lg font-semibold">{formatDate(info.database.lastModified)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">สถานะ</p>
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                    ออนไลน์
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">ไม่พบฐานข้อมูล</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Export / Backup */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-blue-600" />
                            สำรองข้อมูล (Export)
                        </CardTitle>
                        <CardDescription>
                            ดาวน์โหลดไฟล์ฐานข้อมูล SQLite เพื่อสำรองข้อมูล
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            สร้างไฟล์สำรองข้อมูลของฐานข้อมูลทั้งหมดรวมถึงผู้ใช้ อุปกรณ์ และประวัติการซ่อม
                        </p>
                        <Button
                            onClick={handleExport}
                            disabled={exporting}
                            className="w-full"
                        >
                            {exporting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            {exporting ? 'กำลังส่งออก...' : 'ดาวน์โหลดไฟล์สำรอง'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Import / Restore */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-orange-600" />
                            กู้คืนข้อมูล (Restore)
                        </CardTitle>
                        <CardDescription>
                            อัปโหลดไฟล์สำรองเพื่อกู้คืนฐานข้อมูล
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                id="db-file-input"
                                type="file"
                                accept=".db"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            {selectedFile && (
                                <p className="text-sm text-muted-foreground">
                                    ไฟล์ที่เลือก: {selectedFile.name} ({formatBytes(selectedFile.size)})
                                </p>
                            )}
                        </div>

                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                                การกู้คืนจะแทนที่ฐานข้อมูลปัจจุบัน ระบบจะสร้างสำรองอัตโนมัติก่อนดำเนินการ
                            </p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    disabled={!selectedFile || restoring}
                                    className="w-full"
                                >
                                    {restoring ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    {restoring ? 'กำลังกู้คืน...' : 'กู้คืนฐานข้อมูล'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>ยืนยันการกู้คืนฐานข้อมูล</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        การดำเนินการนี้จะแทนที่ฐานข้อมูลปัจจุบันด้วยไฟล์ที่เลือก
                                        ระบบจะสำรองข้อมูลปัจจุบันไว้โดยอัตโนมัติก่อนดำเนินการ
                                        คุณแน่ใจหรือไม่?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRestore} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        ยืนยันกู้คืน
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>

            {/* Backup History */}
            {info?.backups && info.backups.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            ประวัติการสำรอง (Auto-backups)
                        </CardTitle>
                        <CardDescription>
                            ไฟล์สำรองอัตโนมัติที่สร้างก่อนการกู้คืน
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {info.backups.map((backup) => (
                                <div
                                    key={backup.name}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileArchive className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{backup.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(backup.date)} · {formatBytes(backup.size)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
