"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createReporter, deleteReporter, updateReporter } from "@/app/admin/actions";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Reporter {
    id: number;
    usernameReporter: string;
}

export function ReporterList({ initialReporters }: { initialReporters: Reporter[] }) {
    const [reporters, setReporters] = useState<Reporter[]>(initialReporters);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentReporter, setCurrentReporter] = useState<Reporter | null>(null);
    const [newUsername, setNewUsername] = useState("");
    const [editUsername, setEditUsername] = useState("");

    const handleAdd = async () => {
        try {
            await createReporter(newUsername);
            toast.success("Reporter added successfully");
            setIsAddOpen(false);
            setNewUsername("");
            // In a real app with revalidatePath, the page should reload or we fetch fresh data.
            // For improved UX without full reload, we might need to handle state update or router.refresh()
            window.location.reload();
        } catch (error) {
            toast.error("Failed to add reporter");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this reporter?")) return;
        try {
            await deleteReporter(id);
            toast.success("Reporter deleted successfully");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete reporter");
        }
    };

    const openEdit = (reporter: Reporter) => {
        setCurrentReporter(reporter);
        setEditUsername(reporter.usernameReporter);
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!currentReporter) return;
        try {
            await updateReporter(currentReporter.id, editUsername);
            toast.success("Reporter updated successfully");
            setIsEditOpen(false);
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update reporter");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Reporters List</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Reporter</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter reporter name"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleAdd}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Before Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reporters.map((reporter) => (
                            <TableRow key={reporter.id}>
                                <TableCell>{reporter.id}</TableCell>
                                <TableCell>{reporter.usernameReporter}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(reporter)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(reporter.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Reporter</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEdit}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
