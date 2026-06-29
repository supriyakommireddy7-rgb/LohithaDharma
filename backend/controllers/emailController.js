const Email = require('../models/Email');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

const { performance } = require('perf_hooks');

// --- Core Logic Refactored for reuse by REST API and IMAP ---
const processIncomingEmailData = async ({ messageId, name, email, phone, subject, message }) => {
  const processStart = performance.now();
  console.log(`\n===========================================`);
  console.log(`[LIFECYCLE] Email received from: ${email}`);

  // 1. Generate AI Response and Extract Lead Info
  const aiResult = await aiService.generateReply(email, subject || 'No Subject', message);
  const { replyText, language, intent, extractedInfo, aiGenerationTime } = aiResult || {};
  
  console.log(`[LIFECYCLE] Intent detected: ${intent || 'Unknown'}`);
  console.log(`[LIFECYCLE] Language detected: ${language || 'English'}`);
  console.log(`[LIFECYCLE] AI generation time: ${aiGenerationTime}ms`);

  // Determine the lead details
  const leadName = extractedInfo?.name || name || 'Valued Customer';
  const leadPhone = extractedInfo?.phone || phone || '';
  const leadLanguage = language || 'English';

  // 2. Create the email record in MongoDB
  const emailRecord = new Email({
    messageId,
    name: leadName,
    email,
    phone: leadPhone,
    language: leadLanguage,
    subject: subject || 'No Subject',
    message,
    aiReply: replyText || '',
    location: extractedInfo?.location || '',
    budget: extractedInfo?.budget || '',
    propertyType: extractedInfo?.propertyType || '',
    preferredContactTime: extractedInfo?.preferredContactTime || '',
    leadStatus: 'New',
    source: 'Email',
  });

  // Populate initial email history logs
  emailRecord.history.push({
    sender: email,
    recipient: 'office@lohithadharma.com',
    subject: subject || 'No Subject',
    message: message,
    isAiGenerated: false
  });

  emailRecord.history.push({
    sender: 'office@lohithadharma.com',
    recipient: email,
    subject: subject ? `Re: ${subject}` : 'Re: Inquiry - Lohitha Dharma',
    message: replyText,
    isAiGenerated: true
  });

  // 3. Automatically send response back via SMTP
  const emailResponse = await emailService.sendMail({
    to: email,
    subject: subject ? `Re: ${subject}` : 'Inquiry - Lohitha Dharma',
    text: replyText
  });
  console.log(`[LIFECYCLE] Email sent: ${emailResponse.messageId || 'Simulated'}`);

  await emailRecord.save();

  const totalTime = Math.round(performance.now() - processStart);
  console.log(`[LIFECYCLE] Total processing time: ${totalTime}ms`);
  console.log(`===========================================\n`);

  return {
    emailRecord,
    deliveryStatus: emailResponse.simulated ? 'Simulated Send' : 'Delivered'
  };
};

