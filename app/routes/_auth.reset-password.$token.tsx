import { PasswordInput } from '@/components/btaskee/PasswordInput';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ERROR } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction } from '~/hoc/remix';
import { changePassword, isResetPassExpired } from '~/services/auth.server';
import { type ActionTypeWithError } from '~/types';

interface FormValidation {
  newPassword: string;
  reEnterPassword: string;
}

export const action = hocAction(async ({ request, params }) => {
  const formData = await request.formData();
  const { newPassword, reEnterPassword } = Object.fromEntries(formData);
  const errors: Partial<FormValidation> = {};

  if (!newPassword) {
    errors.newPassword = 'Invalid new password';
  }

  if (!reEnterPassword) {
    errors.reEnterPassword = 'Invalid re-enter password';
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

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

  const actionData = useActionData<ActionTypeWithError<typeof action>>();
  useEffect(() => {
    if (actionData?.error) {
      toast({ description: actionData.error });
    }
  }, [actionData]);

  return (
    <>
      <div className="flex flex-col space-y-1 text-start">
        <Typography variant={'h3'}>{t('CREATE_NEW_PASSWORD')}</Typography>
        <Typography variant="p" affects="removePMargin">
          {t('CREATE_NEW_PASS_TEXT_HELPER')}
        </Typography>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t('NEW_PASSWORD')}</Label>
              <PasswordInput
                name="newPassword"
                placeholder={t('NEW_PASSWORD')}
              />
              {actionData?.errors?.newPassword ? (
                <Typography
                  className="text-red text-sm"
                  variant="p"
                  affects="removePMargin">
                  {actionData?.errors.newPassword}
                </Typography>
              ) : null}
            </div>
            <div className="grid gap-1">
              <Label>{t('CONFIRM_PASSWORD')}</Label>
              <PasswordInput
                name="reEnterPassword"
                placeholder={t('CONFIRM_PASSWORD')}
              />
              {actionData?.errors?.reEnterPassword ? (
                <Typography
                  className="text-red text-sm"
                  variant="p"
                  affects="removePMargin">
                  {actionData?.errors.reEnterPassword}
                </Typography>
              ) : null}
            </div>
            <Button>
              {state !== 'idle' ? t('LOADING') : t('RESET_PASSWORD')}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
