import emailjs from '@emailjs/nodejs';
import { isEmailEnabled } from '@/lib/settings';
import { prisma } from '@/lib/prisma';

// ── EmailJS Configuration ──────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_r09uh1j';
const EMAILJS_TEMPLATE_ID = 'template_15rk9b2';
const EMAILJS_PUBLIC_KEY = '3ANASFW_eugmQJaRm';
const EMAILJS_PRIVATE_KEY = 'bWtfNys36aTo4rUFQrjNh';
const EMAILJS_ICON_URL = 'https://56fwnhyzti.ufs.sh/f/aK4w8mNL3AiPEv5Cf4c9WON2pJKgdI63ReTV9fSa7PvqDr8A';

// ── Helper: Get Admin Emails from Database ──────────────────────────────
export async function getAdminEmails(): Promise<string[]> {
    try {
        const admins = await prisma.user.findMany({
            where: { 
                role: 'Admin',
                email: { not: null }
            },
            select: { email: true },
        });
        const emails = admins
            .map(a => a.email)
            .filter((email): email is string => email !== null && email !== '');
        
        if (emails.length === 0) {
            console.warn('[EmailService] No admin emails found in database');
        }
        return emails;
    } catch (error) {
        console.error('[EmailService] Failed to fetch admin emails:', error);
        return [];
    }
}

export interface EmailRequestBody {
    // Device info
    asset_id?: string;
    device_name?: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    status?: string;
    // Location
    section?: string;
    center?: string;
    station?: string;
    // Repair details
    description?: string;
    repair_date?: string;
    logged_by?: string;
    // General
    posting_date: string;
    user_to: string[];
    cc?: string[];
}

// ── Shared helper to send via EmailJS ──────────────────────────────────
async function sendViaEmailJS(templateParams: Record<string, string>) {
    const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        {
            publicKey: EMAILJS_PUBLIC_KEY,
            privateKey: EMAILJS_PRIVATE_KEY,
        }
    );
    return response;
}

// ── 1. Repair / Downtime Email ─────────────────────────────────────────
export async function sendRepairEmail(data: EmailRequestBody) {
    if (!isEmailEnabled()) {
        console.log('[EmailService] Email is disabled. Skipping repair email.');
        return { success: true, skipped: true };
    }

    try {
        console.log('[EmailService] Preparing to send repair email...', data.device_name || data.asset_id);

        if (!data.user_to || data.user_to.length === 0) {
            console.warn('[EmailService] No recipients defined.');
        }

        const location = [data.section, data.center, data.station].filter(Boolean).join(' > ') || '-';

        const templateParams = {
            email_type: 'REPAIR',
            image_url: EMAILJS_ICON_URL,
            to_email: data.user_to.join(', '),
            cc_email: data.cc?.join(', ') || '',
            subject: `แจ้งซ่อมอุปกรณ์ - ${data.device_name || data.asset_id || 'Unknown'}`,
            title: 'แจ้งซ่อมอุปกรณ์',
            subtitle: 'NAIWAH Asset Management System',
            posting_date: data.posting_date,
            asset_id: data.asset_id || '-',
            device_name: data.device_name || '-',
            brand: data.brand || '-',
            model: data.model || '-',
            serial_number: data.serial_number || '-',
            status: data.status || 'Repair',
            location: location,
            description: data.description || '-',
            repair_date: data.repair_date || data.posting_date,
            logged_by: data.logged_by || '-',
            action_color: '#f59e0b',
            // Fields used by other email types – send empty
            request_type: '',
            details: '',
            approver_name: '',
            action: 'REPAIR',
            performed_by: data.logged_by || '-',
            updated_fields: '',
        };

        const response = await sendViaEmailJS(templateParams);
        console.log('[EmailService] Repair email sent. Status:', response.status);

        return { success: true, status: response.status };
    } catch (error) {
        console.error('[EmailService] Error sending repair email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email',
        };
    }
}

// ── Field name translations ───────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
    assetId: 'รหัสครุภัณฑ์',
    deviceName: 'ชื่ออุปกรณ์',
    brand: 'ยี่ห้อ',
    model: 'รุ่น',
    serialNumber: 'Serial Number',
    status: 'สถานะ',
    function: 'ประเภท',
    ipAddress: 'IP Address',
    macAddress: 'MAC Address',
    section: 'แผนก',
    center: 'ศูนย์',
    station: 'สถานี',
    c_score: 'C-Score',
    i_score: 'I-Score',
    a_score: 'A-Score',
    hostId: 'Host ID',
};

