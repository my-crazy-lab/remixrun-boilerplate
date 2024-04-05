import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { verifyAndSendCode } from '~/services/auth.server';
import { ERROR } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';

interface ActionData {
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { username, password } = Object.fromEntries(formData);

    const verificationToken = await verifyAndSendCode({
      username: username.toString(),
      password: password.toString(),
    });
    return redirect(`${ROUTE_NAME.VERIFICATION_CODE}/${verificationToken}`);
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message });
    }
    return json({ error: ERROR.UNKNOWN_ERROR });
  }
}

export default function Screen() {
  const { t } = useTranslation();
  const actionData = useActionData<ActionData>();

  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  const navigation = useNavigation();

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('LOGIN')}</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                {t('EMAIL')}
              </Label>
              <Input name="username" required placeholder="User name" />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                {t('PASSWORD')}
              </Label>
              <Input
                required
                name="password"
                type="password"
                placeholder="Password"
              />
            </div>
            <Link
              className="text-end underline italic mb-8"
              to={'/reset-password'}>
              Forgot password?
            </Link>
            <Button disabled={navigation.state !== 'idle'}>Login</Button>
          </div>
        </Form>
      </div>
    </>
  );
}
