import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransactionPIN extends Document {
  userId: mongoose.Types.ObjectId;
  hashedPIN: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionPINSchema: Schema<ITransactionPIN> = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    hashedPIN: { type: String, required: true },
  },
  { timestamps: true }
);

const TransactionPIN: Model<ITransactionPIN> = mongoose.model<ITransactionPIN>('TransactionPIN', TransactionPINSchema);
export default TransactionPIN;
