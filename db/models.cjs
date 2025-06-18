const mongoose = require('mongoose');

// Define schemas and models for our tracking system
// Check if models are already defined to avoid "model overwrite" errors
const modelExists = (modelName) => {
  try {
    return !!mongoose.model(modelName);
  } catch (e) {
    return false;
  }
};

// Company Schema
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    index: true
  },
  domain: {
    type: String,
    required: true,
    index: true
  },
  industry: String,
  size: String,
  location: {
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  phone: String,
  email: String,
  website: String,
  firstVisit: {
    type: Date,
    default: Date.now
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  totalVisits: {
    type: Number,
    default: 1
  },
  score: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'cold'
  },
  tags: [String],
  enrichedAt: Date,
  enrichmentSource: [String],
  enrichmentConfidence: Number
});

// Visit/Session Schema
const visitSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: String,
  anonymizedIp: String,
  userAgent: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  referrer: String,
  isReturning: {
    type: Boolean,
    default: false
  },
  pages: [{
    url: String,
    title: String,
    timestamp: Date,
    timeOnPage: Number,
    scrollDepth: Number,
    interactions: Number
  }],
  events: [{
    eventType: String,
    timestamp: Date,
    data: mongoose.Schema.Types.Mixed
  }],
  gdprCompliant: {
    type: Boolean,
    default: true
  }
});

// Customer Schema (companies using our tracking system)
const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: String,
  email: String,
  domain: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  plan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    default: 'basic'
  },
  scriptSettings: {
    gdprCompliant: {
      type: Boolean,
      default: true
    },
    anonymizeIp: {
      type: Boolean,
      default: true
    },
    trackScrollDepth: {
      type: Boolean,
      default: false
    },
    trackDownloads: {
      type: Boolean,
      default: true
    },
    trackFormSubmissions: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Tracking Script Schema
const trackingScriptSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true
  },
  scriptId: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: Date,
  settings: {
    gdprCompliant: {
      type: Boolean,
      default: true
    },
    anonymizeIp: {
      type: Boolean,
      default: true
    },
    trackScrollDepth: {
      type: Boolean,
      default: false
    },
    trackDownloads: {
      type: Boolean,
      default: true
    },
    trackFormSubmissions: {
      type: Boolean,
      default: false
    }
  }
});

// Create models - check if they exist first to avoid model overwrite errors
const Company = modelExists('Company') ? mongoose.model('Company') : mongoose.model('Company', companySchema);
const Visit = modelExists('Visit') ? mongoose.model('Visit') : mongoose.model('Visit', visitSchema);
const Customer = modelExists('Customer') ? mongoose.model('Customer') : mongoose.model('Customer', customerSchema);
const TrackingScript = modelExists('TrackingScript') ? mongoose.model('TrackingScript') : mongoose.model('TrackingScript', trackingScriptSchema);

module.exports = {
  Company,
  Visit,
  Customer,
  TrackingScript
};
