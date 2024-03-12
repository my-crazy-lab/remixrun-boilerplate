import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Form,
  Link,
  useActionData,
  useNavigation
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useEffect } from 'react';
import { verifyAndSendCode } from '~/services/auth.server';


export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { username, password, myKey } = Object.fromEntries(formData);
    console.log(myKey, 'test');

    const verificationToken = await verifyAndSendCode({ username, password });
    return redirect(`/verification-code/${verificationToken}`);
  } catch (error: any) {
    return error;
  }
}

export default function Screen() {
  const { t } = useTranslation();

  const error = useActionData<any>();

  useEffect(() => {
    if (error?.message) {
      toast({ description: error.message });
    }
  }, [error?.message]);

  const navigation = useNavigation();

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input name="username" required placeholder="User name" />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                Password
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
            <Button
              disabled={
                navigation.formAction === '/sign-in' &&
                navigation.state !== 'idle'
              }>
              Login
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
