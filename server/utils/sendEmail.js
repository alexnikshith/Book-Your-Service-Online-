const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0ea5e9; text-align: center;">ServiceFinder Support</h2>
        <p>Hello,</p>
        <p>${options.message.replace(/\n/g, '<br>')}</p>
        <p style="margin-top: 30px;">Best regards,<br>The ServiceFinder Team</p>
        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 10px; color: #999; text-align: center;">&copy; 2026 Local Service Finder Platform. All rights reserved.</p>
      </div>
    `
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
