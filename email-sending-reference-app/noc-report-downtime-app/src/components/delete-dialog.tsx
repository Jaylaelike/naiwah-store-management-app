"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteDowntimeRecord } from "@/app/edit/[id]/actions";

interface DeleteDialogProps {
    recordId: number;
    recordSite: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => void;
}

export function DeleteDialog({
    recordId,
    recordSite,
    open,
    onOpenChange,
    onDeleted,
}: DeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteDowntimeRecord(recordId);
            if (result.success) {
                toast.success("Record deleted successfully");
                onDeleted();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error deleting record:", error);
            toast.error("Failed to delete record");
        } finally {
            setIsDeleting(false);
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                    <AlertDialogDescription>
                        คุณต้องการลบข้อมูล Downtime ของ <strong>{recordSite}</strong> (ID: {recordId}) หรือไม่?
                        <br />
                        <span className="text-red-500">การดำเนินการนี้ไม่สามารถยกเลิกได้</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? "กำลังลบ..." : "ลบ"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
