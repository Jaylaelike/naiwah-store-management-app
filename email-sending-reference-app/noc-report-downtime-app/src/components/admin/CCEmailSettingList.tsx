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
import { createCCEmailSetting, deleteCCEmailSetting, updateCCEmailSetting } from "@/app/admin/actions";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

interface CCEmailSetting {
    id: number;
    enterpriseCc: string;
    usernameCc: string;
    telephoneCc: string;
    emailsCc: string;
}

export function CCEmailSettingList({ initialSettings }: { initialSettings: CCEmailSetting[] }) {
    const [settings, setSettings] = useState<CCEmailSetting[]>(initialSettings);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentSetting, setCurrentSetting] = useState<CCEmailSetting | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        enterpriseCc: "",
        usernameCc: "",
        telephoneCc: "",
        emailsCc: ""
    });

    const resetForm = () => setFormData({ enterpriseCc: "", usernameCc: "", telephoneCc: "", emailsCc: "" });

    const handleAdd = async () => {
        try {
            await createCCEmailSetting(formData);
            toast.success("CC Email setting added successfully");
            setIsAddOpen(false);
            resetForm();
            window.location.reload();
        } catch (error) {
            toast.error("Failed to add setting");
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this CC email setting?")) return;
        try {
            await deleteCCEmailSetting(id);
            toast.success("Deleted successfully");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const openEdit = (setting: CCEmailSetting) => {
        setCurrentSetting(setting);
        setFormData({
            enterpriseCc: setting.enterpriseCc,
            usernameCc: setting.usernameCc,
            telephoneCc: setting.telephoneCc,
            emailsCc: setting.emailsCc
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!currentSetting) return;
        try {
            await updateCCEmailSetting(currentSetting.id, formData);
            toast.success("Updated successfully");
            setIsEditOpen(false);
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">CC Subscribers List</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New CC Subscriber</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Enterprise</Label>
                                    <Input value={formData.enterpriseCc} onChange={(e) => setFormData({ ...formData, enterpriseCc: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input value={formData.usernameCc} onChange={(e) => setFormData({ ...formData, usernameCc: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telephone</Label>
                                    <Input value={formData.telephoneCc} onChange={(e) => setFormData({ ...formData, telephoneCc: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Emails</Label>
                                <Input value={formData.emailsCc} onChange={(e) => setFormData({ ...formData, emailsCc: e.target.value })} />
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
                            <TableHead>Enterprise</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Telephone</TableHead>
                            <TableHead>Emails</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settings.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.enterpriseCc}</TableCell>
                                <TableCell>{item.usernameCc}</TableCell>
                                <TableCell>{item.telephoneCc}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={item.emailsCc}>{item.emailsCc}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
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
                        <DialogTitle>Edit CC Subscriber</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Enterprise</Label>
                                <Input value={formData.enterpriseCc} onChange={(e) => setFormData({ ...formData, enterpriseCc: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input value={formData.usernameCc} onChange={(e) => setFormData({ ...formData, usernameCc: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Telephone</Label>
                                <Input value={formData.telephoneCc} onChange={(e) => setFormData({ ...formData, telephoneCc: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Emails Cost</Label>
                            <Input value={formData.emailsCc} onChange={(e) => setFormData({ ...formData, emailsCc: e.target.value })} />
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
