import nodemailer from 'nodemailer';
import { dotenv } from './dotenv.server';

export interface EmailArgs {
  text: string;
  subject: string;
  to: string;
  from: string;
}
export async function sendEmail({ to, from, text, subject }: EmailArgs) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: dotenv.MAIL_FROM,
        pass: dotenv.MAIL_APP_PWD,
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
