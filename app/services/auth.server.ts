import { redirect } from '@remix-run/node';
import bcrypt from 'bcrypt';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { v4 as uuidv4 } from 'uuid';
import { ERROR } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { sendEmail } from '~/services/mail.server';
import { sessionStorage } from '~/services/session.server';
import { type Users } from '~/types';
import { getFutureTimeFromToday, momentTz } from '~/utils/common';
import { mongodb } from '~/utils/db.server';

import {
  EXPIRED_RESET_PASSWORD,
  EXPIRED_VERIFICATION_CODE,
} from './constants.server';
import { dotenv } from './dotenv.server';

interface AuthenticatorSessionData {
  userId: string;
}
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<AuthenticatorSessionData>(
  sessionStorage,
  {
    throwOnError: true,
  },
);

export function hashPassword(password: string) {
  return bcrypt.hashSync(`${dotenv.BCRYPT_PLAIN_TEXT}${password}`, dotenv.BCRYPT_SALT_ROUND);
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
  const user = await mongodb.collection<Users>('users').findOne({ username });
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

  const verificationCode = await sendVerificationCode(user.email);
  return verificationCode;
}

export async function sendVerificationCode(email: string) {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const token = uuidv4();

  const accountsCol = mongodb.collection('users');
  await accountsCol.updateOne(
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
  const account = await mongodb.collection('users').findOne({
    'verification.token': token,
    'verification.expired': { $gt: momentTz().toDate() },
  });

  return !account?._id;
}

export async function isResetPassExpired({ token }: { token: string }) {
  const account = await mongodb.collection('users').findOne({
    'resetPassword.token': token,
    'resetPassword.expired': { $gt: momentTz().toDate() },
  });

  return !account?._id;
}

export async function verifyCode(
  code: string,
): Promise<AuthenticatorSessionData> {
  const account = await mongodb.collection<Users>('users').findOneAndUpdate(
    {
      'verification.expired': { $gt: momentTz().toDate() },
      'verification.code': code,
    },
    {
      $set: {
        'verification.expired': momentTz().toDate(),
      },
    },
  );
  if (!account?._id) {
    throw new Error('CODE_INCORRECT_OR_EXPIRED');
  }
  return { userId: account._id };
}

export async function resetPassword(email: string) {
  const resetToken = uuidv4();

  const account = await mongodb.collection('users').findOneAndUpdate(
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

  const account = await mongodb.collection('users').findOneAndUpdate(
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
}

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const code = form.get('code')?.toString();
    if (!code) {
      throw new Error('Login failure');
    }
    const user = await verifyCode(code);
    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass',
);
