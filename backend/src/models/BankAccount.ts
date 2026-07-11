import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAccount extends Document {
  userId: mongoose.Types.ObjectId;
  bankId: mongoose.Types.ObjectId;
  accountNumber: string;
  cardholderName: string;
  cardNumberLast4: string;
  expiryDate: string;
  balance: number;
  createdAt: Date;
}

const BankAccountSchema: Schema<IBankAccount> = new Schema(
  {
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bankId:         { type: Schema.Types.ObjectId, ref: 'Bank', required: true },
    accountNumber:  { type: String, required: true },
    cardholderName: { type: String, required: true },
    cardNumberLast4:{ type: String, required: true, length: 4 },
    expiryDate:     { type: String, required: true },
    balance:        { type: Number, default: 100000, min: 0 },
  },
  { timestamps: true }
);

const BankAccount: Model<IBankAccount> = mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
export default BankAccount;
