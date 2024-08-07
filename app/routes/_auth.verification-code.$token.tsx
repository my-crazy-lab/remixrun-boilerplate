import { LoadingSpinner } from '@/components/btaskee/LoadingSpinner';
import ErrorMessageBase from '@/components/btaskee/MessageBase';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useNavigation, useSubmit } from '@remix-run/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ROUTE_NAME from '~/constants/route';
import { isVerificationCodeExpired } from '~/services/auth.server';
import { authenticator } from '~/services/passports.server';
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

  return json(
    {},
    {
      headers: {
        'Set-Cookie': await commitSession(session), // You must commit the session whenever you read a flash
      },
    },
  );
}

export default function Screen() {
  const { t } = useTranslation('authentication');
  const navigation = useNavigation();
  const submit = useSubmit();
  const { handleSubmit, formState, register } = useForm<{
    code: string;
  }>();

  const onSubmit = (data: { code: string }) => {
    const formData = new FormData();
    formData.append('code', data.code);

    submit(formData, { method: 'post' });
  };

  return (
    <>
      <div className="flex flex-col space-y-1 text-start">
        <Typography variant="h3">{t('VERIFICATION_CODE')}</Typography>
        <Typography variant="p" affects="removePMargin">
          {t('VERIFICATION_CODE_HELPER')}
        </Typography>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">{t('VERIFICATION_CODE')}</Label>
              <Input
                {...register('code' as const, {
                  required: t('THIS_FIELD_IS_REQUIRED'),
                })}
                placeholder={t('ENTER_VERIFICATION_CODE')}
              />
              <ErrorMessageBase errors={formState.errors} name="code" />
            </div>

            <Button>
              {navigation.state !== 'idle' ? <LoadingSpinner /> : t('VERIFY')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
