import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBank extends Document {
  name: string;
  code: string;
  abbreviation: string;
  color: string;
  isActive: boolean;
}

const BankSchema: Schema<IBank> = new Schema(
  {
    name:         { type: String, required: true },
    code:         { type: String, required: true, unique: true, uppercase: true },
    abbreviation: { type: String, required: true },
    color:        { type: String, required: true },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Bank: Model<IBank> = mongoose.model<IBank>('Bank', BankSchema);
export default Bank;