// ── 2. Approval Email ──────────────────────────────────────────────────
export async function sendApprovalEmail(
    email: string,
    requestType: string,
    details: string,
    approverName: string
) {
    if (!isEmailEnabled()) {
        console.log('[EmailService] Email is disabled. Skipping approval email.');
        return { success: true, skipped: true };
    }

    try {
        console.log(`[EmailService] Sending approval email to ${email}`);

        // Format details as HTML table rows
        const formattedFields = details
            .split('\n')
            .filter(Boolean)
            .map(line => {
                const colonIdx = line.indexOf(':');
                if (colonIdx > 0) {
                    const field = line.substring(0, colonIdx).trim();
                    let value = line.substring(colonIdx + 1).trim();
                    // Skip lines with null/undefined/empty values
                    if (!value || value === 'null' || value === 'undefined') {
                        return null;
                    }
                    const label = FIELD_LABELS[field] || field;
                    return `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;white-space:nowrap;border-bottom:1px solid #e5e7eb;">${label}</td><td style="padding:8px 12px;color:#1f2937;border-bottom:1px solid #e5e7eb;">${value}</td></tr>`;
                }
                return `<tr><td colspan="2" style="padding:8px 12px;color:#1f2937;font-weight:500;border-bottom:1px solid #e5e7eb;">${line}</td></tr>`;
            })
            .filter(Boolean)
            .join('');

        const updatedFieldsHtml = formattedFields
            ? `<table style="width:100%;border-collapse:collapse;font-size:14px;">${formattedFields}</table>`
            : '';

        const actionLabels: Record<string, string> = {
            CREATE: 'สร้างอุปกรณ์ใหม่',
            UPDATE: 'อัปเดตข้อมูล',
            DELETE: 'ลบอุปกรณ์',
            TRANSFER: 'โอนย้ายอุปกรณ์',
        };

        const templateParams = {
            email_type: 'APPROVAL',
            image_url: EMAILJS_ICON_URL,
            to_email: email,
            cc_email: '',
            subject: `คำขอได้รับการอนุมัติ: ${actionLabels[requestType] || requestType}`,
            title: 'คำขอได้รับการอนุมัติ',
            subtitle: actionLabels[requestType] || requestType,
            posting_date: new Date().toLocaleDateString('th-TH'),
            station_name: '',
            facility_name: '',
            detail_data: '',
            start_time: '',
            end_time: '',
            sum_time: '',
            request_type: requestType,
            details: details,
            approver_name: approverName,
            action: requestType,
            device_name: '',
            performed_by: approverName,
            action_color: '#22c55e',
            updated_fields: updatedFieldsHtml,
        };

        const response = await sendViaEmailJS(templateParams);
        console.log(`[EmailService] Approval email sent to ${email}. Status:`, response.status);

        return { success: true };
    } catch (error) {
        console.error('[EmailService] Failed to send approval email:', error);
        return { success: false, error };
    }
}

// ── 3. Device Notification Email ───────────────────────────────────────
export async function sendDeviceNotification(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    deviceName: string,
    details: string,
    performedBy: string
) {
    if (!isEmailEnabled()) {
        console.log('[EmailService] Email is disabled. Skipping device notification.');
        return { success: true, skipped: true };
    }

    try {
        console.log(`[EmailService] Sending device notification for ${action} on ${deviceName}`);

        const color =
            action === 'DELETE' ? '#ef4444' : action === 'CREATE' ? '#22c55e' : '#3b82f6';

        // Format details as a readable field list for the template
        const formattedFields = details
            .split('\n')
            .filter(Boolean)
            .map(line => {
                const [field, ...rest] = line.split(':');
                return rest.length ? `<tr><td style="padding:6px 10px;font-weight:600;color:#374151;white-space:nowrap;">${field.trim()}</td><td style="padding:6px 10px;color:#1f2937;">${rest.join(':').trim()}</td></tr>` : `<tr><td colspan="2" style="padding:6px 10px;color:#1f2937;">${line}</td></tr>`;
            })
            .join('');

        const updatedFieldsHtml = formattedFields
            ? `<table style="width:100%;border-collapse:collapse;font-size:14px;">${formattedFields}</table>`
            : '';

        // Get admin emails from database
        const adminEmails = await getAdminEmails();
        if (adminEmails.length === 0) {
            console.warn('[EmailService] No admin emails found. Skipping device notification.');
            return { success: false, error: 'No admin emails configured' };
        }

        const templateParams = {
            email_type: 'DEVICE',
            image_url: EMAILJS_ICON_URL,
            to_email: adminEmails.join(', '),
            cc_email: '',
            subject: `Device Notification: ${action} - ${deviceName}`,
            title: 'Device Notification',
            subtitle: `${action === 'CREATE' ? 'สร้างอุปกรณ์ใหม่' : action === 'UPDATE' ? 'อัปเดตข้อมูลอุปกรณ์' : 'ลบอุปกรณ์'}`,
            posting_date: new Date().toLocaleDateString('th-TH'),
            station_name: '',
            facility_name: '',
            detail_data: '',
            start_time: '',
            end_time: '',
            sum_time: '',
            request_type: '',
            details: details,
            approver_name: '',
            action: action,
            device_name: deviceName,
            performed_by: performedBy,
            action_color: color,
            updated_fields: updatedFieldsHtml,
        };

        const response = await sendViaEmailJS(templateParams);
        console.log(`[EmailService] Device notification sent for ${deviceName}. Status:`, response.status);

        return { success: true };
    } catch (error) {
        console.error('[EmailService] Failed to send device notification:', error);
        return { success: false, error };
    }
}