// @desc    Simulate receiving an email from a customer
// @route   POST /api/receive-email
// @access  Public
const receiveEmail = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    const result = await processIncomingEmailData({ name, email, phone, subject, message });

    res.status(201).json({
      success: true,
      message: 'Email received and auto-reply processed.',
      data: result.emailRecord,
      deliveryStatus: result.deliveryStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a manual reply or fresh email
// @route   POST /api/send-email
// @access  Public
const sendEmail = async (req, res, next) => {
  try {
    const { emailId, email, subject, message } = req.body;

    let targetEmail = email;
    let targetSubject = subject;
    let emailRecord = null;

    if (emailId) {
      // Replying to an existing thread
      emailRecord = await Email.findById(emailId);
      if (!emailRecord) {
        return res.status(404).json({ error: 'Email record not found.' });
      }
      targetEmail = emailRecord.email;
      targetSubject = emailRecord.subject;
    }

    if (!targetEmail || !message) {
      return res.status(400).json({ error: 'Recipient email and message body are required.' });
    }

    // Send the email
    const emailResponse = await emailService.sendMail({
      to: targetEmail,
      subject: targetSubject || 'Follow-up - Lohitha Dharma',
      text: message
    });

    if (emailRecord) {
      // Update history and update status to Contacted
      emailRecord.history.push({
        sender: 'office@lohithadharma.com',
        recipient: targetEmail,
        subject: targetSubject ? `Re: ${targetSubject}` : 'Follow-up',
        message: message,
        isAiGenerated: false
      });
      emailRecord.leadStatus = 'Contacted';
      await emailRecord.save();
    } else {
      // Create new record for fresh outbound mail
      emailRecord = new Email({
        name: 'Manual Contact',
        email: targetEmail,
        subject: targetSubject || 'Follow-up - Lohitha Dharma',
        message: 'Outbound Contact Init',
        aiReply: '',
        leadStatus: 'Contacted',
        source: 'Email'
      });
      emailRecord.history.push({
        sender: 'office@lohithadharma.com',
        recipient: targetEmail,
        subject: targetSubject || 'Follow-up - Lohitha Dharma',
        message: message,
        isAiGenerated: false
      });
      await emailRecord.save();
    }

    res.status(200).json({
      success: true,
      message: 'Email sent successfully.',
      data: emailRecord,
      deliveryStatus: emailResponse.simulated ? 'Simulated Send' : 'Delivered'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate preview of AI reply
// @route   POST /api/generate-reply
// @access  Public
const generateReplyPreview = async (req, res, next) => {
  try {
    const { email, subject, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const aiResult = await aiService.generateReply(
      email || 'preview@example.com',
      subject || 'Preview Request',
      message
    );

    res.status(200).json({
      success: true,
      data: aiResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all emails/enquiries (with search & filters)
// @route   GET /api/emails
// @access  Public
const getEmails = async (req, res, next) => {
  try {
    const { status, language, search } = req.query;
    let query = {};

    // Apply Status Filter
    if (status && status !== 'All') {
      query.leadStatus = status;
    }

    // Apply Language Filter
    if (language && language !== 'All') {
      query.language = language;
    }

    // Apply Text Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const emails = await Email.find(query).sort({ createdDate: -1 });
    res.status(200).json({
      success: true,
      count: emails.length,
      data: emails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single email/enquiry details
// @route   GET /api/email/:id
// @access  Public
const getEmailById = async (req, res, next) => {
  try {
    const emailRecord = await Email.findById(req.params.id);
    
    if (!emailRecord) {
      return res.status(404).json({ error: 'Email record not found.' });
    }

    res.status(200).json({
      success: true,
      data: emailRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status
// @route   PUT /api/email/:id/status
// @access  Public
const updateLeadStatus = async (req, res, next) => {
  try {
    const emailRecord = await Email.findById(req.params.id);

    if (!emailRecord) {
      return res.status(404).json({ error: 'Email record not found.' });
    }

    emailRecord.leadStatus = req.body.status;
    await emailRecord.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${req.body.status}`,
      data: emailRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete email record
// @route   DELETE /api/email/:id
// @access  Public
const deleteEmail = async (req, res, next) => {
  try {
    const emailRecord = await Email.findById(req.params.id);

    if (!emailRecord) {
      return res.status(404).json({ error: 'Email record not found.' });
    }

    await Email.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Email record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get configuration status of services (health check)
// @route   GET /api/config-status
// @access  Public
const configStatus = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    res.status(200).json({
      success: true,
      data: {
        geminiActive: !!process.env.GEMINI_API_KEY,
        openaiActive: !!process.env.OPENAI_API_KEY,
        smtpActive: !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
        mongodbActive: mongoose.connection.readyState === 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger IMAP to check for new emails and auto-reply
// @route   POST /api/check-inbox
// @access  Public
const checkInbox = async (req, res, next) => {
  try {
    const imapService = require('../services/imapService');
    const result = await imapService.fetchAndProcessUnreadEmails();
    
    res.status(200).json({
      success: true,
      message: `Processed emails.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get auto monitor status
// @route   GET /api/monitor/status
// @access  Public
const getMonitorStatus = async (req, res, next) => {
  try {
    const monitorService = require('../services/monitorService');
    res.status(200).json({
      success: true,
      data: monitorService.getStatus()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle auto monitor
// @route   POST /api/monitor/toggle
// @access  Public
const toggleMonitor = async (req, res, next) => {
  try {
    const monitorService = require('../services/monitorService');
    const { action } = req.body; // 'start' or 'stop'
    
    if (action === 'start') {
      monitorService.startMonitor();
    } else if (action === 'stop') {
      monitorService.stopMonitor();
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "start" or "stop".' });
    }

    res.status(200).json({
      success: true,
      message: `Monitor ${action}ed successfully.`,
      data: monitorService.getStatus()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processIncomingEmailData,
  receiveEmail,
  sendEmail,
  generateReplyPreview,
  getEmails,
  getEmailById,
  updateLeadStatus,
  deleteEmail,
  configStatus,
  checkInbox,
  getMonitorStatus,
  toggleMonitor
};
