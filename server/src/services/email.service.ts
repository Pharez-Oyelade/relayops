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
}
