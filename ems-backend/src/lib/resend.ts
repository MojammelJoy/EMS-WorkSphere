import { Resend } from "resend";
import { config } from "@/config";
import { logger } from "@/utils/logger";

const resend = new Resend(config.email.resendApiKey);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `WorkSphere <${config.email.from}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    logger.info(`Email sent: ${subject} → ${to}`);
    return data;
  } catch (err) {
    logger.error("Email send failed", err);
    throw err;
  }
}

// ── Email Templates ──────────────────────────────────────────────────

function layout(content: string, title: string): string {
  return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Inter',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">
<tr><td style="background:#4f46e5;padding:32px 40px;text-align:center">
  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">WorkSphere</h1>
  <p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:13px">Enterprise HR Suite</p>
</td></tr>
<tr><td style="padding:40px">${content}</td></tr>
<tr><td style="background:#f8fafc;padding:24px 40px;text-align:center">
  <p style="margin:0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} WorkSphere. All rights reserved.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function btn(text: string, url: string): string {
  return `<div style="text-align:center;margin:32px 0">
    <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px">${text}</a>
  </div>`;
}

export const emailTemplates = {
  welcome: (name: string, tempPassword: string) =>
    layout(`<h2 style="color:#1e293b;margin:0 0 8px">Welcome, ${name}! 👋</h2>
      <p style="color:#64748b;line-height:1.7">Your WorkSphere account is ready. Use the credentials below to sign in.</p>
      <div style="background:#f1f5f9;border-radius:10px;padding:20px;margin:24px 0">
        <p style="margin:0 0 8px;color:#475569;font-size:14px"><strong>Temporary Password:</strong></p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#4f46e5;letter-spacing:3px">${tempPassword}</p>
      </div>
      <p style="color:#94a3b8;font-size:13px">Please change your password after first login.</p>
      ${btn("Sign In Now", `${config.clientUrl}/login`)}`, "Welcome to WorkSphere"),

  resetPassword: (name: string, resetUrl: string) =>
    layout(`<h2 style="color:#1e293b;margin:0 0 8px">Reset your password</h2>
      <p style="color:#64748b;line-height:1.7">Hi ${name}, we received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
      ${btn("Reset Password", resetUrl)}
      <p style="color:#94a3b8;font-size:13px;text-align:center">If you didn't request this, ignore this email.</p>`, "Reset Password"),

  leaveApproved: (name: string, leaveType: string, dates: string) =>
    layout(`<h2 style="color:#1e293b;margin:0 0 8px">Leave Approved ✅</h2>
      <p style="color:#64748b;line-height:1.7">Hi ${name}, your <strong>${leaveType}</strong> request for <strong>${dates}</strong> has been approved.</p>
      ${btn("View Details", `${config.clientUrl}/leave`)}`, "Leave Approved"),

  leaveRejected: (name: string, leaveType: string, reason: string) =>
    layout(`<h2 style="color:#1e293b;margin:0 0 8px">Leave Not Approved</h2>
      <p style="color:#64748b;line-height:1.7">Hi ${name}, your <strong>${leaveType}</strong> request was not approved.</p>
      <p style="color:#64748b">Reason: <em>${reason}</em></p>
      ${btn("View Details", `${config.clientUrl}/leave`)}`, "Leave Rejected"),

  payslipGenerated: (name: string, month: string, netSalary: string) =>
    layout(`<h2 style="color:#1e293b;margin:0 0 8px">Payslip Ready 💰</h2>
      <p style="color:#64748b;line-height:1.7">Hi ${name}, your payslip for <strong>${month}</strong> is ready. Net salary: <strong>${netSalary}</strong>.</p>
      ${btn("View Payslip", `${config.clientUrl}/payroll`)}`, "Payslip Generated"),

  verifyEmail: (name: string, verifyUrl: string) =>
    layout(`<h2 style="color:#1e293b;margin:0 0 8px">Verify your email</h2>
      <p style="color:#64748b;line-height:1.7">Hi ${name}, please verify your email address to complete setup.</p>
      ${btn("Verify Email", verifyUrl)}`, "Verify Email"),
};
