'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AppSettings {
    emailEnabled: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                setSettings(await res.json());
            }
        } catch {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSetting = async (key: keyof AppSettings, value: boolean) => {
        setSaving(true);
        const prev = settings;
        setSettings((s) => s ? { ...s, [key]: value } : s);

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value }),
            });

            if (!res.ok) throw new Error();

            const updated = await res.json();
            setSettings(updated);
            toast.success('Settings updated');
        } catch {
            setSettings(prev);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
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
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    ตั้งค่าระบบ
                </h2>
                <p className="text-muted-foreground">
                    จัดการการตั้งค่าระบบสำหรับผู้ดูแลระบบ
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        การแจ้งเตือนทางอีเมล
                    </CardTitle>
                    <CardDescription>
                        ควบคุมการส่งอีเมลแจ้งเตือนของระบบ
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-toggle" className="text-base font-medium">
                                เปิดใช้งานการส่งอีเมล
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                เมื่อเปิดใช้งาน ระบบจะส่งอีเมลแจ้งเตือนเมื่อมีการอนุมัติคำขอ, การซ่อม, หรือการเปลี่ยนแปลงอุปกรณ์
                            </p>
                        </div>
                        <Switch
                            id="email-toggle"
                            checked={settings?.emailEnabled ?? false}
                            onCheckedChange={(checked) => updateSetting('emailEnabled', checked)}
                            disabled={saving}
                        />
                    </div>

                    <div className={`rounded-lg p-4 text-sm ${settings?.emailEnabled
                        ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                        : 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200'
                        }`}>
                        {settings?.emailEnabled
                            ? '✅ ระบบอีเมลเปิดใช้งานอยู่ — อีเมลจะถูกส่งเมื่อมีเหตุการณ์สำคัญ'
                            : '⚠️ ระบบอีเมลปิดอยู่ — จะไม่มีการส่งอีเมลแจ้งเตือนใดๆ'
                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
