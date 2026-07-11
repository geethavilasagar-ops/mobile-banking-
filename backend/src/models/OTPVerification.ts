import mongoose, { Schema, Document, Model } from 'mongoose';

export type OTPType = 'email' | 'card' | 'aadhaar';

export interface IOTPVerification extends Document {
  userId: mongoose.Types.ObjectId;
  hashedOTP: string;
  type: OTPType;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
  isUsed: boolean;
}

const OTPVerificationSchema: Schema<IOTPVerification> = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hashedOTP: { type: String, required: true },
    type:      { type: String, enum: ['email', 'card', 'aadhaar'], required: true },
    expiresAt: { type: Date, required: true },
    attempts:  { type: Number, default: 0 },
    lastSentAt:{ type: Date, default: Date.now },
    isUsed:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-expire documents after expiresAt
OTPVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPVerification: Model<IOTPVerification> = mongoose.model<IOTPVerification>('OTPVerification', OTPVerificationSchema);
export default OTPVerification;
