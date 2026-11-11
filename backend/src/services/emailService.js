const nodemailer = require('nodemailer');

/**
 * Email Service using Nodemailer
 * Configure your email provider (Gmail, SendGrid, AWS SES, etc.)
 */
class EmailService {
  constructor() {
    // Initialize transporter
    // For development, you can use a test account or configure your SMTP
    this.transporter = null;

    // EmailJS credentials
    this.serviceId = process.env.EMAILJS_SERVICE_ID || 'service_zdz7i66';
    this.templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_svmcnzn';
    this.userId = process.env.EMAILJS_USER_ID || '9ZH5YHDvmUrekjwkP';
  }

  /**
   * Send OTP for password reset
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<void>}
   */
  async sendPasswordResetOtp(email, otp) {
    console.log(`[EmailService] 🔑 Password reset OTP for ${email}: ${otp}`);
    try {
      // Using EmailJS API from backend
      const emailData = {
        service_id: this.serviceId,
        template_id: this.templateId,
        user_id: this.userId,
        template_params: {
          email: email,
          passcode: otp,
        },
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS failed: ${errorText}`);
      }

      console.log(`[EmailService] Password reset OTP sent to ${email}`);
    } catch (error) {
      console.error('[EmailService] Error sending password reset OTP:', error);
      throw error;
    }
  }

  /**
   * Send OTP for registration
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<void>}
   */
  async sendRegisterOtp(email, otp) {
    console.log(`[EmailService] 🔑 Registration OTP for ${email}: ${otp}`);
    try {
      // Using EmailJS API from backend
      const emailData = {
        service_id: this.serviceId,
        template_id: this.templateId, // Use same template or create separate one
        user_id: this.userId,
        template_params: {
          email: email,
          passcode: otp,
        },
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS failed: ${errorText}`);
      }

      console.log(`[EmailService] Registration OTP sent to ${email}`);
    } catch (error) {
      console.error('[EmailService] Error sending registration OTP:', error);
      throw error;
    }
  }

  /**
   * Send welcome email after registration
   * @param {string} email
   * @param {string} fullName
   * @returns {Promise<void>}
   */
  async sendWelcomeEmail(email, fullName) {
    try {
      // Using EmailJS API from backend
      const emailData = {
        service_id: this.serviceId,
        template_id: this.templateId, // Use welcome template
        user_id: this.userId,
        template_params: {
          email: email,
          name: fullName,
        },
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS failed: ${errorText}`);
      }

      console.log(`[EmailService] Welcome email sent to ${email}`);
    } catch (error) {
      console.error('[EmailService] Error sending welcome email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
