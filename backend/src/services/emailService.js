const nodemailer = require('nodemailer');

/**
 * Email Service using Nodemailer
 * Configure your email provider (Gmail, SendGrid, AWS SES, etc.)
 */
class EmailService {
  constructor() {
    // Initialize transporter
    // For development, you can use a test account or configure your SMTP
    this.transporter = nodemailer.createTransport({
      // Example for Gmail (use App Password, not regular password)
      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: false,
      // auth: {
      //   user: process.env.EMAIL_USER,
      //   pass: process.env.EMAIL_PASSWORD,
      // },

      // For development using Ethereal Email (test account)
      // Uncomment to use test account
      // service: 'ethereal',

      // For production, configure your SMTP provider
      // Example for SendGrid
      // host: 'smtp.sendgrid.net',
      // port: 587,
      // auth: {
      //   user: 'apikey',
      //   pass: process.env.SENDGRID_API_KEY,
      // },

      // Using EmailJS as alternative (if you want to keep EmailJS integration)
      // You can call EmailJS API from backend if needed
    });
  }

  /**
   * Send OTP for password reset
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<void>}
   */
  async sendPasswordResetOtp(email, otp) {
    try {
      // Using EmailJS API from backend
      const emailData = {
        service_id: 'service_fgcne1k',
        template_id: 'template_svmcnzn',
        user_id: '9ZH5YHDvmUrekjwkP',
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
    try {
      // Using EmailJS API from backend
      const emailData = {
        service_id: 'service_fgcne1k',
        template_id: 'template_svmcnzn', // Use same template or create separate one
        user_id: '9ZH5YHDvmUrekjwkP',
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
        service_id: 'service_fgcne1k',
        template_id: 'template_svmcnzn', // Use welcome template
        user_id: '9ZH5YHDvmUrekjwkP',
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
