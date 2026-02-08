'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Device, DeviceImage } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash, ImageIcon } from 'lucide-react';
import { pb } from '@/lib/pocketbase';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/status-badge';
import Link from 'next/link';
// import { deleteDevice } from '@/lib/actions/device'; // We might need a client-side wrapper or use transition

export const columns: ColumnDef<Device & { images: DeviceImage[] }>[] = [
    {
        id: 'image',
        header: 'Image',
        cell: ({ row }) => {
            const images = row.original.images || [];
            if (images.length === 0) {
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                );
            }
            const image = images[0];
            let imageUrl = image.url;

            if (image.pbCollectionId && image.pbRecordId && image.pbFilename) {
                const record = {
                    collectionId: image.pbCollectionId,
                    id: image.pbRecordId,
                };
                // Use small thumbnail for list view
                imageUrl = pb.files.getURL(record as any, image.pbFilename, { thumb: '100x100' });
            }

            return (
                <div className="relative h-10 w-10 overflow-hidden rounded border bg-muted">
                    <Image
                        src={imageUrl}
                        alt="Device"
                        fill
                        className="object-cover"
                    />
                </div>
            );
        },
    },
    {
        accessorKey: 'assetId',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Asset ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <StatusBadge status={status} />;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'deviceName',
        header: 'Name',
    },
    {
        accessorKey: 'brand',
        header: 'Brand',
    },
    {
        accessorKey: 'model',
        header: 'Model',
    },
    {
        accessorKey: 'serialNumber',
        header: 'Serial',
    },
    {
        id: 'location',
        accessorFn: (row) => {
            const parts = [row.section, row.center, row.station].filter(Boolean);
            return parts.length > 0 ? parts.join(' > ') : '-';
        },
        header: 'Location',
        cell: ({ getValue }) => {
            return <div>{getValue() as string}</div>;
        },
    },
    {
        accessorKey: 'section',
        header: 'Section',
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'center',
        header: 'Center',
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'station',
        header: 'Station',
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const device = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(device.assetId)}
                        >
                            Copy Asset ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/devices/${device.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/devices/${device.id}/edit`} className="flex items-center cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        {/* We'll implement delete as a separate action/dialog later to be safe */}
                        {/* <DropdownMenuItem className="text-red-600">
                             <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
