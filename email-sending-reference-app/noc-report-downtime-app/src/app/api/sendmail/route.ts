import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface EmailRequestBody {
    posting_date: string;
    station_name: string;
    facility_name: string;
    detail_data: string;
    start_time: string;
    end_time: string;
    sum_time: string;
    user_to: string[];
    cc: string[];
}

// Email HTML template
function generateEmailHtml(data: EmailRequestBody): string {
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

export async function POST(request: NextRequest) {
    try {
        const body: EmailRequestBody = await request.json();

        const {
            posting_date,
            station_name,
            facility_name,
            detail_data,
            start_time,
            end_time,
            sum_time,
            user_to,
            cc,
        } = body;

        // Validate required fields
        if (!station_name || !user_to?.length) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate email HTML
        const emailHtml = generateEmailHtml({
            posting_date,
            station_name,
            facility_name,
            detail_data,
            start_time,
            end_time,
            sum_time,
            user_to,
            cc,
        });

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: "webmail.thaipbs.or.th",
            port: 587,
            secure: false,
            auth: {
                user: "nocadmin@thaipbs.or.th",
                pass: "noctpbs",
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // Email options
        const mailOptions = {
            from: "NOCadmin@thaipbs.or.th",
            to: user_to,
            cc: cc?.length ? cc : undefined,
            subject: `แจ้งเหตุขัดข้องในการให้บริการฯ - ${station_name}`,
            html: emailHtml,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "Email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to send email" },
            { status: 500 }
        );
    }
}
