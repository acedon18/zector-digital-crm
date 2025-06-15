// Mongoose models for Lead and Visitor
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  companyName: String,
  industry: String,
  companySize: String,
  website: String,
  location: String,
  country: String,
  score: Number,
  status: String,
  tags: [String],
  enriched: Boolean,
  enrichmentError: String,
  interactions: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const VisitorSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  referrer: String,
  pages: [String],
  sessionDuration: Number,
  isReturning: Boolean,
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  createdAt: { type: Date, default: Date.now },
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);

module.exports = { Lead, Visitor };
