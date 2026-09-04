import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBeneficiary extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  accountNumber?: string;
  upiId?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiarySchema: Schema<IBeneficiary> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    accountNumber: { type: String },
    upiId: { type: String },
    bankName: { type: String },
  },
  { timestamps: true }
);

const Beneficiary: Model<IBeneficiary> = mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);
export default Beneficiary;
