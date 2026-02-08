"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateDowntimeRecord, UpdateRecordState } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { DateTimePicker24h } from "@/components/ui/date-time-picker";
import { SubmissionProgress, SubmissionStep } from "@/components/submission-progress";

// Station data interface matching API response
interface StationData {
    Engineering_center: string;
    Station: string;
    Status: string;
    ip: string;
    Transmistion_Brand: string;
    No: string;
    Facility: string;
    Station_Eng: string;
    Station_Thai: string;
    Station_Type: string;
    Eng_No: number;
    Eng_No_n: number;
}

function SubmitButton({ onClick }: { onClick: () => void }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="button"
            onClick={onClick}
            disabled={pending}
            className="w-full"
            aria-disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                </>
            ) : (
                "Update Record"
            )}
        </Button>
    );
}

// Reporter data interface
interface ReporterData {
    id: number;
    usernameReporter: string;
}

// Record data interface
interface RecordData {
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
}

interface EditFormProps {
    record: RecordData;
    reporters: ReporterData[];
    emailRecipients: {
        id: number;
        enterprise: string;
        username: string;
        emails: string;
    }[];
    ccEmailRecipients: {
        id: number;
        enterpriseCc: string;
        usernameCc: string;
        emailsCc: string;
    }[];
}



