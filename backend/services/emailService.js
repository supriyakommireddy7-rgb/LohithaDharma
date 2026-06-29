const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log('Email Transporter running in SIMULATION mode (missing SMTP credentials).');
    return null;
  }

  // Set up Nodemailer transporter for Gmail (or standard SMTP)
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass, // Gmail App Password
    },
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  // If no transporter (simulation mode)
  if (!transporter) {
    const logId = `simulated-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`=========================================
[SIMULATED EMAIL OUTBOX - ${new Date().toISOString()}]
Message ID: ${logId}
To: ${to}
Subject: ${subject}
Body:
${text}
=========================================`);
    return {
      messageId: logId,
      accepted: [to],
      simulated: true
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Lohitha Dharma AI Assistant" <${process.env.SMTP_USER}>`,
      to,
      subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
      text,
      html: html || text.replace(/\n/g, '<br>')
    });

    console.log(`[SMTP SUCCESS] Email sent successfully: ${info.messageId}`);
    return {
      messageId: info.messageId,
      accepted: info.accepted,
      simulated: false
    };
  } catch (error) {
    console.error('\n[SMTP ERROR] Error sending email via Nodemailer:');
    console.error(`- Message: ${error.message}`);
    console.error(`- Stack: ${error.stack}`);
    
    // Return simulated response instead of throwing to prevent crashing the server flow
    const logId = `failed-smtp-fallback-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`[SMTP FAIL FALLBACK] Logged simulated response: ${logId}\n`);
    return {
      messageId: logId,
      accepted: [to],
      simulated: true,
      error: error.message
    };
  }
};

module.exports = {
  sendMail
};