// ── 4. Admin Request Notification Email ────────────────────────────────
export async function sendAdminRequestNotification(
    requestType: 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSFER',
    requestedBy: string,
    details: string,
    deviceInfo?: string
) {
    if (!isEmailEnabled()) {
        console.log('[EmailService] Email is disabled. Skipping admin request notification.');
        return { success: true, skipped: true };
    }

    try {
        console.log(`[EmailService] Sending admin request notification for ${requestType}`);

        const actionLabels: Record<string, string> = {
            CREATE: 'สร้างอุปกรณ์ใหม่',
            UPDATE: 'แก้ไขข้อมูลอุปกรณ์',
            DELETE: 'ลบอุปกรณ์',
            TRANSFER: 'โอนย้ายอุปกรณ์',
        };

        const actionColors: Record<string, string> = {
            CREATE: '#22c55e',
            UPDATE: '#3b82f6',
            DELETE: '#ef4444',
            TRANSFER: '#f59e0b',
        };

        // Format details as HTML table rows
        const formattedFields = details
            .split('\n')
            .filter(Boolean)
            .map(line => {
                const colonIdx = line.indexOf(':');
                if (colonIdx > 0) {
                    const field = line.substring(0, colonIdx).trim();
                    let value = line.substring(colonIdx + 1).trim();
                    if (!value || value === 'null' || value === 'undefined') {
                        return null;
                    }
                    const label = FIELD_LABELS[field] || field;
                    return `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;white-space:nowrap;border-bottom:1px solid #e5e7eb;">${label}</td><td style="padding:8px 12px;color:#1f2937;border-bottom:1px solid #e5e7eb;">${value}</td></tr>`;
                }
                return `<tr><td colspan="2" style="padding:8px 12px;color:#1f2937;font-weight:500;border-bottom:1px solid #e5e7eb;">${line}</td></tr>`;
            })
            .filter(Boolean)
            .join('');

        const updatedFieldsHtml = formattedFields
            ? `<table style="width:100%;border-collapse:collapse;font-size:14px;">${formattedFields}</table>`
            : '';

        // Get admin emails from database
        const adminEmails = await getAdminEmails();
        if (adminEmails.length === 0) {
            console.warn('[EmailService] No admin emails found. Skipping admin request notification.');
            return { success: false, error: 'No admin emails configured' };
        }

        const templateParams = {
            email_type: 'ADMIN_REQUEST',
            image_url: EMAILJS_ICON_URL,
            to_email: adminEmails.join(', '),
            cc_email: '',
            subject: `ขอแก้ไขเปลี่ยนแปลงข้อมูลอุปกรณ์ - ${actionLabels[requestType]}`,
            title: 'ขอแก้ไขเปลี่ยนแปลงข้อมูลอุปกรณ์',
            subtitle: actionLabels[requestType],
            posting_date: new Date().toLocaleDateString('th-TH'),
            station_name: '',
            facility_name: '',
            detail_data: '',
            start_time: '',
            end_time: '',
            sum_time: '',
            request_type: requestType,
            details: details,
            approver_name: '',
            action: requestType,
            device_name: deviceInfo || '-',
            performed_by: requestedBy,
            action_color: actionColors[requestType],
            updated_fields: updatedFieldsHtml,
        };

        const response = await sendViaEmailJS(templateParams);
        console.log(`[EmailService] Admin request notification sent. Status:`, response.status);

        return { success: true };
    } catch (error) {
        console.error('[EmailService] Failed to send admin request notification:', error);
        return { success: false, error };
    }
}
