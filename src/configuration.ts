import * as dotenv from 'dotenv';

dotenv.config();

export const cfg = {
  nodeEnv: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  walletEncryptionKey: process.env.WALLET_ENCRYPTION_KEY || '',

  chainIconTemplateUrl: process.env.CHAIN_ICON_TEMPLATE_URL || '',
  availableChainIds: (process.env.AVAILABLE_CHAIN_IDS || '').split(','),
};
