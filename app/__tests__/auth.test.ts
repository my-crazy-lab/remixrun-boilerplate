import bcrypt from 'bcrypt';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { verifyAndSendCode } from '~/services/auth.server';
import { dotenv } from '~/services/dotenv.server';
import * as EmailService from '~/services/mail.server';
import UsersModel from '~/services/model/users.server';
import { type AuthenticatorSessionData } from '~/types';

jest.mock('~/services/mail.server', () => ({
  __esModule: true,
  sendEmail: jest.fn(),
}));

jest.mock('~/services/auth.server', () => ({
  __esModule: true,
  verifyCode: jest.fn(),
  ...jest.requireActual('~/services/auth.server'),
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
      await UsersModel.create(mockUser);
    });

    afterEach(async () => {
      await UsersModel.deleteOne({ _id: mockUser._id });
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

  // describe('changePassword', () => {});

  describe('authenticator OAuth2 strategy', () => {
    let authenticator: Authenticator<AuthenticatorSessionData>;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      authenticator = new Authenticator();
    });

    test('valid code', async () => {
      const code = 'valid-code';
      const user = { id: 'user-id', username: 'username' };

      authenticator.use = jest.fn().mockImplementation(strategy => {
        return strategy.authenticate({ form: { get: () => code } });
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const result = await authenticator.use(new FormStrategy());

      authenticator.authenticate('user-pass');

      console.log(result);
      expect(result).toEqual(user);
    });
  });
});
