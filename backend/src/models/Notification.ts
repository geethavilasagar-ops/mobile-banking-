import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  type: 'transaction' | 'security' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['transaction', 'security', 'system'], default: 'system' },
  },
  { timestamps: true }
);

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
