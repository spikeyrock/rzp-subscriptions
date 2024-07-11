import mongoose, { Schema, Document } from 'mongoose';

interface ISubscription extends Document {
  email: string;
  plan: string; // M, A, L
  paid: boolean;
  planId?: string;
  quantity?: number;
  currentStart?: number;
  currentEnd?: number;
}

const SubscriptionSchema: Schema = new Schema({
  email: { type: String, required: true },
  plan: { type: String, required: true },
  paid: { type: Boolean, required: true, default: false },
  planId: { type: String },
  quantity: { type: Number },
  currentStart: { type: Number },
  currentEnd: { type: Number },
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
