/**
 * Email Service
 * Handles transactional emails (such as Agency Activation emails)
 * Supports production SMTP and development fallback logging.
 */

export const sendAgencyActivationEmail = async ({
  to,
  agencyName,
  applicationId,
  activationToken,
  activationUrl,
}) => {
  const subject = 'Admify Agency Account Approved — Activate Your Account';

  const clientUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
  const fullActivationUrl =
    activationUrl || `${clientUrl}/activate-agency?token=${activationToken}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #050b1f; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
    .content { padding: 32px 24px; }
    .meta-box { background: #1e293b; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .meta-label { color: #94a3b8; }
    .meta-value { color: #f8fafc; font-weight: 600; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); }
    .footer { padding: 20px 24px; background: #090d1a; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admify Official Verification</h1>
      <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 14px;">Study Abroad Agency Partnership</p>
    </div>
    <div class="content">
      <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Congratulations, ${agencyName}!</h2>
      <p style="color: #cbd5e1; line-height: 1.6; font-size: 14px;">
        We are pleased to inform you that your agency registration and verification documents have been <strong>approved</strong> by the Admify Compliance Team.
      </p>
      
      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Agency Name:</span>
          <span class="meta-value">${agencyName}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Application ID:</span>
          <span class="meta-value">${applicationId}</span>
        </div>
        <div class="meta-row" style="margin-bottom: 0;">
          <span class="meta-label">Status:</span>
          <span class="meta-value" style="color: #34d399;">VERIFIED & APPROVED</span>
        </div>
      </div>

      <p style="color: #cbd5e1; line-height: 1.6; font-size: 14px;">
        To activate your official agency portal and access student applications, commission tracking, and partner universities, click the activation button below:
      </p>

      <div class="btn-container">
        <a href="${fullActivationUrl}" class="btn" target="_blank">Activate My Agency Account</a>
      </div>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
        Or copy and paste this secure link into your browser:<br>
        <span style="color: #818cf8; word-break: break-all;">${fullActivationUrl}</span>
      </p>

      <p style="color: #f59e0b; font-size: 12px; line-height: 1.5; margin-top: 20px;">
        ⚠️ <strong>Security Notice:</strong> This activation link is single-use and will expire in 48 hours. If you did not apply for an agency account on Admify, please contact compliance@admify.world immediately.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Admify AI Technologies. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  // Production SMTP check
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  if (smtpConfigured) {
    try {
      // Dynamic import of nodemailer if available
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Admify Partner Network" <no-reply@admify.world>',
        to,
        subject,
        html: htmlContent,
      });

      console.log(`[Email Service (Production)] Activation email sent to ${to}: ${info.messageId}`);
      return {
        success: true,
        delivered: true,
        mode: 'PRODUCTION_SMTP',
        messageId: info.messageId,
        activationUrl: fullActivationUrl,
      };
    } catch (err) {
      console.error(`[Email Service (SMTP Error)] Failed to deliver email to ${to}:`, err.message);
      // Fallback to dev log logging so the process does not halt
    }
  }

  // Development Fallback Logging (clearly marked, not pretending delivery)
  console.log('\n' + '='.repeat(70));
  console.log(' [EMAIL SERVICE - DEVELOPMENT FALLBACK]');
  console.log(' Mode: DEVELOPMENT_FALLBACK (No SMTP credentials configured)');
  console.log(` To: ${to}`);
  console.log(` Subject: ${subject}`);
  console.log(` Agency: ${agencyName} (${applicationId})`);
  console.log(` Activation URL: ${fullActivationUrl}`);
  console.log('='.repeat(70) + '\n');

  return {
    success: true,
    delivered: false,
    mode: 'DEV_FALLBACK',
    note: 'Email was logged to server console in development mode. Real SMTP delivery requires SMTP_HOST credentials.',
    activationUrl: fullActivationUrl,
  };
};

export const sendUniversityRepApprovalEmail = async ({
  to,
  representativeName,
  universityName,
  applicationId,
}) => {
  const subject = 'Admify University Representative Approved — Account Active';

  const clientUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
  const loginUrl = `${clientUrl}/login`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #050b1f; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981, #0d9488); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
    .content { padding: 32px 24px; }
    .meta-box { background: #1e293b; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .meta-label { color: #94a3b8; }
    .meta-value { color: #f8fafc; font-weight: 600; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); }
    .footer { padding: 20px 24px; background: #090d1a; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admify Official Verification</h1>
      <p style="margin: 6px 0 0 0; color: #ecfdf5; font-size: 14px;">University Representative Authorization</p>
    </div>
    <div class="content">
      <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Congratulations, ${representativeName || 'Representative'}!</h2>
      <p style="color: #cbd5e1; line-height: 1.6; font-size: 14px;">
        Your University Representative registration has been approved. Your account is now active and you can log in directly.
      </p>
      
      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Representative:</span>
          <span class="meta-value">${representativeName || 'Representative'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">University:</span>
          <span class="meta-value">${universityName || 'Partner University'}</span>
        </div>
        ${applicationId ? `
        <div class="meta-row">
          <span class="meta-label">Application ID:</span>
          <span class="meta-value">${applicationId}</span>
        </div>` : ''}
        <div class="meta-row" style="margin-bottom: 0;">
          <span class="meta-label">Account Status:</span>
          <span class="meta-value" style="color: #34d399;">ACTIVE</span>
        </div>
      </div>

      <p style="color: #cbd5e1; line-height: 1.6; font-size: 14px;">
        You can now access your official University Representative portal using your registered email address and password.
      </p>

      <div class="btn-container">
        <a href="${loginUrl}" class="btn" target="_blank">Log In to University Portal</a>
      </div>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; word-break: break-all;">
        Login URL:<br/>
        <a href="${loginUrl}" style="color: #34d399; word-break: break-all;">${loginUrl}</a>
      </p>
    </div>
    <div class="footer">
      &copy; 2026 Admify Global Education Network. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  if (smtpConfigured) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Admify Compliance" <compliance@admify.world>',
        to,
        subject,
        html: htmlContent,
      });

      console.log(`[Email Service (Production)] University Rep approval email sent to ${to}: ${info.messageId}`);
      return {
        success: true,
        delivered: true,
        mode: 'PRODUCTION_SMTP',
        messageId: info.messageId,
        loginUrl,
      };
    } catch (err) {
      console.error(`[Email Service (SMTP Error)] Failed to deliver email to ${to}:`, err.message);
    }
  }

  // Development Fallback Logging
  console.log('\n' + '='.repeat(70));
  console.log(' [EMAIL SERVICE - UNIVERSITY REP APPROVAL]');
  console.log(' Mode: DEVELOPMENT_FALLBACK (No SMTP credentials configured)');
  console.log(` To: ${to}`);
  console.log(` Subject: ${subject}`);
  console.log(` Representative: ${representativeName}`);
  console.log(` University: ${universityName} (${applicationId || 'N/A'})`);
  console.log(` Message: Your University Representative registration has been approved. Your account is now active and you can log in directly.`);
  console.log(` Login URL: ${loginUrl}`);
  console.log('='.repeat(70) + '\n');

  return {
    success: true,
    delivered: false,
    mode: 'DEV_FALLBACK',
    note: 'Email was logged to server console in development mode.',
    loginUrl,
  };
};

// Backward-compatibility wrapper
export const sendUniversityRepActivationEmail = sendUniversityRepApprovalEmail;


export const sendAgencyApprovalEmail = async ({
  to,
  agencyName,
  applicationId,
}) => {
  const subject = 'Admify Agency Registration Approved';
  const loginUrl = 'https://admify.world/login';

  const textContent = `Your agency registration has been approved by Admify.

You can now log in to your Admify Agency account using your registered email address and password.

Login here:
${loginUrl}

Thank you,
Admify Team`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #050b1f; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
    .content { padding: 32px 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
    .footer { padding: 20px 24px; background: #090d1a; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admify Official Verification</h1>
      <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 14px;">Study Abroad Agency Partnership</p>
    </div>
    <div class="content">
      <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Congratulations, ${agencyName || 'Partner'}!</h2>
      <p>Your agency registration has been approved by Admify.</p>
      <p>You can now log in to your Admify Agency account using your registered email address and password.</p>
      <div class="btn-container">
        <a href="${loginUrl}" class="btn" target="_blank">Login to Agency Portal</a>
      </div>
      <p style="font-size: 12px; color: #94a3b8;">
        Login here:<br>
        <a href="${loginUrl}" style="color: #818cf8;">${loginUrl}</a>
      </p>
      <p style="margin-top: 24px;">Thank you,<br><strong>Admify Team</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Admify AI Technologies. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  // Production SMTP check
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  if (smtpConfigured) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Admify Partner Network" <no-reply@admify.world>',
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email Service (Production)] Approval notification sent to ${to}: ${info.messageId}`);
      return {
        success: true,
        delivered: true,
        mode: 'PRODUCTION_SMTP',
        messageId: info.messageId,
      };
    } catch (err) {
      console.error(`[Email Service (SMTP Error)] Failed to deliver email to ${to}:`, err.message);
    }
  }

  // Development Fallback Logging (clearly marked, not pretending delivery)
  console.log('\n' + '='.repeat(70));
  console.log(' [EMAIL SERVICE - AGENCY APPROVAL NOTIFICATION]');
  console.log(' Mode: DEVELOPMENT_FALLBACK (No SMTP credentials configured)');
  console.log(` To: ${to}`);
  console.log(` Subject: ${subject}`);
  console.log(` Agency: ${agencyName} (${applicationId || 'N/A'})`);
  console.log(` Message: Your agency registration has been approved. You can now log in at ${loginUrl}`);
  console.log('='.repeat(70) + '\n');

  return {
    success: true,
    delivered: false,
    mode: 'DEV_FALLBACK',
    note: 'Email was logged to server console in development mode. Real SMTP delivery requires SMTP_HOST credentials.',
  };
};

export default {
  sendAgencyApprovalEmail,
  sendAgencyActivationEmail,
  sendUniversityRepApprovalEmail,
  sendUniversityRepActivationEmail,
};


