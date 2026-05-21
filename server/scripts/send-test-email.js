const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

async function main() {
  const smtpUser = process.env.EMAIL_USER;
  const smtpPass = process.env.EMAIL_PASSWORD;
  const smtpFrom = process.env.EMAIL_FROM || smtpUser;
  const smtpService = process.env.EMAIL_SERVICE || 'gmail';

  if (!smtpUser || !smtpPass) {
    console.error('Missing SMTP credentials in server/.env');
    process.exit(1);
  }

  console.log('Using SMTP:', smtpService, 'user:', smtpUser);

  const transporter = nodemailer.createTransport({
    service: smtpService,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: smtpUser,
    subject: 'Test email from electric-erp',
    text: 'This is a test email sent from the local send-test-email.js script.',
  });

  console.log('Send result:', info);
}

main().catch(err => {
  console.error('Test email failed:', err);
  process.exit(1);
});