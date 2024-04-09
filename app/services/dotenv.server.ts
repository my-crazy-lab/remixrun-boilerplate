import { z } from 'zod';

const envSchema = z.object({
  URI_APP: z.string().trim().min(1),
  URI_BE: z.string().trim().min(1),
  DB_APP: z.string().trim().min(1),
  MAIL_APP_PWD: z.string().trim().min(1),
  MAIL_FROM: z.string().trim().min(1),
  SALT_ROUND: z.number(),
  PLAIN_TEXT: z.string().trim().min(1),
  DOMAIN_BTASKEE_BE: z.string().trim().url(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const envServer = envSchema.safeParse({
  URI_APP: process.env.URI_APP,
  URI_BE: process.env.URI_BE,
  DB_APP: process.env.DB_APP,
  MAIL_APP_PWD: process.env.MAIL_APP_PWD,
  PLAIN_TEXT: process.env.PLAIN_TEXT,
  SALT_ROUND: Number(process.env.SALT_ROUND),
  MAIL_FROM: process.env.MAIL_FROM,
  DOMAIN_BTASKEE_BE: process.env.DOMAIN_BTASKEE_BE,
});

if (!envServer.success) {
  throw new Error('There is an error with the server environment variables');
}

export const dotenv = envServer.data;
