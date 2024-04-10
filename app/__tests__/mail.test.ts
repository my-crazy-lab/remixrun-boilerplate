import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { dotenv } from '~/services/dotenv.server';
import { sendEmail } from '~/services/mail.server';

describe('sendEmail', () => {
  it('Should send email by SMTP successfully with nodemailer library', async () => {
    const sendEmailSpy: (
      mailOptions: Mail.Options,
      callback: (err: Error | null, info: unknown) => void,
    ) => void = jest.fn();
    const createTransportSpy = jest
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({ sendMail: sendEmailSpy });

    const mockParams = {
      text: 'text',
      subject: 'subject',
      to: 'to',
      from: 'from',
    };
    await sendEmail(mockParams);

    expect(createTransportSpy).toHaveBeenNthCalledWith(1, {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: dotenv.MAIL_FROM,
        pass: dotenv.MAIL_APP_PWD,
      },
    });
    expect(sendEmailSpy).toHaveBeenNthCalledWith(1, mockParams);
  });

  it('Should throw error when send email have problem', async () => {
    jest.spyOn(nodemailer, 'createTransport');
    await expect(
      sendEmail({ text: 'text', subject: 'subject', to: 'to', from: 'from' }),
    ).rejects.toThrow('EMAIL_SERVICE_ERROR');
  });
});
