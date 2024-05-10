import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from '~/services/session.server';
import type { AuthenticatorSessionData, Users } from '~/types';
import { momentTz } from '~/utils/common';

import UsersModel from './model/users.server';
import {
  verifyManager,
  verifySuperUser,
} from './role-base-access-control.server';

// strategies will return and will store in the session
export const authenticator = new Authenticator<AuthenticatorSessionData>(
  sessionStorage,
  {
    throwOnError: true,
  },
);

async function verifyCode(code: string): Promise<AuthenticatorSessionData> {
  const user = await UsersModel.findOneAndUpdate(
    {
      'verification.expired': { $gt: momentTz().toDate() },
      'verification.code': code,
    },
    {
      $set: {
        'verification.expired': momentTz().toDate(),
      },
    },
  ).lean<Users>();

  if (!user?._id) {
    throw new Error('CODE_INCORRECT_OR_EXPIRED');
  }

  const isSuperUser = await verifySuperUser(user._id);
  const isManager = await verifyManager(user._id);

  return {
    userId: user._id,
    isSuperUser,
    isManager,
    isoCode: user.isoCode,
    cities: user.cities,
    username: user.username,
    email: user.email,
    language: user.language,
  };
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
    return user; // will be save into sessions storage
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass',
);
