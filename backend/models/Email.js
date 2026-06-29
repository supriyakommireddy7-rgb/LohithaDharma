const mongoose = require('mongoose');

const EmailHistorySchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  subject: String,
  message: {
    type: String,
    required: true
  },
  isAiGenerated: {
    type: Boolean,
    default: false
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const EmailSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    trim: true,
    default: 'Valued Customer'
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  language: {
    type: String,
    default: 'English',
    enum: ['English', 'Telugu', 'Hindi', 'Unknown']
  },
  subject: {
    type: String,
    default: 'No Subject'
  },
  message: {
    type: String,
    required: true
  },
  aiReply: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  budget: {
    type: String,
    default: ''
  },
  propertyType: {
    type: String,
    default: ''
  },
  preferredContactTime: {
    type: String,
    default: ''
  },
  leadStatus: {
    type: String,
    default: 'New',
    enum: ['New', 'Contacted', 'Follow-up', 'Closed']
  },
  source: {
    type: String,
    default: 'Email'
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  history: [EmailHistorySchema]
});

module.exports = mongoose.model('Email', EmailSchema);
