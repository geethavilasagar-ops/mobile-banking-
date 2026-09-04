import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistrationStatus extends Document {
  userId: mongoose.Types.ObjectId;
  currentStep: number;
  emailVerified: boolean;
  bankSelected: boolean;
  activationMethodSet: boolean;
  activationVerified: boolean;
  pinSet: boolean;
  isComplete: boolean;
  completedAt?: Date;
}

const RegistrationStatusSchema: Schema<IRegistrationStatus> = new Schema(
  {
    userId:              { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStep:         { type: Number, default: 1 },
    emailVerified:       { type: Boolean, default: false },
    bankSelected:        { type: Boolean, default: false },
    activationMethodSet: { type: Boolean, default: false },
    activationVerified:  { type: Boolean, default: false },
    pinSet:              { type: Boolean, default: false },
    isComplete:          { type: Boolean, default: false },
    completedAt:         { type: Date },
  },
  { timestamps: true }
);

const RegistrationStatus: Model<IRegistrationStatus> = mongoose.model<IRegistrationStatus>('RegistrationStatus', RegistrationStatusSchema);
export default RegistrationStatus;
