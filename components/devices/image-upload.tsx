'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { pb } from '@/lib/pocketbase';
import { addDeviceImage } from '@/lib/actions/image';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
    deviceId: number;
}

export function ImageUpload({ deviceId }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        try {
            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('device_id', deviceId.toString());

                // Upload to PocketBase
                const record = await pb.collection('device_images').create(formData);

                // Get URL
                const url = pb.files.getURL(record, record.image);

                // Save metadata to local DB
                await addDeviceImage(
                    deviceId,
                    url,
                    record.collectionId,
                    record.id,
                    record.image
                );
            }

            toast.success('Images uploaded successfully');
            setSelectedFiles([]);
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error('Upload failed', {
                description: error.message || 'Check console for details',
            });
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Device Images</Label>
            <Input
                id="picture"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
            />

            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {selectedFiles.map((file, i) => (
                            <div key={i} className="relative aspect-square border rounded-md overflow-hidden bg-muted">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 z-10"
                                    onClick={() => removeFile(i)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="p-2 text-xs flex items-center justify-center h-full break-all text-center">
                                    {file.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleUpload} disabled={uploading} className="w-full">
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
