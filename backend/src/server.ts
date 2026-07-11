import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { ENV } from './config/env';
import { seed } from './utils/seedBanks';

const start = async () => {
  await connectDatabase();
  await seed(false); // seed banks and keep connection open

  app.listen(ENV.PORT, () => {
    console.log(`\n🚀 Dev Pay Backend running on port ${ENV.PORT}`);
    console.log(`   Environment : ${ENV.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${ENV.PORT}/api/health\n`);
  });
};

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
