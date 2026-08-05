import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Bank from '../models/Bank';
import { connectDatabase } from '../config/database';
import { ENV } from '../config/env';

const banks = [
  {
    name: 'State Bank of India',
    code: 'SBI',
    abbreviation: 'SB',
    logoUrl: 'https://ui-avatars.com/api/?name=SBI&background=0F62FE&color=fff&rounded=true&bold=true',
    color: '#0F62FE',
    isActive: true,
  },
  {
    name: 'HDFC Bank',
    code: 'HDFC',
    abbreviation: 'HB',
    logoUrl: 'https://ui-avatars.com/api/?name=HDFC&background=004B8D&color=fff&rounded=true&bold=true',
    color: '#004B8D',
    isActive: true,
  },
  {
    name: 'ICICI Bank',
    code: 'ICICI',
    abbreviation: 'IB',
    logoUrl: 'https://ui-avatars.com/api/?name=ICICI&background=F37021&color=fff&rounded=true&bold=true',
    color: '#F37021',
    isActive: true,
  },
  {
    name: 'Axis Bank',
    code: 'AXIS',
    abbreviation: 'AB',
    logoUrl: 'https://ui-avatars.com/api/?name=AXIS&background=97144D&color=fff&rounded=true&bold=true',
    color: '#97144D',
    isActive: true,
  },
  {
    name: 'Punjab National Bank',
    code: 'PNB',
    abbreviation: 'PB',
    logoUrl: 'https://ui-avatars.com/api/?name=PNB&background=FFB612&color=000&rounded=true&bold=true',
    color: '#FFB612',
    isActive: true,
  },
  {
    name: 'Bank of Baroda',
    code: 'BOB',
    abbreviation: 'BB',
    logoUrl: 'https://ui-avatars.com/api/?name=BOB&background=F05A28&color=fff&rounded=true&bold=true',
    color: '#F05A28',
    isActive: true,
  },
  {
    name: 'Kotak Mahindra Bank',
    code: 'KOTAK',
    abbreviation: 'KB',
    logoUrl: 'https://ui-avatars.com/api/?name=Kotak&background=ED1C24&color=fff&rounded=true&bold=true',
    color: '#ED1C24',
    isActive: true,
  },
  {
    name: 'IndusInd Bank',
    code: 'INDUS',
    abbreviation: 'IB',
    logoUrl: 'https://ui-avatars.com/api/?name=Indus&background=6C2A10&color=fff&rounded=true&bold=true',
    color: '#6C2A10',
    isActive: true,
  },
  {
    name: 'Yes Bank',
    code: 'YES',
    abbreviation: 'YB',
    logoUrl: 'https://ui-avatars.com/api/?name=YES&background=0055A5&color=fff&rounded=true&bold=true',
    color: '#0055A5',
    isActive: true,
  },
  {
    name: 'Canara Bank',
    code: 'CANARA',
    abbreviation: 'CB',
    logoUrl: 'https://ui-avatars.com/api/?name=Canara&background=0066A1&color=fff&rounded=true&bold=true',
    color: '#0066A1',
    isActive: true,
  },
];

export const seed = async (disconnectAfter = false) => {
  try {
    // Clear existing banks
    await Bank.deleteMany({});
    
    // Insert new banks
    await Bank.insertMany(banks);
    console.log(`✅ Seeded ${banks.length} real Indian banks successfully.`);
  } catch (error) {
    console.error('❌ Failed to seed banks:', error);
  }
};

// If run directly via ts-node
if (require.main === module) {
  const run = async () => {
    await connectDatabase();
    await seed(true);
    mongoose.disconnect();
  };
  run().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
