import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'transfer' | 'receive' | 'payment';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  title: string;
  referenceId: string;
  senderAccountId?: mongoose.Types.ObjectId;
  receiverAccountId?: mongoose.Types.ObjectId;
  receiverName?: string;
  receiverUpiId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['transfer', 'receive', 'payment'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    title: { type: String, required: true },
    referenceId: { type: String, required: true, unique: true },
    senderAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
    receiverAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
    receiverName: { type: String },
    receiverUpiId: { type: String },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
