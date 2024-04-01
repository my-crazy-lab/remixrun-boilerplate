import { Button } from '@/components/ui/button';
import { useActionData, Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';
import { type ActionFunctionArgs } from '@remix-run/node';
import { resetPassword } from '~/services/auth.server';
import { json } from '@remix-run/node';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ERROR } from '~/constants/common';

interface ActionData {
  isSent?: boolean;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { email } = Object.fromEntries(formData);

    if (email && typeof email === 'string') {
      await resetPassword(email);
    } else {
      throw new Error('Email incorrect');
    }

    return json({ isSent: true });
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message });
    }
    return json({ error: ERROR.UNKNOWN_ERROR });
  }
}

export async function loader() {
  return null;
}

export default function Screen() {
  const { t } = useTranslation('common');

  const actionData = useActionData<ActionData>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('SEND_EMAIL')}
        </h1>
        <p className="text-sm text-muted-foreground">
          No worries, we will send you reset instructions.
        </p>
      </div>
      <div className="grid gap-6">
        {actionData?.isSent ? (
          'Check your mail'
        ) : (
          <Form method="post">
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only">{t('EMAIL')}</Label>
                <Input
                  required
                  name="email"
                  type="email"
                  placeholder="name@btaskee.com"
                />
              </div>
              <Button>{t('SEND')}</Button>
            </div>
          </Form>
        )}
      </div>
    </>
  );
}
