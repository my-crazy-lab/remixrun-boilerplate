import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string().trim().min(1),
  URI_BE: z.string().trim().min(1),
  DB_NAME: z.string().trim().min(1),
  MAIL_SERVER_PASSWORD: z.string().trim().min(1),
  MAIL_SERVER_ADDRESS: z.string().trim().min(1),
  BCRYPT_SALT_ROUND: z.number(),
  BCRYPT_PLAIN_TEXT: z.string().trim().min(1),
  ORIGINAL_DOMAIN: z.string().trim().url(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const envServer = envSchema.safeParse({
  MONGO_URI: process.env.MONGO_URI,
  URI_BE: process.env.URI_BE,
  DB_NAME: process.env.DB_NAME,
  MAIL_SERVER_PASSWORD: process.env.MAIL_SERVER_PASSWORD,
  BCRYPT_PLAIN_TEXT: process.env.BCRYPT_PLAIN_TEXT,
  BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND),
  MAIL_SERVER_ADDRESS: process.env.MAIL_SERVER_ADDRESS,
  ORIGINAL_DOMAIN: process.env.ORIGINAL_DOMAIN,
});

if (!envServer.success) {
  throw new Error('There is an error with the server environment variables');
}

export const dotenv = envServer.data;
