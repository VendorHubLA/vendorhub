import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendComplianceAlert(
  to: string,
  vendorName: string,
  docType: string,
  daysUntilExpiry: number
) {
  return resend.emails.send({
    from: 'VendorHub <alerts@vendorhub.io>',
    to,
    subject: `Action Required: ${vendorName} compliance document expiring in ${daysUntilExpiry} days`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E3829; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C4A35A; margin: 0; font-size: 24px;">VendorHub</h1>
          <p style="color: #F5F0E8; margin: 4px 0 0;">Compliance Alert</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #D6CCBC; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1E3829; margin-top: 0;">Document Expiring Soon</h2>
          <p style="color: #374151;">
            <strong>${vendorName}</strong>'s <strong>${docType}</strong> is expiring in
            <strong style="color: #C4A35A;">${daysUntilExpiry} days</strong>.
          </p>
          <p style="color: #374151;">Please request an updated document to maintain compliance.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/compliance"
             style="display: inline-block; background: #1E3829; color: #C4A35A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View Compliance Dashboard
          </a>
        </div>
      </div>
    `,
  })
}

export async function sendProjectInvite(
  to: string,
  projectTitle: string,
  inviterName: string,
  inviteUrl: string
) {
  return resend.emails.send({
    from: 'VendorHub <noreply@vendorhub.io>',
    to,
    subject: `You've been invited to collaborate on: ${projectTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E3829; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C4A35A; margin: 0; font-size: 24px;">VendorHub</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #D6CCBC; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1E3829; margin-top: 0;">Project Invitation</h2>
          <p style="color: #374151;">
            <strong>${inviterName}</strong> has invited you to collaborate on
            <strong>${projectTitle}</strong>.
          </p>
          <a href="${inviteUrl}"
             style="display: inline-block; background: #C4A35A; color: #1E3829; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View Project
          </a>
        </div>
      </div>
    `,
  })
}

export async function sendMilestoneApproved(
  to: string,
  milestoneTitle: string,
  projectTitle: string,
  amount: number
) {
  return resend.emails.send({
    from: 'VendorHub <payments@vendorhub.io>',
    to,
    subject: `Milestone approved: ${milestoneTitle} — payment released`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E3829; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C4A35A; margin: 0; font-size: 24px;">VendorHub</h1>
          <p style="color: #F5F0E8; margin: 4px 0 0;">Payment Notification</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #D6CCBC; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1E3829; margin-top: 0;">Milestone Approved</h2>
          <p style="color: #374151;">
            Your milestone <strong>${milestoneTitle}</strong> on <strong>${projectTitle}</strong> has been approved.
          </p>
          <p style="color: #374151;">
            Payment of <strong style="color: #C4A35A;">$${amount.toLocaleString()}</strong> has been released to your account.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #1E3829; color: #C4A35A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View Dashboard
          </a>
        </div>
      </div>
    `,
  })
}
