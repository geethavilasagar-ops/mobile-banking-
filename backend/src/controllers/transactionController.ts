import { Response, Request } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import BankAccount from '../models/BankAccount';
import Beneficiary from '../models/Beneficiary';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/responseUtils';
import TransactionPIN from '../models/TransactionPIN';
import { compareValue } from '../utils/hashUtils';

export const transferValidation = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('pin').trim().notEmpty().withMessage('Transaction PIN is required'),
  body('receiverUpiId').optional().trim(),
  body('receiverAccountNumber').optional().trim(),
];

const generateReferenceId = () => {
  return 'TXN' + Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

export const transfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, title, pin, receiverUpiId, receiverAccountNumber, receiverName } = req.body;
    const userId = req.userId!;

    // Validate PIN
    const transactionPin = await TransactionPIN.findOne({ userId });
    if (!transactionPin) {
      errorResponse(res, 'Transaction PIN not set.', 403);
      return;
    }
    const isPinValid = await compareValue(pin, transactionPin.hashedPIN);
    if (!isPinValid) {
      errorResponse(res, 'Invalid Transaction PIN.', 401);
      return;
    }

    // Check sender account
    const senderAccount = await BankAccount.findOne({ userId });
    if (!senderAccount) {
      errorResponse(res, 'Sender bank account not found.', 404);
      return;
    }

    if (senderAccount.balance < amount) {
      errorResponse(res, 'Insufficient balance.', 400);
      return;
    }

    // In a real banking app, we would resolve the receiver's account here using UPI ID or Account Number.
    // For this project, we will simulate the receiver.
    let receiverAccount = null;
    if (receiverAccountNumber) {
       receiverAccount = await BankAccount.findOne({ accountNumber: receiverAccountNumber });
    }

    if (receiverAccount && receiverAccount.userId.toString() === userId) {
      errorResponse(res, 'Cannot transfer to your own account.', 400);
      return;
    }

    // Deduct from sender
    senderAccount.balance -= amount;
    await senderAccount.save();

    // Add to receiver if they exist in our DB
    if (receiverAccount) {
      receiverAccount.balance += amount;
      await receiverAccount.save();
    }

    // Record Transaction
    const refId = generateReferenceId();
    const txn = await Transaction.create({
      userId,
      amount,
      type: 'transfer',
      status: 'completed',
      title,
      referenceId: refId,
      senderAccountId: senderAccount._id,
      receiverAccountId: receiverAccount ? receiverAccount._id : undefined,
      receiverName: receiverName || (receiverAccount ? receiverAccount.cardholderName : 'Unknown'),
      receiverUpiId: receiverUpiId,
    });

    // Notify sender
    await Notification.create({
      userId,
      title: 'Transfer Successful',
      message: `You have successfully transferred ₹${amount} to ${txn.receiverName}.`,
      type: 'transaction'
    });

    // Notify receiver if they exist
    if (receiverAccount) {
      await Notification.create({
        userId: receiverAccount.userId,
        title: 'Money Received',
        message: `You have received ₹${amount} from ${senderAccount.cardholderName}.`,
        type: 'transaction'
      });
      
      // Also create a receive transaction for the receiver
      await Transaction.create({
        userId: receiverAccount.userId,
        amount,
        type: 'receive',
        status: 'completed',
        title: `Received from ${senderAccount.cardholderName}`,
        referenceId: refId,
        senderAccountId: senderAccount._id,
        receiverAccountId: receiverAccount._id,
        receiverName: senderAccount.cardholderName,
      });
    }

    successResponse(res, { transaction: txn, balance: senderAccount.balance }, 'Transfer successful.');
  } catch (err) {
    console.error('Transfer Error:', err);
    errorResponse(res, 'Transfer failed due to internal error.', 500);
  }
};

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ userId: req.userId });

    successResponse(res, {
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }, 'History fetched successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to fetch transaction history.', 500);
  }
};
