"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createDowntimeRecord, CreateRecordState } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, Loader2, Mail, X, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
                "Create Record"
            )}
        </Button>
    );
}

// Reporter data interface
interface ReporterData {
    id: number;
    usernameReporter: string;
}

// Email recipient interfaces
interface EmailRecipient {
    id: number;
    enterprise: string;
    username: string;
    emails: string;
}

interface CcEmailRecipient {
    id: number;
    enterpriseCc: string;
    usernameCc: string;
    emailsCc: string;
}

interface DowntimeRecordFormProps {
    reporter: string;
    reporters: ReporterData[];
    emailRecipients: EmailRecipient[];
    ccEmailRecipients: CcEmailRecipient[];
}

export function DowntimeRecordForm({
    reporter,
    reporters,
    emailRecipients,
    ccEmailRecipients,
}: DowntimeRecordFormProps) {
    const initialState: CreateRecordState = { message: "", errors: {} };
    const [state, formAction] = useActionState(createDowntimeRecord, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    // Confirmation dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStep, setSubmissionStep] = useState<'idle' | 'sending_email' | 'email_sent' | 'submitting_form' | 'success' | 'error'>('idle');

    // Mapped steps for progress component
    const steps: SubmissionStep[] = [
        { id: 1, label: "Initiated", icon: "check" },
        { id: 2, label: "Sending Email", icon: "mail" },
        { id: 3, label: "Saving Record", icon: "database" },
        { id: 4, label: "Completed", icon: "completed" },
    ];

    const getCurrentStep = () => {
        switch (submissionStep) {
            case 'idle': return 1;
            case 'sending_email': return 2;
            case 'email_sent': return 2; // Still finishing up email logically or moving to next
            case 'submitting_form': return 3;
            case 'success': return 4;
            case 'error': return 3; // Show error at saving step
            default: return 1;
        }
    };

    // Station data
    const [stations, setStations] = useState<StationData[]>([]);
    const [isLoadingStations, setIsLoadingStations] = useState(true);
    const [selectedStation, setSelectedStation] = useState<string>("");
    const [facilityProvider, setFacilityProvider] = useState<string>("");
    const [engineeringCenter, setEngineeringCenter] = useState<string>("");

    // Time fields - use undefined initially
    const [startTime, setStartTime] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState<Date | undefined>(undefined);
    const [duration, setDuration] = useState("");

    // Text fields
    const [detail, setDetail] = useState("");

    // Reporter and Approver fields
    const [selectedReporter, setSelectedReporter] = useState<string>(reporter);
    const [selectedApprover, setSelectedApprover] = useState<string>("");

    // Email sending state
    const [sendEmail, setSendEmail] = useState(false);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [selectedCcEmails, setSelectedCcEmails] = useState<string[]>([]);

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
        } else {
            setFacilityProvider("");
            setEngineeringCenter("");
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
                // toast.success(state.message); // Already showing success in dialog potentially, or keep toast

                // Redirect after small delay
                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                setSubmissionStep('error');
                toast.error(state.message);
                setIsSubmitting(false); // Enable buttons again if error
            }
        }
    }, [state, router]);

    // Format datetime for display (helper for dialog/email)
    const formatDateTime = (date: Date | undefined) => {
        if (!date) return "";
        return date.toLocaleString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

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
        if (sendEmail && selectedEmails.length === 0) {
            toast.error("กรุณาเลือกอีเมล์ผู้รับ");
            return;
        }
        setShowConfirmDialog(true);
    };

    // Handle confirmed submission
    const handleConfirmedSubmit = async (e: React.MouseEvent) => {
        // Prevent default to avoid double submission if enclosed in form
        e.preventDefault();

        setIsSubmitting(true);
        // Do NOT close dialog yet, show progress inside it
        // setShowConfirmDialog(false); 
        setSubmissionStep('sending_email');

        // Send email if checked
        if (sendEmail && selectedEmails.length > 0) {
            try {
                const emailResponse = await fetch("/api/sendmail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        posting_date: new Date().toLocaleString("th-TH"),
                        station_name: selectedStation,
                        facility_name: facilityProvider,
                        detail_data: detail,
                        start_time: formatDateTime(startTime),
                        end_time: formatDateTime(endTime),
                        sum_time: duration,
                        user_to: selectedEmails,
                        cc: selectedCcEmails,
                    }),
                });

                if (emailResponse.ok) {
                    toast.success("ส่งอีเมล์แจ้งเตือนเรียบร้อยแล้ว");
                } else {
                    toast.error("ไม่สามารถส่งอีเมล์ได้");
                }
            } catch (error) {
                console.error("Error sending email:", error);
                toast.error("เกิดข้อผิดพลาดในการส่งอีเมล์");
            }
        }

        setSubmissionStep('submitting_form');

        // Submit the form
        formRef.current?.requestSubmit();
    };

    // Toggle email selection
    const toggleEmail = (email: string) => {
        setSelectedEmails(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    // Toggle CC email selection
    const toggleCcEmail = (email: string) => {
        setSelectedCcEmails(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    return (
        <>
            <form ref={formRef} action={formAction} className="space-y-6">
                <Card className="card-hover border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                        <CardTitle className="text-gradient-orange">Downtime Report Form</CardTitle>
                        <CardDescription>ฟอร์มบันทึกข้อมูล Downtime</CardDescription>
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
                                required
                            />
                            {state.errors?.Remark && (
                                <p className="text-sm text-red-500">{state.errors.Remark[0]}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Email Notification Card */}
                <Card className="card-hover border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <CardTitle className="text-gradient-orange">Email Notification</CardTitle>
                        </div>
                        <CardDescription>ส่งอีเมล์แจ้งเตือนเมื่อบันทึกข้อมูล</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Send Email Checkbox */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sendEmail"
                                checked={sendEmail}
                                onCheckedChange={(checked) => setSendEmail(checked === true)}
                            />
                            <Label htmlFor="sendEmail" className="cursor-pointer">
                                ส่งอีเมล์แจ้งเตือน
                            </Label>
                        </div>

                        {sendEmail && (
                            <>
                                {/* Email Recipients (To) */}
                                <div className="space-y-2">
                                    <Label>ผู้รับหลัก (To)</Label>
                                    <div className="flex flex-wrap gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                                        {selectedEmails.map((email) => (
                                            <Badge key={email} variant="secondary" className="flex items-center gap-1 pr-1">
                                                <span className="max-w-[200px] truncate">{email}</span>
                                                <button
                                                    type="button"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedEmails(prev => prev.filter(item => item !== email));
                                                    }}
                                                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 focus:outline-none"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <Select value="" onValueChange={toggleEmail}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกอีเมล์ผู้รับ..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {emailRecipients.map((recipient) => (
                                                <SelectItem
                                                    key={recipient.id}
                                                    value={recipient.emails}
                                                    disabled={selectedEmails.includes(recipient.emails)}
                                                >
                                                    {recipient.username} ({recipient.emails})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* CC Recipients */}
                                <div className="space-y-2">
                                    <Label>สำเนา (CC)</Label>
                                    <div className="flex flex-wrap gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                                        {selectedCcEmails.map((email) => (
                                            <Badge key={email} variant="outline" className="flex items-center gap-1 pr-1">
                                                <span className="max-w-[200px] truncate">{email}</span>
                                                <button
                                                    type="button"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedCcEmails(prev => prev.filter(item => item !== email));
                                                    }}
                                                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 focus:outline-none"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <Select value="" onValueChange={toggleCcEmail}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกอีเมล์สำเนา..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ccEmailRecipients.map((recipient) => (
                                                <SelectItem
                                                    key={recipient.id}
                                                    value={recipient.emailsCc}
                                                    disabled={selectedCcEmails.includes(recipient.emailsCc)}
                                                >
                                                    {recipient.usernameCc} ({recipient.emailsCc})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
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
                                <AlertDialogTitle>ยืนยันการบันทึกข้อมูล</AlertDialogTitle>
                                <AlertDialogDescription>
                                    คุณต้องการบันทึกข้อมูล Downtime ของ <strong>{selectedStation}</strong> หรือไม่?
                                    <br />
                                    <span className="text-muted-foreground">
                                        ระยะเวลา: {duration}
                                    </span>
                                    {sendEmail && selectedEmails.length > 0 && (
                                        <>
                                            <br />
                                            <span className="text-blue-600">
                                                📧 จะส่งอีเมล์แจ้งเตือนไปยัง {selectedEmails.length} คน
                                            </span>
                                        </>
                                    )}
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
