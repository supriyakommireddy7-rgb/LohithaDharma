const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const emailController = require('../controllers/emailController');
const Email = require('../models/Email');

/**
 * Fetches UNSEEN emails from Gmail IMAP, processes them via AI, and marks them as SEEN.
 */
const fetchAndProcessUnreadEmails = async () => {
  console.log('[IMAP WORKFLOW] Starting Inbox check...');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[IMAP WORKFLOW] Error: SMTP_USER or SMTP_PASS is not configured.');
    throw new Error('IMAP credentials missing.');
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    logger: false
  });

  client.on('error', (err) => {
    console.error('[IMAP WORKFLOW] Client Error Event:', err.message || err);
  });
  
  client.on('close', () => {
    console.log('[IMAP WORKFLOW] Connection closed.');
  });

  const results = { totalFound: 0, repliesSent: 0, skipped: 0, failed: 0, emails: [] };

  try {
    await client.connect();
    console.log('[IMAP WORKFLOW] Connected successfully.');

    const lock = await client.getMailboxLock('INBOX');
    try {
      console.log(`[IMAP WORKFLOW] Selected INBOX. Searching for UNSEEN emails...`);
      const searchResult = await client.search({ seen: false });
      
      if (!searchResult || searchResult.length === 0) {
        console.log('[IMAP WORKFLOW] No new unread emails found.');
        return results;
      }

      results.totalFound = searchResult.length;
      console.log(`[IMAP WORKFLOW] Found ${searchResult.length} new unread email(s).`);

      // 1. DRAIN THE FETCH ITERATOR FIRST to avoid IMAP command deadlock
      const fetchedMessages = [];
      for await (let message of client.fetch(searchResult, { source: true, uid: true })) {
        fetchedMessages.push({
          uid: message.uid,
          source: message.source
        });
      }
      
      // 2. NOW PROCESS THEM AND SEND COMMANDS safely
      for (let message of fetchedMessages) {
        console.log(`\n[IMAP WORKFLOW] Parsing email UID: ${message.uid}`);
        
        try {
          const parsedEmail = await simpleParser(message.source);
          const emailAddress = parsedEmail.from?.value[0]?.address || '';
          const senderName = parsedEmail.from?.value[0]?.name || emailAddress.split('@')[0];
          const subject = parsedEmail.subject || 'No Subject';
          const messageId = parsedEmail.messageId;
          const bodyText = parsedEmail.text || (parsedEmail.html ? parsedEmail.html.replace(/<[^>]+>/g, '') : '');

          if (!bodyText.trim()) {
              console.log(`[IMAP WORKFLOW] Skipping email from ${emailAddress} - No body content.`);
              results.skipped++;
              await client.messageFlagsAdd(message.uid.toString(), ['\\Seen'], { uid: true });
              continue;
          }

          const lowerEmail = emailAddress.toLowerCase();
          if (lowerEmail.includes('noreply') || lowerEmail.includes('no-reply') || lowerEmail.includes('google.com') || lowerEmail.includes('daemon') || lowerEmail === process.env.SMTP_USER.toLowerCase()) {
              console.log(`[IMAP WORKFLOW] Ignoring system/welcome email from: ${emailAddress}`);
              results.skipped++;
              await client.messageFlagsAdd(message.uid.toString(), ['\\Seen'], { uid: true });
              continue;
          }

          if (messageId) {
            const existingEmail = await Email.findOne({ messageId });
            if (existingEmail) {
              console.log(`[IMAP WORKFLOW] Skipping duplicate email (Message-ID: ${messageId})`);
              results.skipped++;
              await client.messageFlagsAdd(message.uid.toString(), ['\\Seen'], { uid: true });
              continue;
            }
          }

          console.log(`[IMAP WORKFLOW] Email from: ${emailAddress} | Subject: ${subject}`);
          
          const processResult = await emailController.processIncomingEmailData({
            messageId,
            name: senderName,
            email: emailAddress,
            phone: '', 
            subject: subject,
            message: bodyText
          });

          results.repliesSent++;
          results.emails.push(processResult.emailRecord);
          console.log(`[IMAP WORKFLOW] Successfully processed email UID: ${message.uid}. AI Reply Generated.`);

          await client.messageFlagsAdd(message.uid.toString(), ['\\Seen'], { uid: true });
          console.log(`[IMAP WORKFLOW] Marked email UID: ${message.uid} as SEEN.`);
        } catch (processError) {
          results.failed++;
          console.error(`[IMAP WORKFLOW] Error processing email UID: ${message.uid}:`, processError);
          // Do not mark as seen, allow retry later
        }
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error('[IMAP WORKFLOW] Connection/Fetch Error:', error);
    throw error;
  } finally {
    await client.logout();
    console.log('[IMAP WORKFLOW] Disconnected.');
  }

  return results;
};

module.exports = {
  fetchAndProcessUnreadEmails
};
