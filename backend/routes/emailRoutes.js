const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/emailController');
const {
  validateEmailInput,
  validateStatusUpdate
} = require('../middleware/validation');
const { authMiddleware } = require('../middleware/authMiddleware');

// Core API endpoints
// receive-email is public for webhooks/simulation
router.post('/receive-email', validateEmailInput, receiveEmail);
// send-email is protected
router.post('/send-email', authMiddleware, sendEmail); 
router.post('/generate-reply', authMiddleware, generateReplyPreview);
router.post('/check-inbox', authMiddleware, checkInbox);
router.get('/config-status', authMiddleware, configStatus);
router.get('/monitor/status', authMiddleware, getMonitorStatus);
router.post('/monitor/toggle', authMiddleware, toggleMonitor);

router.get('/emails', authMiddleware, getEmails);
router.get('/email/:id', authMiddleware, getEmailById);
router.put('/email/:id/status', authMiddleware, validateStatusUpdate, updateLeadStatus);
router.delete('/email/:id', authMiddleware, deleteEmail);

module.exports = router;
