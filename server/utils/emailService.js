const nodemailer = require('nodemailer');

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const templates = {
  'subscription-expiry': {
    subject: 'Your StumpScore Premium Subscription is Expiring Soon',
    html: (data) => `      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${data.name},</h2>
        <p>This is a friendly reminder that your StumpScore Premium subscription will expire in ${data.daysLeft} day${data.daysLeft > 1 ? 's' : ''}, on ${new Date(data.expiryDate).toLocaleDateString()}.</p>
        <div style="background-color: ${data.daysLeft <= 3 ? '#FEF2F2' : '#EFF6FF'}; border: 1px solid ${data.daysLeft <= 3 ? '#FEE2E2' : '#DBEAFE'}; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="color: ${data.daysLeft <= 3 ? '#991B1B' : '#1E40AF'}; font-weight: 600; margin: 0;">
            ⚠️ Your premium features will be disabled in ${data.daysLeft} day${data.daysLeft > 1 ? 's' : ''}
          </p>
        </div>
        <p>Don't miss out on premium features like:</p>
        <ul style="padding-left: 20px; line-height: 1.6;">
          <li>AI-powered match predictions</li>
          <li>Advanced statistics</li>
          <li>Priority access to new features</li>
          <li>Personalized notifications</li>
        </ul>
        <p>To ensure uninterrupted access to premium features, please renew your subscription before the expiry date.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${data.renewalLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Renew Subscription Now
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">If you have any questions or need assistance, feel free to contact our support team.</p>
        <p style="margin-top: 30px;">Best regards,<br>The StumpScore Team</p>
      </div>
    `
  }
};

/**
 * Send an email using a predefined template
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.template - Template name from templates object
 * @param {Object} options.context - Data to populate the template
 * @returns {Promise}
 */
async function sendEmail({ to, template, context }) {
  try {
    if (!templates[template]) {
      throw new Error(`Template '${template}' not found`);
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'StumpScore <noreply@stumpscore.com>',
      to,
      subject: templates[template].subject,
      html: templates[template].html(context)
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

module.exports = { sendEmail };
