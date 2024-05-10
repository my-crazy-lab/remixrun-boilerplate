import { redirect } from '@remix-run/node';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ERROR } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import {
  EXPIRED_RESET_PASSWORD,
  EXPIRED_VERIFICATION_CODE,
} from '~/services/constants.server';
import { dotenv } from '~/services/dotenv.server';
import { sendEmail } from '~/services/mail.server';
import UsersModel from '~/services/model/users.server';
// import '~/services/passports.server';
import type { Users } from '~/types';
import { getFutureTimeFromToday, momentTz } from '~/utils/common';

export function hashPassword(password: string) {
  return bcrypt.hashSync(
    `${dotenv.BCRYPT_PLAIN_TEXT}${password}`,
    dotenv.BCRYPT_SALT_ROUND,
  );
}
function compareHash({ password, hash }: { password: string; hash: string }) {
  return bcrypt.compare(dotenv.BCRYPT_PLAIN_TEXT + password, hash);
}

export async function verifyAndSendCode({
  password,
  username,
}: {
  password: string;
  username: string;
}) {
  const user = await UsersModel.findOne({ username });
  const bcrypt = user?.services?.password?.bcrypt;

  // always display incorrect account error
  if (!user || !bcrypt) {
    throw new Error('INCORRECT_ACCOUNT');
  }
  const verified = await compareHash({
    password,
    hash: bcrypt,
  });

  if (!verified) throw new Error('INCORRECT_ACCOUNT');

  const verificationToken = await sendVerificationCode(user.email);
  return { verificationToken, userId: user._id };
}

export async function sendVerificationCode(email: string) {
  // 6 numbers code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const token = uuidv4();

  await UsersModel.updateOne(
    {
      email,
    },
    {
      $set: {
        verification: {
          code: verificationCode,
          expired: getFutureTimeFromToday(
            EXPIRED_VERIFICATION_CODE,
            'minutes',
          ).toDate(),
          token,
        },
      },
    },
  );

  await sendEmail({
    to: email,
    from: dotenv.MAIL_SERVER_ADDRESS,
    subject: 'Your verification code',
    text: `${verificationCode} is your verification code.`,
  });
  return token;
}

export async function isVerificationCodeExpired({ token }: { token: string }) {
  const account = await UsersModel.findOne({
    'verification.token': token,
    'verification.expired': { $gt: momentTz().toDate() },
  }).lean();

  return !account?._id;
}

export async function isResetPassExpired({ token }: { token: string }) {
  const account = await UsersModel.findOne({
    'resetPassword.token': token,
    'resetPassword.expired': { $gt: momentTz().toDate() },
  }).lean();

  return !account?._id;
}

export async function getUserByUserId({ userId }: { userId: string }) {
  const account = await UsersModel.findOne({
    _id: userId,
  }).lean<Users>();

  return account;
}

export function updateUser({
  username,
  email,
  cities,
  userId,
}: Pick<Users, 'email' | 'username' | 'cities'> & { userId: string }) {
  return UsersModel.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: { username, email, cities, updatedAt: momentTz().toDate() },
    },
  ).lean<Users>();
}

export async function resetPassword(email: string) {
  const resetToken = uuidv4();

  const account = await UsersModel.findOneAndUpdate(
    {
      email,
    },
    {
      $set: {
        resetPassword: {
          expired: getFutureTimeFromToday(
            EXPIRED_RESET_PASSWORD,
            'minutes',
          ).toDate(),
          token: resetToken,
        },
      },
    },
  );

  if (!account?._id) {
    throw new Error(ERROR.EMAIL_INCORRECT);
  }

  await sendEmail({
    to: email,
    from: dotenv.MAIL_SERVER_ADDRESS,
    subject: 'Your link to reset password',
    text: `${dotenv.ORIGINAL_DOMAIN}${ROUTE_NAME.RESET_PASSWORD}/${resetToken} is link to reset your password`,
  });
}

export async function changePassword({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) {
  if (!newPassword || !token) throw new Error('UNKNOWN_ERROR');

  const hashedPassword = hashPassword(newPassword);

  const account = await UsersModel.findOneAndUpdate(
    {
      'resetPassword.expired': { $gt: momentTz().toDate() },
      'resetPassword.token': token,
    },
    {
      $set: {
        'services.password.bcrypt': hashedPassword,
        'resetPassword.expired': momentTz().toDate(),
      },
    },
  );

  // update failure, redirect into reset password page
  if (!account?._id) {
    return redirect(ROUTE_NAME.RESET_PASSWORD);
  }
  return account._id;
}
