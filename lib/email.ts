import nodemailer from "nodemailer";

export interface EmailRequestBody {
    posting_date: string;
    station_name: string;
    facility_name: string;
    detail_data: string;
    start_time: string;
    end_time: string;
    sum_time: string;
    user_to: string[];
    cc?: string[];
}

// Shared Transporter Configuration
function createTransporter() {
    return nodemailer.createTransport({
        host: "webmail.thaipbs.or.th",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "nocadmin@thaipbs.or.th",
            pass: "noctpbs",
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}

// Email HTML template for Repair/Downtime
function generateDowntimeEmailHtml(data: EmailRequestBody): string {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NOC Report Downtime</title>
</head>
<body style="
    background-color: #f4f4f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    margin: 0;
    padding: 20px;
">
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
        <tbody>
            <tr>
                <td>
                    <!-- Logo Section -->
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding: 30px 20px; text-align: center;">
                        <tbody>
                            <tr>
                                <td>
                                    <img
                                        src="https://cdn.prod.website-files.com/603c87adb15be3cb0b3ed9b5/662b28e467d3404ab010bc54_110.png"
                                        style="
                                            width: 120px;
                                            height: 120px;
                                            border-radius: 50%;
                                        "
                                        alt="Thai PBS Logo"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Main Content Card -->
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="
                        background-color: #ffffff;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 12px;
                        overflow: hidden;
                    ">
                        <tbody>
                            <tr>
                                <td style="padding: 30px;">
                                    <!-- Header -->
                                    <h1 style="
                                        font-size: 24px;
                                        font-weight: bold;
                                        text-align: center;
                                        color: #1f2937;
                                        margin: 0 0 8px 0;
                                    ">
                                        แจ้งเหตุขัดข้องในการให้บริการฯ
                                    </h1>
                                    <p style="
                                        font-size: 14px;
                                        text-align: center;
                                        color: #6b7280;
                                        margin: 0 0 24px 0;
                                    ">
                                        NOC Downtime Report
                                    </p>

                                    <!-- Info Table -->
                                    <table width="100%" border="0" cellpadding="8" cellspacing="0" style="
                                        border-collapse: collapse;
                                        font-size: 14px;
                                    ">
                                        <tbody>
                                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                                <td style="font-weight: 600; color: #374151; width: 40%;">วันที่บันทึก</td>
                                                <td style="color: #1f2937;">${data.posting_date}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                                <td style="font-weight: 600; color: #374151;">สถานี</td>
                                                <td style="color: #1f2937;">${data.station_name}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                                <td style="font-weight: 600; color: #374151;">ผู้ให้บริการ</td>
                                                <td style="color: #1f2937;">${data.facility_name}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                                <td style="font-weight: 600; color: #374151;">รายละเอียดเหตุการณ์</td>
                                                <td style="color: #1f2937;">${data.detail_data}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                                <td style="font-weight: 600; color: #374151;">เวลาเริ่มต้นออกอากาศไม่ได้</td>
                                                <td style="color: #dc2626; font-weight: 500;">${data.start_time}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                                <td style="font-weight: 600; color: #374151;">เวลาสิ้นสุดออกอากาศไม่ได้</td>
                                                <td style="color: #16a34a; font-weight: 500;">${data.end_time}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-weight: 600; color: #374151;">รวมเวลาหยุดออกอากาศ</td>
                                                <td style="
                                                    color: #ffffff;
                                                    background-color: #ef4444;
                                                    padding: 4px 12px;
                                                    border-radius: 4px;
                                                    display: inline-block;
                                                    font-weight: 600;
                                                ">${data.sum_time}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Footer -->
                    <p style="
                        font-size: 12px;
                        text-align: center;
                        color: rgba(0, 0, 0, 0.5);
                        margin-top: 24px;
                    ">
                        © 2025 | Engineering Thai PBS
                    </p>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
    `;
}

export async function sendRepairEmail(data: EmailRequestBody) {
    try {
        console.log('[EmailService] Preparing to send repair email...', data.station_name);

        if (!data.user_to || data.user_to.length === 0) {
            console.warn('[EmailService] No recipients defined.');
        }

        const emailHtml = generateDowntimeEmailHtml(data);
        const transporter = createTransporter();

        const mailOptions = {
            from: "NOCadmin@thaipbs.or.th",
            to: data.user_to,
            cc: data.cc?.length ? data.cc : undefined,
            subject: `แจ้งเหตุขัดข้องในการให้บริการฯ - ${data.station_name}`,
            html: emailHtml,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] Repair email sent:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] Error sending repair email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email"
        };
    }
}

export async function sendApprovalEmail(
    email: string,
    requestType: string,
    details: string,
    approverName: string
) {
    try {
        console.log(`[EmailService] Sending approval email to ${email}`);

        const subject = `Your Request has been Approved: ${requestType}`;
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #22c55e; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Request Approved</h2>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Your request (<strong>${requestType}</strong>) has been approved and processed successfully.</p>
            <p><strong>Details:</strong><br/>${details}</p>
            <p><strong>Approved By:</strong> ${approverName}</p>
            <p>You can view the updated status in your dashboard.</p>
        </div>
        <div class="footer">
            <p>© 2025 NAIWAH Store Management</p>
        </div>
    </div>
</body>
</html>
        `;

        const transporter = createTransporter();

        await transporter.sendMail({
            from: "NOCadmin@thaipbs.or.th",
            to: email,
            subject: subject,
            html: html,
        });

        console.log(`[EmailService] Approval email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('[EmailService] Failed to send approval email:', error);
        return { success: false, error };
    }
}

export async function sendDeviceNotification(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    deviceName: string,
    details: string,
    performedBy: string
) {
    try {
        console.log(`[EmailService] Sending device notification for ${action} on ${deviceName}`);

        // Default recipient is Admin
        const to = "nocadmin@thaipbs.or.th";

        const subject = `Device Notification: ${action} - ${deviceName}`;
        const color = action === 'DELETE' ? '#ef4444' : action === 'CREATE' ? '#22c55e' : '#3b82f6';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: ${color}; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: ${color}; color: white; font-weight: bold; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Device Notification</h2>
        </div>
        <div class="content">
            <p>A device action has been performed.</p>
            <p><strong>Action:</strong> <span class="badge">${action}</span></p>
            <p><strong>Device:</strong> ${deviceName}</p>
            <p><strong>Performed By:</strong> ${performedBy}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
            <p><strong>Details:</strong></p>
            <pre style="background: #f4f4f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${details}</pre>
        </div>
        <div class="footer">
            <p>© 2025 NAIWAH Store Management</p>
        </div>
    </div>
</body>
</html>
        `;

        const transporter = createTransporter();

        await transporter.sendMail({
            from: "NOCadmin@thaipbs.or.th",
            to: to,
            subject: subject,
            html: html,
        });

        console.log(`[EmailService] Device notification sent for ${deviceName}`);
        return { success: true };
    } catch (error) {
        console.error('[EmailService] Failed to send device notification:', error);
        return { success: false, error };
    }
}
