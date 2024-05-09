import ErrorMessageBase from '@/components/btaskee/MessageBase';
import { PasswordInput } from '@/components/btaskee/PasswordInput';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ERROR } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction } from '~/hoc/remix';
import { changePassword, isResetPassExpired } from '~/services/auth.server';
import { type ActionTypeWithError } from '~/types';

export const action = hocAction(async ({ request, params }) => {
  const formData = await request.clone().formData();
  const newPassword = formData.get('newPassword')?.toString() || '';
  const reEnterPassword = formData.get('reEnterPassword')?.toString() || '';

  if (typeof newPassword !== 'string' || typeof reEnterPassword !== 'string') {
    throw new Error(ERROR.UNKNOWN_ERROR);
  }
  if (newPassword !== reEnterPassword) {
    throw new Error(ERROR.PASSWORD_NOT_MATCH);
  }

  await changePassword({
    newPassword,
    token: params.token || '',
  });

  return redirect(ROUTE_NAME.SIGN_IN);
});

export async function loader({ params }: LoaderFunctionArgs) {
  const isExpired = await isResetPassExpired({ token: params.token || '' });
  if (isExpired) return redirect(ROUTE_NAME.RESET_PASSWORD);

  return null;
}

export default function Screen() {
  const { t } = useTranslation('authentication');
  const { state } = useNavigation();
  const submit = useSubmit();

  const actionData = useActionData<ActionTypeWithError<typeof action>>();
  useEffect(() => {
    if (actionData?.error) {
      toast({ description: actionData.error });
    }
  }, [actionData]);

  const { handleSubmit, formState, register } = useForm<{
    newPassword: string;
    reEnterPassword: string;
  }>();

  const onSubmit = (data: { newPassword: string; reEnterPassword: string }) => {
    const formData = new FormData();

    formData.append('newPassword', data.newPassword);
    formData.append('reEnterPassword', data.reEnterPassword);

    submit(formData, { method: 'post' });
  };

  return (
    <>
      <div className="flex flex-col space-y-1 text-start">
        <Typography variant={'h3'}>{t('CREATE_NEW_PASSWORD')}</Typography>
        <Typography variant="p" affects="removePMargin">
          {t('CREATE_NEW_PASS_TEXT_HELPER')}
        </Typography>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t('NEW_PASSWORD')}</Label>
              <PasswordInput
                {...register('newPassword' as const, {
                  required: t('THIS_FIELD_IS_REQUIRED'),
                })}
                placeholder={t('NEW_PASSWORD')}
              />
              <ErrorMessageBase errors={formState.errors} name="newPassword" />
            </div>
            <div className="grid gap-1">
              <Label>{t('CONFIRM_PASSWORD')}</Label>
              <PasswordInput
                {...register('reEnterPassword' as const, {
                  required: t('THIS_FIELD_IS_REQUIRED'),
                })}
                placeholder={t('CONFIRM_PASSWORD')}
              />
              <ErrorMessageBase
                errors={formState.errors}
                name="reEnterPassword"
              />
            </div>
            <Button>
              {state !== 'idle' ? t('LOADING') : t('RESET_PASSWORD')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
