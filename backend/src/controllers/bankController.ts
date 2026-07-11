import { Request, Response } from 'express';
import Bank from '../models/Bank';
import { successResponse, errorResponse } from '../utils/responseUtils';

export const getBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const query = search
      ? { isActive: true, name: { $regex: search, $options: 'i' } }
      : { isActive: true };

    const banks = await Bank.find(query).sort({ name: 1 });
    successResponse(res, { banks }, 'Banks fetched successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to fetch banks.', 500);
  }
};
