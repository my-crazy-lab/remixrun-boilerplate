import { type ActionFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/services/passports.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticator.logout(request, { redirectTo: '/sign-in' });
};