export function EditForm({ record, reporters, emailRecipients, ccEmailRecipients }: EditFormProps) {
    const initialState: UpdateRecordState = { message: "", errors: {} };
    const boundUpdateAction = updateDowntimeRecord.bind(null, record.id);
    const [state, formAction] = useActionState(boundUpdateAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    // Confirmation dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStep, setSubmissionStep] = useState<'idle' | 'submitting_form' | 'success' | 'error'>('idle');

    // Steps for edit progress
    const steps: SubmissionStep[] = [
        { id: 1, label: "Initiated", icon: "check" },
        { id: 2, label: "Saving Changes", icon: "database" },
        { id: 3, label: "Completed", icon: "completed" },
    ];

    const getCurrentStep = () => {
        switch (submissionStep) {
            case 'idle': return 1;
            case 'submitting_form': return 2;
            case 'success': return 3;
            case 'error': return 2;
            default: return 1;
        }
    };

    // Station data
    const [stations, setStations] = useState<StationData[]>([]);
    const [isLoadingStations, setIsLoadingStations] = useState(true);
    const [selectedStation, setSelectedStation] = useState<string>(record.Site);
    const [facilityProvider, setFacilityProvider] = useState<string>(record.FacilityProvider);
    const [engineeringCenter, setEngineeringCenter] = useState<string>(record.EngineeringCenter);

    // Time fields - initialize with record values
    const [startTime, setStartTime] = useState<Date | undefined>(new Date(record.DowntimeStart));
    const [endTime, setEndTime] = useState<Date | undefined>(new Date(record.DowntimeEnd));
    const [duration, setDuration] = useState(record.DowntimeTotal);

    // Text fields
    const [detail, setDetail] = useState(record.Detail);
    const [jobTickets, setJobTickets] = useState(record.JobTickets);
    const [remark, setRemark] = useState(record.Remark);

    // Reporter and Approver fields
    const [selectedReporter, setSelectedReporter] = useState<string>(record.Reporter);
    const [selectedApprover, setSelectedApprover] = useState<string>(record.Approver || "");

    // Fetch stations from API
    useEffect(() => {
        async function fetchStations() {
            try {
                const response = await fetch("http://172.16.202.63:4001/api/station/all");
                if (response.ok) {
                    const data = await response.json();
                    setStations(data);
                } else {
                    console.error("Failed to fetch stations");
                    toast.error("ไม่สามารถโหลดข้อมูลสถานีได้");
                }
            } catch (error) {
                console.error("Error fetching stations:", error);
                toast.error("ไม่สามารถเชื่อมต่อ API สถานีได้");
            } finally {
                setIsLoadingStations(false);
            }
        }
        fetchStations();
    }, []);

    // Auto-fill Facility and Engineering Center when station is selected
    useEffect(() => {
        if (selectedStation && stations.length > 0) {
            const station = stations.find(s => s.Station_Thai === selectedStation);
            if (station) {
                setFacilityProvider(station.Facility);
                setEngineeringCenter(station.Engineering_center);
            }
        }
    }, [selectedStation, stations]);

    // Calculate duration when start or end time changes
    useEffect(() => {
        if (startTime && endTime) {
            const diff = endTime.getTime() - startTime.getTime();

            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setDuration(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setDuration("Invalid range");
            }
        } else {
            setDuration("");
        }
    }, [startTime, endTime]);

    // Show toast on success or error
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                setSubmissionStep('success');
                toast.success(state.message);
                // Redirect after small delay
                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                setSubmissionStep('error');
                toast.error(state.message);
                setIsSubmitting(false);
            }
        }
    }, [state, router]);

    // Handle submit button click - show confirmation dialog
    const handleSubmitClick = () => {
        // Basic validation before showing dialog
        if (!selectedStation) {
            toast.error("กรุณาเลือกสถานี");
            return;
        }
        if (!startTime || !endTime) {
            toast.error("กรุณากรอกเวลาเริ่มต้นและสิ้นสุด");
            return;
        }
        setShowConfirmDialog(true);
    };

    // Handle confirmed submission
    const handleConfirmedSubmit = (e: React.MouseEvent) => {
        // Prevent default
        e.preventDefault();

        setIsSubmitting(true);
        // setShowConfirmDialog(false);
        setSubmissionStep('submitting_form');

        // Submit the form
        formRef.current?.requestSubmit();
    };

    return (
        <>
            <form ref={formRef} action={formAction} className="space-y-6">
                <Card className="card-hover border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                        <CardTitle className="text-gradient-orange">Edit Downtime Report</CardTitle>
                        <CardDescription>แก้ไขข้อมูล Downtime (ID: {record.id})</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Site / Station Select */}
                        <div className="space-y-2">
                            <Label htmlFor="Site">Site / Station</Label>
                            <input type="hidden" name="Site" value={selectedStation} />
                            <Select
                                value={selectedStation}
                                onValueChange={setSelectedStation}
                                disabled={isLoadingStations}
                            >
                                <SelectTrigger id="Site" className="w-full">
                                    {isLoadingStations ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>กำลังโหลด...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="เลือกสถานี..." />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {stations.map((station) => (
                                        <SelectItem
                                            key={station.Station}
                                            value={station.Station_Thai}
                                        >
                                            {station.Station_Thai} ({station.Station_Eng})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state.errors?.Site && (
                                <p className="text-sm text-red-500">{state.errors.Site[0]}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Facility Provider - Auto-filled */}
                            <div className="space-y-2">
                                <Label htmlFor="FacilityProvider">Facility Provider</Label>
                                <input type="hidden" name="FacilityProvider" value={facilityProvider} />
                                <Input
                                    id="FacilityProvider"
                                    value={facilityProvider}
                                    placeholder="เลือกสถานีเพื่อดึงข้อมูล"
                                    readOnly
                                    className="bg-muted"
                                />
                                {state.errors?.FacilityProvider && (
                                    <p className="text-sm text-red-500">{state.errors.FacilityProvider[0]}</p>
                                )}
                            </div>

                            {/* Engineering Center - Auto-filled */}
                            <div className="space-y-2">
                                <Label htmlFor="EngineeringCenter">Engineering Center</Label>
                                <input type="hidden" name="EngineeringCenter" value={engineeringCenter} />
                                <Input
                                    id="EngineeringCenter"
                                    value={engineeringCenter}
                                    placeholder="เลือกสถานีเพื่อดึงข้อมูล"
                                    readOnly
                                    className="bg-muted"
                                />
                                {state.errors?.EngineeringCenter && (
                                    <p className="text-sm text-red-500">{state.errors.EngineeringCenter[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Downtime Start */}
                            <div className="space-y-2">
                                <Label htmlFor="DowntimeStart">Downtime Start</Label>
                                <input type="hidden" name="DowntimeStart" value={startTime ? startTime.toISOString() : ""} />
                                <DateTimePicker24h
                                    value={startTime}
                                    onChange={setStartTime}
                                />
                                {state.errors?.DowntimeStart && (
                                    <p className="text-sm text-red-500">{state.errors.DowntimeStart[0]}</p>
                                )}
                            </div>

                            {/* Downtime End */}
                            <div className="space-y-2">
                                <Label htmlFor="DowntimeEnd">Downtime End</Label>
                                <input type="hidden" name="DowntimeEnd" value={endTime ? endTime.toISOString() : ""} />
                                <DateTimePicker24h
                                    value={endTime}
                                    onChange={setEndTime}
                                />
                                {state.errors?.DowntimeEnd && (
                                    <p className="text-sm text-red-500">{state.errors.DowntimeEnd[0]}</p>
                                )}
                            </div>
                        </div>

                        {/* Downtime Total */}
                        <div className="space-y-2">
                            <Label htmlFor="DowntimeTotalDisplay">Downtime Total</Label>
                            {/* Hidden input for form submission */}
                            <input type="hidden" name="DowntimeTotal" value={duration} />
                            <Input
                                id="DowntimeTotalDisplay"
                                value={duration}
                                placeholder="Auto-calculated from start and end time"
                                readOnly
                                className="bg-muted"
                            />
                            {state.errors?.DowntimeTotal && (
                                <p className="text-sm text-red-500">{state.errors.DowntimeTotal[0]}</p>
                            )}
                        </div>

                        {/* Detail */}
                        <div className="space-y-2">
                            <Label htmlFor="Detail">Detail</Label>
                            <Textarea
                                id="Detail"
                                name="Detail"
                                placeholder="Enter downtime details"
                                className="min-h-[100px]"
                                value={detail}
                                onChange={(e) => setDetail(e.target.value)}
                                required
                            />
                            {state.errors?.Detail && (
                                <p className="text-sm text-red-500">{state.errors.Detail[0]}</p>
                            )}
                        </div>

                        {/* Job Tickets */}
                        <div className="space-y-2">
                            <Label htmlFor="JobTickets">Job Tickets</Label>
                            <Input
                                id="JobTickets"
                                name="JobTickets"
                                placeholder="Enter job ticket number (optional)"
                                value={jobTickets}
                                onChange={(e) => setJobTickets(e.target.value)}
                            />
                            {state.errors?.JobTickets && (
                                <p className="text-sm text-red-500">{state.errors.JobTickets[0]}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                        <CardTitle className="text-gradient-orange">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Reporter Select */}
                        <div className="space-y-2">
                            <Label htmlFor="Reporter">Reporter</Label>
                            <input type="hidden" name="Reporter" value={selectedReporter} />
                            <Select
                                value={selectedReporter}
                                onValueChange={setSelectedReporter}
                            >
                                <SelectTrigger id="Reporter" className="w-full">
                                    <SelectValue placeholder="เลือกผู้รายงาน..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {reporters.map((r) => (
                                        <SelectItem key={r.id} value={r.usernameReporter}>
                                            {r.usernameReporter}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state.errors?.Reporter && (
                                <p className="text-sm text-red-500">{state.errors.Reporter[0]}</p>
                            )}
                        </div>

                        {/* Approver Select */}
                        <div className="space-y-2">
                            <Label htmlFor="Approver">Approver (Optional)</Label>
                            <input type="hidden" name="Approver" value={selectedApprover} />
                            <Select
                                value={selectedApprover}
                                onValueChange={setSelectedApprover}
                            >
                                <SelectTrigger id="Approver" className="w-full">
                                    <SelectValue placeholder="เลือกผู้อนุมัติ..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {reporters.map((r) => (
                                        <SelectItem key={r.id} value={r.usernameReporter}>
                                            {r.usernameReporter}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state.errors?.Approver && (
                                <p className="text-sm text-red-500">{state.errors.Approver[0]}</p>
                            )}
                        </div>

                        {/* Remark */}
                        <div className="space-y-2">
                            <Label htmlFor="Remark">Remark</Label>
                            <Textarea
                                id="Remark"
                                name="Remark"
                                placeholder="Enter remarks"
                                className="min-h-[100px]"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                required
                            />
                            {state.errors?.Remark && (
                                <p className="text-sm text-red-500">{state.errors.Remark[0]}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Link href="/" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <SubmitButton onClick={handleSubmitClick} />
                    </div>
                </div>
            </form>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    {!isSubmitting ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการแก้ไขข้อมูล</AlertDialogTitle>
                                <AlertDialogDescription>
                                    คุณต้องการแก้ไขข้อมูล Downtime ของ <strong>{selectedStation}</strong> (ID: {record.id}) หรือไม่?
                                    <br />
                                    <span className="text-muted-foreground">
                                        ระยะเวลา: {duration}
                                    </span>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isSubmitting}>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmedSubmit}
                                    disabled={isSubmitting}
                                >
                                    ยืนยัน
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </>
                    ) : (
                        <div className="py-6 flex justify-center">
                            <SubmissionProgress
                                currentStep={getCurrentStep()}
                                steps={steps}
                            />

                            {submissionStep === 'error' && (
                                <div className="text-center text-red-600 font-medium absolute bottom-4 left-0 right-0">
                                    เกิดข้อผิดพลาด กรุณาลองใหม่
                                </div>
                            )}
                        </div>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
