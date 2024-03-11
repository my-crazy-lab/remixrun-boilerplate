import nodemailer from 'nodemailer';
import { dotenv } from './dotenv.server';

interface EmailArgs {
  text: string;
  subject: string;
  to: string;
  from: string;
}
export async function sendEmail({ to, from, text, subject }: EmailArgs) {
  // const transporter = nodemailer.createTransport(dotenv.MAIL_URL);
  try {
    /*
    await transporter.sendMail({
      to,
      from,
      text,
      subject,
    });
    */
  } catch (error) {
    console.log(error);
  }
}
