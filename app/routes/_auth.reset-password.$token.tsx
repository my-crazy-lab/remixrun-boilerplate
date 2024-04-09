import { PasswordInput } from '@/components/btaskee/PasswordInput';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ERROR } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { changePassword, isResetPassExpired } from '~/services/auth.server';

interface ActionData {
  error?: string;
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { newPassword, reEnterPassword } = Object.fromEntries(formData);

    // client validation
    if (
      typeof newPassword !== 'string' ||
      typeof reEnterPassword !== 'string'
    ) {
      throw new Error(ERROR.UNKNOWN_ERROR);
    }
    if (newPassword !== reEnterPassword) {
      throw new Error(ERROR.PASSWORD_NOT_MATCH);
    }

    await changePassword({ newPassword, token: params.token || '' });
    return redirect(ROUTE_NAME.SIGN_IN);
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message });
    }
    return json({ error: ERROR.UNKNOWN_ERROR });
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const isExpired = await isResetPassExpired({ token: params.token || '' });
  if (isExpired) return redirect(ROUTE_NAME.RESET_PASSWORD);

  return null;
}

export default function Screen() {
  const { t } = useTranslation(['authentication']);
  const { state } = useNavigation();

  const actionData = useActionData<ActionData>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  return (
    <>
      <div className="flex flex-col space-y-1 text-start">
        <Typography variant={'h3'}>{t('CREATE_NEW_PASSWORD')}</Typography>
        <Typography variant='p' affects='removePMargin'>
          Your new password must be different from previous used password.
        </Typography>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t('NEW_PASSWORD')}</Label>
              <PasswordInput
                required
                name="newPassword"
                placeholder={t('NEW_PASSWORD')}
              />
            </div>
            <div className="grid gap-1">
              <Label>{t('CONFIRM_PASSWORD')}</Label>
              <PasswordInput
                required
                name="reEnterPassword"
                placeholder={t('CONFIRM_PASSWORD')}
              />
            </div>
            <Button>{state !== 'idle' ? t('LOADING') : t('RESET_PASSWORD')}</Button>
          </div>
        </Form>
      </div>
    </>
  );
}
