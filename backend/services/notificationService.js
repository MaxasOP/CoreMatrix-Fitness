// backend/services/notificationService.js
// Email, SMS, and push notifications
const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });

    // Twilio throws at require-time if credentials are missing.
    // Allow server to boot even if notifications are not configured yet.
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioClient = (twilioSid && twilioToken)
      ? twilio(twilioSid, twilioToken)
      : null;

  }

  async sendEmail(to, subject, htmlContent) {
    try {
      const result = await this.emailTransporter.sendMail({
        from: 'noreply@corematrix.com',
        to,
        subject,
        html: htmlContent
      });
      return result;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }

  async sendSMS(phoneNumber, message) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      return result;
    } catch (error) {
      console.error('SMS error:', error);
      throw error;
    }
  }

  async sendWorkoutReminder(user) {
    const htmlContent = `
      <h2>Time for your workout! 💪</h2>
      <p>Hi ${user.name},</p>
      <p>It's time to crush your fitness goals today!</p>
      <p>Current streak: ${user.current_workout_streak} days 🔥</p>
      <a href="${process.env.FRONTEND_URL}/workout/new">Log your workout</a>
    `;
    await this.sendEmail(user.email, 'Time for your workout!', htmlContent);
  }

  async sendMealNotification(user) {
    const htmlContent = `
      <h2>Don't forget to log your meal! 🥗</h2>
      <p>Hi ${user.name},</p>
      <p>Logging your meals helps track your progress toward your goal.</p>
      <a href="${process.env.FRONTEND_URL}/meal/new">Log meal</a>
    `;
    await this.sendEmail(user.email, 'Meal logging reminder', htmlContent);
  }

  async sendChallengeUpdate(user, challenge) {
    const htmlContent = `
      <h2>${challenge.title} Update</h2>
      <p>Hi ${user.name},</p>
      <p>You're making great progress! You're at position #${challenge.user_rank} among ${challenge.participants_count} participants.</p>
      <a href="${process.env.FRONTEND_URL}/challenges/${challenge._id}">View challenge</a>
    `;
    await this.sendEmail(user.email, `Update: ${challenge.title}`, htmlContent);
  }
}

module.exports = new NotificationService();
