import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { t } = useTranslation();
  const { state } = useNavigation();

  const actionData = useActionData<ActionData>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('RESET_PASSWORD')}
        </h1>
        <p className="text-sm text-muted-foreground">
          You are a step away from accessing your account!
        </p>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only">New Password</Label>
              <Input
                required
                type="password"
                name="newPassword"
                placeholder="New Password"
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only">Re-enter New Password</Label>
              <Input
                required
                type="password"
                name="reEnterPassword"
                placeholder="Re-enter New Password"
              />
            </div>
            <Button>{state !== 'idle' ? t('LOADING') : t('RESET')}</Button>
          </div>
        </Form>
      </div>
    </>
  );
}
