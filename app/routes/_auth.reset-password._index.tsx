import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ERROR } from '~/constants/common';
import { resetPassword } from '~/services/auth.server';

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
  const { t } = useTranslation(['authentication']);
  const { state } = useNavigation();

  const actionData = useActionData<ActionData>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-start">
        <Typography variant="h3">{t('FORGOT_PASSWORD')}</Typography>
        <Typography variant="p" affects="removePMargin">
          {t('FORGOT_PASSWORD_TEXT_HELPER')}
        </Typography>
      </div>
      <div className="grid gap-6">
        {actionData?.isSent ? (
          t('CHECK_YOUR_EMAIL')
        ) : (
          <Form method="post">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label>{t('EMAIL')}</Label>
                <Input
                  required
                  name="email"
                  type="email"
                  placeholder="name@btaskee.com"
                />
              </div>
              <>
                <Button>{state !== 'idle' ? t('LOADING') : t('SEND')}</Button>
                <Button variant="outline">{t('BACK_TO_SIGN_IN')}</Button>
              </>
            </div>
          </Form>
        )}
      </div>
    </>
  );
}
