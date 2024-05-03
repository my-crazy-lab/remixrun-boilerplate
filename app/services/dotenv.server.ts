import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string().trim().min(1),
  DB_NAME: z.string().trim().min(1),
  MONGO_URI_APP: z.string().trim().min(1),
  APP_DB_NAME: z.string().trim().min(1),
  MAIL_SERVER_PASSWORD: z.string().trim().min(1),
  MAIL_SERVER_ADDRESS: z.string().trim().min(1),
  BCRYPT_SALT_ROUND: z.number(),
  BCRYPT_PLAIN_TEXT: z.string().trim().min(1),
  ORIGINAL_DOMAIN: z.string().trim().url(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  MAX_AGE_SESSION: z.number(),
  STORAGE_ACCESS_KEY: z.string().trim().min(1),
  STORAGE_SECRET: z.string().trim().min(1),
  STORAGE_REGION: z.string().trim().min(1),
  STORAGE_BUCKET: z.string().trim().min(1),
});

const envServer = envSchema.safeParse({
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  MONGO_URI_APP: process.env.MONGO_URI_APP,
  APP_DB_NAME: process.env.APP_DB_NAME,
  MAIL_SERVER_PASSWORD: process.env.MAIL_SERVER_PASSWORD,
  BCRYPT_PLAIN_TEXT: process.env.BCRYPT_PLAIN_TEXT,
  BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND),
  MAIL_SERVER_ADDRESS: process.env.MAIL_SERVER_ADDRESS,
  ORIGINAL_DOMAIN: process.env.ORIGINAL_DOMAIN,
  MAX_AGE_SESSION: Number(process.env.MAX_AGE_SESSION),
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
  STORAGE_SECRET: process.env.STORAGE_SECRET,
  STORAGE_REGION: process.env.STORAGE_REGION,
  STORAGE_BUCKET: process.env.STORAGE_BUCKET,
});

if (!envServer.success) {
  throw new Error('There is an error with the server environment variables');
}

export const dotenv = envServer.data;
