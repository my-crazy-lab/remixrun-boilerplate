import ErrorMessageBase from '@/components/btaskee/MessageBase';
import { PasswordInput } from '@/components/btaskee/PasswordInput';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { redirect } from '@remix-run/node';
import {
  Link,
  useActionData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction } from '~/hoc/remix';
import { verifyAndSendCode } from '~/services/auth.server';
import type { ActionTypeWithError } from '~/types';

export const action = hocAction(
  async ({ request }, { setInformationActionHistory }) => {
    const formData = await request.clone().formData();
    const { username, password } = Object.fromEntries(formData);

    const { verificationToken, userId } = await verifyAndSendCode({
      username: username.toString(),
      password: password.toString(),
    });
    setInformationActionHistory({
      action: ACTION_NAME.LOGIN,
      dataRelated: { userId },
    });

    return redirect(`${ROUTE_NAME.VERIFICATION_CODE}/${verificationToken}`);
  },
);

export default function Screen() {
  const { t } = useTranslation('authentication');
  const submit = useSubmit();
  const actionData = useActionData<ActionTypeWithError<typeof action>>();
  useEffect(() => {
    if (actionData?.error) {
      toast({ description: actionData.error });
    }
  }, [actionData]);

  const navigation = useNavigation();
  const { handleSubmit, formState, register } = useForm<{
    username: string;
    password: string;
  }>();

  const onSubmit = (data: { username: string; password: string }) => {
    const formData = new FormData();

    formData.append('username', data.username);
    formData.append('password', data.password);

    submit(formData, { method: 'post' });
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Typography variant={'h3'}>{t('SIGN_IN')}</Typography>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">{t('USERNAME')}</Label>
              <Input
                {...register('username' as const, {
                  required: t('THIS_FIELD_IS_REQUIRED'),
                })}
                placeholder={t('ENTER_USERNAME')}
              />
              <ErrorMessageBase errors={formState.errors} name="username" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('PASSWORD')}</Label>
              <PasswordInput
                {...register('password' as const, {
                  required: t('THIS_FIELD_IS_REQUIRED'),
                })}
                placeholder={t('ENTER_PASSWORD')}
              />
              <ErrorMessageBase errors={formState.errors} name="password" />
            </div>
            <Link
              className="text-end mb-6 text-primary text-sm font-normal"
              to={'/reset-password'}>
              {t('FORGOT_PASSWORD')}?
            </Link>
            <Button disabled={navigation.state !== 'idle'}>
              {t('SIGN_IN')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
