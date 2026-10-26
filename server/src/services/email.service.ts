import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  static async sendWorkspaceInvite(params: {
    to: string;
    workspaceName: string;
    role: string;
    inviterName?: string;
    inviteToken: string;
  }): Promise<void> {
    const inviteUrl = `${env.APP_URL}/invite/${params.inviteToken}`;
    const subject = `You've been invited to join ${params.workspaceName} on RelayOps`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; }
            .container { max-width: 560px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; }
            .logo { font-size: 20px; font-weight: 700; color: #6366f1; margin-bottom: 24px; letter-spacing: -0.5px; }
            h1 { font-size: 22px; color: #f8fafc; margin-top: 0; }
            p { font-size: 15px; line-height: 1.6; color: #94a3b8; }
            .cta-button { display: inline-block; background-color: #6366f1; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 24px 0; }
            .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">RelayOps</div>
            <h1>Workspace Invitation</h1>
            <p>Hello,</p>
            <p><strong>${params.inviterName || "A workspace administrator"}</strong> has invited you to collaborate in <strong>${params.workspaceName}</strong> as a <strong>${params.role}</strong>.</p>
            <p>Click the button below to accept your invitation and activate your account. This invitation link will expire in 24 hours.</p>
            <p style="text-align: center;">
              <a href="${inviteUrl}" class="cta-button" target="_blank">Accept Invitation</a>
            </p>
            <p style="font-size: 13px; color: #64748b; word-break: break-all;">Or copy and paste this URL into your browser:<br>${inviteUrl}</p>
            <p class="footer">If you were not expecting this invitation, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: params.to,
        subject,
        html,
      });
    } catch (error) {
      console.error("[EmailService] Failed to send workspace invite:", error);
      if (env.NODE_ENV === "production") {
        throw error;
      }
    }
  }

  static async sendInvoiceNotice(params: {
    to: string;
    workspaceName: string;
    clientName: string;
    invoiceNumber: string;
    amount: number; // minor currency units
    currency: string;
    deliverableTitle: string;
  }): Promise<void> {
    const formattedAmount = (params.amount / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const portalUrl = `${env.APP_URL}/invoices`;
    const subject = `New Invoice ${params.invoiceNumber} for ${params.deliverableTitle} (${params.currency} ${formattedAmount})`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; }
            .container { max-width: 560px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; }
            .logo { font-size: 20px; font-weight: 700; color: #6366f1; margin-bottom: 24px; letter-spacing: -0.5px; }
            h1 { font-size: 22px; color: #f8fafc; margin-top: 0; }
            p { font-size: 15px; line-height: 1.6; color: #94a3b8; }
            .amount-box { background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
            .amount { font-size: 28px; font-weight: 700; color: #10b981; }
            .cta-button { display: inline-block; background-color: #6366f1; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 24px 0; }
            .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">RelayOps</div>
            <h1>Milestone Approved & Invoice Generated</h1>
            <p>Dear ${params.clientName},</p>
            <p>Following milestone approval for <strong>${params.deliverableTitle}</strong> in <strong>${params.workspaceName}</strong>, invoice <strong>${params.invoiceNumber}</strong> has been generated.</p>
            <div class="amount-box">
              <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">Amount Due</div>
              <div class="amount">${params.currency} ${formattedAmount}</div>
            </div>
            <p style="text-align: center;">
              <a href="${portalUrl}" class="cta-button" target="_blank">View & Pay Invoice</a>
            </p>
            <p class="footer">Thank you for your business. For any questions, please reach out to ${params.workspaceName}.</p>
          </div>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: params.to,
        subject,
        html,
      });
    } catch (error) {
      console.error("[EmailService] Failed to send invoice email:", error);
      if (env.NODE_ENV === "production") {
        throw error;
      }
    }
  }
}
