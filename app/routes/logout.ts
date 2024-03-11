import { ActionFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticator.logout(request, { redirectTo: '/sign-in' });
};
