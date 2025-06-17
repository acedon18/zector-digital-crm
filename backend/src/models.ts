import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  country?: string;
  score?: number;
  status?: string;
  tags?: string[];
  enriched?: boolean;
  enrichmentError?: string;
  interactions?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const LeadSchema = new Schema<ILead>({
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
  interactions: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Lead = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export interface IVisitor extends Document {
  ip?: string;
  userAgent?: string;
  referrer?: string;
  pages?: string[];
  sessionDuration?: number;
  isReturning?: boolean;
  lead?: ILead['_id'];
  createdAt?: Date;
}

const VisitorSchema = new Schema<IVisitor>({
  ip: String,
  userAgent: String,
  referrer: String,
  pages: [String],
  sessionDuration: Number,
  isReturning: Boolean,
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  createdAt: { type: Date, default: Date.now },
});

export const Visitor = mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);
