'use client';

import { pb } from '@/lib/pocketbase';
import { DeviceImage } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { removeDeviceImage } from '@/lib/actions/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ImageGalleryProps {
    images: DeviceImage[];
    canDelete?: boolean;
}

export function ImageGallery({ images, canDelete = false }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<DeviceImage | null>(null);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent, imageId: number) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await removeDeviceImage(imageId, images[0].deviceId); // deviceId needed for revalidation
            toast.success('Image deleted');
            if (selectedImage?.id === imageId) setSelectedImage(null);
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    // Helper to generate optimized URL
    const getImageUrl = (image: DeviceImage, thumb?: string) => {
        // If we have PB metadata, reconstruct URL with options
        if (image.pbCollectionId && image.pbRecordId && image.pbFilename) {
            // Mock object for SDK
            const record = {
                collectionId: image.pbCollectionId,
                id: image.pbRecordId,
            };
            return pb.files.getURL(record as any, image.pbFilename, thumb ? { thumb } : undefined);
        }
        return image.url; // Fallback to stored URL
    };

    if (images.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed bg-muted/50">
                <p className="text-sm text-muted-foreground">No images uploaded</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image) => (
                    <div
                        key={image.id}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted"
                        onClick={() => setSelectedImage(image)}
                    >
                        <Image
                            src={getImageUrl(image, '300x300')}
                            alt="Device Image"
                            fill
                            className="object-cover transition-all hover:scale-105"
                        />
                        {canDelete && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={(e) => handleDelete(e, image.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/50 backdrop-blur-sm">
                        {selectedImage && (
                            <Image
                                src={getImageUrl(selectedImage)}
                                alt="Full size"
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
