'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createDevice, updateDevice, DeviceState } from '@/lib/actions/device';
import { Device } from '@prisma/client';
import Link from 'next/link';
import { Loader2, Camera } from 'lucide-react';
import { CameraCapture } from '@/components/devices/camera-capture';
import { useState } from 'react';

const formSchema = z.object({
    assetId: z.string().nullable().optional(),
    status: z.string().min(1, 'Status is required'),
    function: z.string().optional(),
    deviceName: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    ipAddress: z.string().optional(),
    macAddress: z.string().optional(),
    section: z.string().optional(),
    center: z.string().optional(),
    station: z.string().optional(),
    c_score: z.string().optional(),
    i_score: z.string().optional(),
    a_score: z.string().optional(),
    hostId: z.string().optional(),
    image: z.any().optional(),
});

type DeviceFormProps = {
    device?: Device;
};

export function DeviceForm({ device }: DeviceFormProps) {
    const initialState: DeviceState = { message: null, errors: {} };
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    // @ts-ignore - useActionState types can be tricky with server actions depending on react version
    const [state, formAction, isPending] = useActionState(
        device ? updateDevice.bind(null, device.id) : createDevice,
        initialState
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assetId: device?.assetId || '',
            status: device?.status || 'Active',
            function: device?.function || '',
            deviceName: device?.deviceName || '',
            brand: device?.brand || '',
            model: device?.model || '',
            serialNumber: device?.serialNumber || '',
            ipAddress: device?.ipAddress || '',
            macAddress: device?.macAddress || '',
            section: device?.section || '',
            center: device?.center || '',
            station: device?.station || '',
            c_score: device?.c_score?.match(/^\d/)?.[0] || '',
            i_score: device?.i_score?.match(/^\d/)?.[0] || '',
            a_score: device?.a_score?.match(/^\d/)?.[0] || '',
            hostId: device?.hostId || '',
        },
    });

    return (
        <Form {...form}>
            <form action={formAction} className="space-y-8">
                {state?.message && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {state.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="assetId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Asset ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="Asset ID" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                                {state?.errors?.assetId && (
                                    <p className="text-sm font-medium text-destructive">
                                        {state.errors.assetId[0]}
                                    </p>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Repair">Repair</SelectItem>
                                        <SelectItem value="Disposed">Disposed</SelectItem>
                                        <SelectItem value="Spare">Spare</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="status" value={field.value} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="deviceName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Device Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Device Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="function"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Function</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select function" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Server">Server</SelectItem>
                                        <SelectItem value="PC">PC</SelectItem>
                                        <SelectItem value="Laptop">Laptop</SelectItem>
                                        <SelectItem value="Monitor">Monitor</SelectItem>
                                        <SelectItem value="Printer">Printer</SelectItem>
                                        <SelectItem value="Network">Network</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="function" value={field.value} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="Brand" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input placeholder="Model" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Serial Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Serial Number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ipAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>IP Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="IP Address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="macAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>MAC Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="MAC Address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="section"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Section" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="center"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Center</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Center" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="station"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Station</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Station" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security & Host Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <FormField
                            control={form.control}
                            name="hostId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Host ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Host ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="c_score"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confidentiality (C)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select C Score" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1 - ต่ำ (Low)</SelectItem>
                                            <SelectItem value="2">2 - ปานกลาง (Medium)</SelectItem>
                                            <SelectItem value="3">3 - สูง (High)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="i_score"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Integrity (I)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select I Score" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1 - ต่ำ (Low)</SelectItem>
                                            <SelectItem value="2">2 - ปานกลาง (Medium)</SelectItem>
                                            <SelectItem value="3">3 - สูง (High)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="a_score"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Availability (A)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select A Score" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1 - ต่ำ (Low)</SelectItem>
                                            <SelectItem value="2">2 - ปานกลาง (Medium)</SelectItem>
                                            <SelectItem value="3">3 - สูง (High)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Device Image</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <FormItem>
                            <FormLabel>Upload Image</FormLabel>
                            <div className="flex gap-3 items-start">
                                <FormControl>
                                    <Input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        className="flex-1"
                                        key={capturedFile ? capturedFile.name : 'file-input'}
                                    />
                                </FormControl>
                                <CameraCapture
                                    onCapture={(file) => {
                                        setCapturedFile(file);
                                        // Set the file to the hidden input via DataTransfer
                                        const dataTransfer = new DataTransfer();
                                        dataTransfer.items.add(file);
                                        const fileInput = document.querySelector<HTMLInputElement>('input[name="image"]');
                                        if (fileInput) {
                                            fileInput.files = dataTransfer.files;
                                        }
                                    }}
                                />
                            </div>
                            {capturedFile && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    📷 {capturedFile.name}
                                </p>
                            )}
                            <FormDescription>Upload or capture a device image (optional)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/devices">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {device ? 'Update Device' : 'Create Device'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
