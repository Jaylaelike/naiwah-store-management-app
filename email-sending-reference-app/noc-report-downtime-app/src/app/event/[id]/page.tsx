import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Building, User, Wrench } from "lucide-react";
import { formatForDisplay } from "@/lib/date-utils";
import { PdfExportButton } from "./pdf-export-button";

interface EventDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

    const { id } = await params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
        return notFound();
    }

    const record = await prisma.mainDb.findUnique({
        where: {
            id: recordId,
        },
    });

    if (!record) {
        return notFound();
    }

    // --- FILENAME GENERATION ---
    const fileDate = record.DowntimeStart ? new Date(record.DowntimeStart) : new Date();
    const dateStr = fileDate.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
    const siteNameClean = (record.Site || 'UnknownSite').replace(/\s+/g, '_');
    const exportFileName = `${siteNameClean}_${dateStr}`;

    // --- STYLE VARIABLES ---
    const formalBorderStyle = '1px solid #000000';
    const formalCellPadding = '0.4rem 0.75rem'; // ลด Padding ในตารางลงเล็กน้อยให้กระชับ
    const formalHeaderBg = '#f3f4f6';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1.5rem' }}>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                .official-font { font-family: 'Sarabun', sans-serif; }
            `}} />

            <div style={{ maxWidth: '56rem', margin: '0 auto' }}>

                {/* 1. HEADER ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <Link href="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <PdfExportButton elementId="formal-report-content" fileName={exportFileName} />
                    </div>
                </div>

                {/* 2. ON-SCREEN DISPLAY (UI เดิม สวยงาม) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>

                    <div style={{ background: 'linear-gradient(to right, #0f172a, #1e293b)', padding: '2rem', color: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#ffffff' }}>
                                    Downtime Incident Report
                                </h1>
                                <p style={{ color: '#cbd5e1' }}>Reference ID: #{record.id.toString().padStart(6, '0')}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '3rem',
                                    height: '3rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>N</span>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>NOC Department</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        {/* Content UI เดิม ... */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ color: '#ea580c', fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#ea580c' }} />
                                    Location Details
                                </h2>
                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Site Name</p>
                                        <p style={{ color: '#0f172a', fontWeight: '500', fontSize: '1.125rem' }}>{record.Site}</p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Facility</p>
                                            <p style={{ color: '#0f172a', fontWeight: '500' }}>{record.FacilityProvider}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Engineering Center</p>
                                            <p style={{ color: '#0f172a', fontWeight: '500' }}>{record.EngineeringCenter}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 style={{ color: '#ea580c', fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#ea580c' }} />
                                    Timing Information
                                </h2>
                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Start Time</p>
                                            <p style={{ color: '#0f172a', fontWeight: '500' }}>{formatForDisplay(record.DowntimeStart)}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>End Time</p>
                                            <p style={{ color: '#0f172a', fontWeight: '500' }}>{formatForDisplay(record.DowntimeEnd)}</p>
                                        </div>
                                    </div>
                                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Duration</p>
                                        <p style={{ color: '#ea580c', fontWeight: 'bold', fontSize: '1.25rem' }}>{record.DowntimeTotal}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '2rem 0' }}></div>

                        {/* Incident Details */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ color: '#ea580c', fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Building style={{ width: '1.25rem', height: '1.25rem', color: '#ea580c' }} />
                                Incident Details
                            </h2>
                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Description</p>
                                    <p style={{ color: '#0f172a', whiteSpace: 'pre-wrap', lineHeight: '1.75' }}>{record.Detail}</p>
                                </div>

                                {record.JobTickets && (
                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Related Job Tickets</p>
                                        <p style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                                            {record.JobTickets}
                                        </p>
                                    </div>
                                )}

                                {record.Remark && (
                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Remarks</p>
                                        <p style={{ color: '#475569', fontStyle: 'italic' }}>{record.Remark}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personnel */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ backgroundColor: '#dbeafe', padding: '0.5rem', borderRadius: '9999px' }}>
                                    <User style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reported By</p>
                                    <p style={{ color: '#0f172a', fontWeight: '500' }}>{record.Reporter}</p>
                                </div>
                            </div>
                            {record.Approver && (
                                <div style={{ backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ backgroundColor: '#dcfce7', padding: '0.5rem', borderRadius: '9999px' }}>
                                        <Wrench style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Approved By</p>
                                        <p style={{ color: '#0f172a', fontWeight: '500' }}>{record.Approver}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. HIDDEN PRINT TEMPLATE (Formal Official Style) */}
            <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
                <div
                    id="formal-report-content"
                    className="official-font"
                    style={{
                        width: '210mm',
                        backgroundColor: '#ffffff',
                        /* แก้ไข: ปรับลด Padding ด้านบนลง เพื่อดึงเนื้อหาขึ้น (25mm -> 15mm) */
                        padding: '15mm 20mm',
                        color: '#000000',
                        fontSize: '16px',
                        lineHeight: '1.4' // ลด Line Height เล็กน้อยเพื่อให้บรรทัดชิดกันขึ้น
                    }}
                >
                    {/* Header with Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}> {/* ลด margin ล่างของหัวข้อ */}
                        <div style={{ marginBottom: '0.5rem' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://56fwnhyzti.ufs.sh/f/aK4w8mNL3AiPCe3C2J4yeaPGUENJfdmLvVKsyjx7Tp6oWnc5"
                                alt="Logo"
                                style={{ height: '70px', width: 'auto', margin: '0 auto', display: 'block' }} // ลดขนาด Logo เล็กน้อย
                            />
                        </div>
                        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 0.25rem 0', color: '#000' }}>
                            รายงานสรุปเหตุขัดข้อง (Downtime Incident Report)
                        </h1>
                        <p style={{ fontSize: '16px', margin: 0 }}>
                            ฝ่ายศูนย์ปฏิบัติการเครือข่าย (NOC Department)
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0 }}><strong>เลขที่อ้างอิง:</strong> #{record.id.toString().padStart(6, '0')}</p>
                            <p style={{ margin: 0 }}><strong>วันที่พิมพ์:</strong> {new Date().toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>

                    {/* Table 1: Location & Time */}
                    <div style={{ border: formalBorderStyle, marginBottom: '1.5rem' }}> {/* ลด margin ล่างของตาราง */}
                        <div style={{ backgroundColor: formalHeaderBg, padding: formalCellPadding, borderBottom: formalBorderStyle, fontWeight: 'bold' }}>
                            1. ข้อมูลสถานที่ (Location Details)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: formalBorderStyle }}>
                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>ชื่อไซต์งาน (Site Name)</span>
                                <strong>{record.Site || "-"}</strong>
                            </div>
                            <div style={{ padding: formalCellPadding }}>
                                <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>จังหวัด/พื้นที่ (Province/Area)</span>
                                <strong>{record.EngineeringCenter || "-"}</strong>
                            </div>
                        </div>
                        <div style={{ padding: formalCellPadding, borderBottom: formalBorderStyle }}>
                            <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>ศูนย์วิศวกรรม/อาคาร (Engineering Center/Facility)</span>
                            <strong>{record.FacilityProvider || "-"}</strong>
                        </div>
                        <div style={{ backgroundColor: formalHeaderBg, padding: formalCellPadding, borderBottom: formalBorderStyle, fontWeight: 'bold' }}>
                            2. ข้อมูลเวลา (Timing Information)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: formalBorderStyle }}>
                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>เวลาเริ่ม (Start Time)</span>
                                <strong>{formatForDisplay(record.DowntimeStart)}</strong>
                            </div>
                            <div style={{ padding: formalCellPadding, borderRight: formalBorderStyle }}>
                                <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>เวลาสิ้นสุด (End Time)</span>
                                <strong>{formatForDisplay(record.DowntimeEnd)}</strong>
                            </div>
                            <div style={{ padding: formalCellPadding }}>
                                <span style={{ display: 'block', fontSize: '14px', color: '#555' }}>รวมระยะเวลา (Duration)</span>
                                <strong>{record.DowntimeTotal}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Table 2: Details */}
                    <div style={{ border: formalBorderStyle, marginBottom: '1.5rem', minHeight: '150px' }}>
                        <div style={{ backgroundColor: formalHeaderBg, padding: formalCellPadding, borderBottom: formalBorderStyle, fontWeight: 'bold' }}>
                            3. รายละเอียดเหตุการณ์ (Incident Details)
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>คำอธิบาย (Description):</strong>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                                    {record.Detail || "-"}
                                </p>
                            </div>
                            {record.JobTickets && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Ticket ที่เกี่ยวข้อง (Related Tickets):</strong>
                                    <span>{record.JobTickets}</span>
                                </div>
                            )}
                            {record.Remark && (
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>หมายเหตุ (Remarks):</strong>
                                    <span>{record.Remark}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Signatures */}
                    <div style={{ marginTop: '2rem' }}> {/* ลด margin top ลงเพื่อให้ไม่ตกขอบ */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                            <div style={{ textAlign: 'center', width: '40%' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <p style={{ margin: 0, fontSize: '14px' }}>ลงชื่อ ........................................................... ผู้รายงาน</p>
                                </div>
                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>({record.Reporter || "................................................"})</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>ตำแหน่ง: เจ้าหน้าที่ NOC</p>
                            </div>
                            <div style={{ textAlign: 'center', width: '40%' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <p style={{ margin: 0, fontSize: '14px' }}>ลงชื่อ ........................................................... ผู้อนุมัติ</p>
                                </div>
                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>({record.Approver || "           จตุรงค์ ฉายศรี           "})</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>ตำแหน่ง: หัวหน้างาน/ผู้จัดการ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}