import { Grid } from '@/components/btaskee/Grid';
import { LoadingSpinner } from '@/components/btaskee/LoadingSpinner';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { json } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hocAction } from '~/hoc/remix';
import { resetPassword } from '~/services/auth.server';
import { type ActionTypeWithError } from '~/types';

interface FormValidation {
  email: string;
}

export const action = hocAction(async ({ request }) => {
  const formData = await request.formData();
  const { email } = Object.fromEntries(formData);
  const errors: Partial<FormValidation> = {};

  if (!email.toString().includes('@')) {
    errors.email = 'Invalid email address';
  }
  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  if (email && typeof email === 'string') {
    await resetPassword(email);
    return json({ isSent: true });
  } else {
    throw new Error('Email incorrect');
  }
});

export async function loader() {
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
          <Grid>
            <Form method="post">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label>{t('EMAIL')}</Label>
                  <Input name="email" placeholder="name@btaskee.com" />
                  {actionData?.errors?.email ? (
                    <Typography
                      className="text-red text-sm"
                      variant="p"
                      affects="removePMargin">
                      {actionData?.errors.email}
                    </Typography>
                  ) : null}
                </div>
                <Button>
                  {state !== 'idle' ? <LoadingSpinner /> : t('SEND')}
                </Button>
              </div>
            </Form>
            <Link to="/sign-in">
              <Button className="w-full" variant="outline">
                {t('BACK_TO_SIGN_IN')}
              </Button>
            </Link>
          </Grid>
        )}
      </div>
    </>
  );
}
