import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  sessionToken?: string;
  isEmailVerified: boolean;
  activationMethod?: 'debit_card' | 'aadhaar';
  selectedBankId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String }, // Hashed password
    phone:     { type: String, trim: true },
    sessionToken:     { type: String },
    isEmailVerified:  { type: Boolean, default: false },
    activationMethod: { type: String, enum: ['debit_card', 'aadhaar'] },
    selectedBankId:   { type: Schema.Types.ObjectId, ref: 'Bank' },
    isActive:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
