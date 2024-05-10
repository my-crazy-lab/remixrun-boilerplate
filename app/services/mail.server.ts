import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

import { dotenv } from './dotenv.server';

export async function sendEmail({ to, from, text, subject }: Mail.Options) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: dotenv.MAIL_SERVER_ADDRESS,
        pass: dotenv.MAIL_SERVER_PASSWORD,
      },
    });
    await transporter.sendMail({
      to,
      from,
      text,
      subject,
    });
  } catch (error) {
    throw new Error('EMAIL_SERVICE_ERROR');
  }
}
