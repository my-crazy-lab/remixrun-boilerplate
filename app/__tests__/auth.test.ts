import bcrypt from 'bcrypt';
import {
  changePassword,
  getUserByUserId,
  isResetPassExpired,
  isVerificationCodeExpired,
  updateUser,
  verifyAndSendCode,
} from '~/services/auth.server';
import { dotenv } from '~/services/dotenv.server';
import * as EmailService from '~/services/mail.server';
import UsersModel from '~/services/model/users.server';

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

  // describe('authenticator OAuth2 strategy', () => {
  //   let authenticator: Authenticator<AuthenticatorSessionData>;

  //   beforeEach(() => {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     //@ts-ignore
  //     authenticator = new Authenticator();
  //   });

  //   test('valid code', async () => {
  //     const code = 'valid-code';
  //     const user = { id: 'user-id', username: 'username' };

  //     authenticator.use = jest.fn().mockImplementation(strategy => {
  //       return strategy.authenticate({ form: { get: () => code } });
  //     });

  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     //@ts-ignore
  //     const result = await authenticator.use(new FormStrategy());

  //     authenticator.authenticate('user-pass');

  //     console.log(result);
  //     expect(result).toEqual(user);
  //   });
  // });

  describe('Change User information', () => {
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
      resetPassword: {
        expired: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow,
        token: 'resetToken',
      },
    };

    beforeEach(async () => {
      await UsersModel.create(mockUser);
    });

    afterEach(async () => {
      await UsersModel.deleteOne({ _id: mockUser._id });
    });

    it('Should change password successful', async () => {
      const result = await changePassword({
        newPassword: '123456',
        token: mockUser.resetPassword.token,
      });
      expect(result).toEqual(mockUser._id);
    });

    it('Should return data correctly when get user by user id', async () => {
      const account = await getUserByUserId({ userId: mockUser._id });

      expect(account?._id).toEqual(mockUser._id);
      expect(account?.username).toEqual(mockUser.username);
      expect(account?.email).toEqual(mockUser.email);
    });

    it('Should return data correctly when update user', async () => {
      const account = await updateUser({
        username: mockUser.username,
        email: mockUser.email,
        cities: mockUser.cities,
        userId: mockUser._id,
      });

      expect(account?._id).toEqual(mockUser._id);
      expect(account?.email).toEqual(mockUser.email);
    });
  });

  describe('isVerificationCodeExpired & isResetPassExpired', () => {
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
      resetPassword: {
        expired: new Date(Date.now() - 24 * 60 * 60 * 1000),
        token: 'resetToken',
      },
      verification: {
        code: '123456',
        token: 'verificationToken',
        expired: new Date(Date.now() - 24 * 60 * 60 * 1000), //last day
      },
    };

    beforeEach(async () => {
      await UsersModel.create(mockUser);
    });

    afterEach(async () => {
      await UsersModel.deleteOne({ _id: mockUser._id });
    });

    it('isVerificationCodeExpired', async () => {
      const result = await isVerificationCodeExpired({
        token: mockUser.verification.token,
      });
      expect(result).toBe(true);
    });

    it('isResetPassExpired', async () => {
      const result = await isResetPassExpired({
        token: mockUser.resetPassword.token,
      });
      expect(result).toBe(true);
    });
  });
});
