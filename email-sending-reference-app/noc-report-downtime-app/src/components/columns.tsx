"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatForDisplay, formatDateOnly } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteDialog } from "./delete-dialog";

export type DowntimeRecord = {
    id: number;
    Site: string;
    FacilityProvider: string;
    EngineeringCenter: string;
    PostingDate: Date;
    DowntimeStart: Date;
    DowntimeEnd: Date;
    DowntimeTotal: string;
    Detail: string;
    JobTickets: string;
    Reporter: string;
    Approver: string | null;
    Remark: string;
};

// Row Actions component to handle delete with dialog
function RowActions({
    record,
    onDeleted
}: {
    record: DowntimeRecord;
    onDeleted: () => void;
}) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Link href={`/edit/${record.id}`}>
                    <Pencil className="h-4 w-4" />
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <DeleteDialog
                recordId={record.id}
                recordSite={record.Site}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onDeleted={onDeleted}
            />
        </div>
    );
}

// Factory function to create columns with onDeleted callback
export function createColumns(onDeleted: () => void): ColumnDef<DowntimeRecord>[] {
    return [
        {
            accessorKey: "Site",
            header: "Site",
        },
        {
            accessorKey: "FacilityProvider",
            header: "Facility",
        },
        {
            accessorKey: "EngineeringCenter",
            header: "Eng. Center",
        },
        {
            accessorKey: "PostingDate",
            header: "Posting Date",
            cell: ({ row }) => formatDateOnly(row.getValue("PostingDate")),
        },
        {
            accessorKey: "DowntimeStart",
            header: "Start Time",
            cell: ({ row }) => formatForDisplay(row.getValue("DowntimeStart")),
        },
        {
            accessorKey: "DowntimeEnd",
            header: "End Time",
            cell: ({ row }) => formatForDisplay(row.getValue("DowntimeEnd")),
        },
        {
            accessorKey: "DowntimeTotal",
            header: "Total",
        },
        {
            accessorKey: "Reporter",
            header: "Reporter",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const record = row.original;
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <RowActions record={record} onDeleted={onDeleted} />
                    </div>
                );
            },
        },
    ];
}

// Export columns as static for backward compatibility (without delete callback)
export const columns: ColumnDef<DowntimeRecord>[] = createColumns(() => { });
