import { LoadingSpinner } from '@/components/btaskee/LoadingSpinner';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useNavigation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import ROUTE_NAME from '~/constants/route';
import {
  authenticator,
  isVerificationCodeExpired,
} from '~/services/auth.server';
import { commitSession, getSession } from '~/services/session.server';

export async function action({ request, params }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/',
    failureRedirect: `${ROUTE_NAME.VERIFICATION_CODE}/${params.token}`,
    throwOnError: true,
  });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const isExpired = await isVerificationCodeExpired({
    token: params.token || '',
  });
  if (isExpired) return redirect(ROUTE_NAME.SIGN_IN);

  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
  const session = await getSession(request.headers.get('cookie'));
  const error = session.get(authenticator.sessionErrorKey);

  return json(
    { error },
    {
      headers: {
        'Set-Cookie': await commitSession(session), // You must commit the session whenever you read a flash
      },
    },
  );
}

export default function Screen() {
  const { t } = useTranslation(['authentication']);
  const navigation = useNavigation();

  return (
    <>
      <div className="flex flex-col space-y-1 text-start">
        <Typography variant="h3">{t('VERIFICATION_CODE')}</Typography>
        <Typography variant="p" affects="removePMargin">
          Open your gmail and verify your code.
        </Typography>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">{t('VERIFICATION_CODE')}</Label>
              <Input
                name="code"
                required
                placeholder={t('ENTER_VERIFICATION_CODE')}
              />
            </div>
            <Button>{navigation.state !== 'idle' ? <LoadingSpinner /> : t('VERIFY')}</Button>
          </div>
        </Form>
      </div>
    </>
  );
}
