import bcrypt from 'bcrypt';
import { verifyAndSendCode } from '~/services/auth.server';
import { dotenv } from '~/services/dotenv.server';
import * as EmailService from '~/services/mail.server';
import { type Users } from '~/types';
import { mongoClientBE } from '~/utils/db.server';

jest.mock('~/services/mail.server', () => ({
  __esModule: true,
  sendEmail: jest.fn(),
}));

describe('Authentication', () => {
  describe('verifyAndSendCode & sendVerificationCode', () => {
    const mockUser = {
      _id: 'fake-id',
      username: 'fake-user',
      email: 'user1@gmail.com',
      createdAt: new Date('2024-02-01'),
      status: 'ACTIVE',
      cities: ['Hồ Chí Minh'],
      services: {
        password: {
          bcrypt: 'testing',
        },
      },
      isoCode: 'VN',
      language: 'vi',
    };
    beforeEach(async () => {
      await mongoClientBE.collection<Users>('users').insertOne(mockUser);
    });

    afterEach(async () => {
      await mongoClientBE
        .collection<Users>('users')
        .deleteOne({ _id: mockUser._id });
    });

    it('Should compare password, generate verify code and send this code into email with nodemailer successfully', async () => {
      const mockVerificationCode = '123456';
      const randomSpy = jest
        .spyOn(Math, 'floor')
        .mockReturnValue(Number(mockVerificationCode));

      const asyncCompare = new Promise<boolean>(resolve => resolve(true));
      // Always return true when decode password
      const bcryptCompareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => asyncCompare);
      const mockPassword = '123456';

      await verifyAndSendCode({
        username: mockUser.username,
        password: mockPassword,
      });

      expect(bcryptCompareSpy).toHaveBeenNthCalledWith(
        1,
        dotenv.BCRYPT_PLAIN_TEXT + mockPassword,
        mockUser.services.password.bcrypt,
      );
      expect(EmailService.sendEmail).toHaveBeenNthCalledWith(1, {
        to: mockUser.email,
        from: dotenv.MAIL_SERVER_ADDRESS,
        subject: 'Your verification code',
        text: `${mockVerificationCode} is your verification code.`,
      });

      randomSpy.mockRestore();
      bcryptCompareSpy.mockRestore();
    });
  });
});
