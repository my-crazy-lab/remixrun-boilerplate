import { Grid } from '@/components/btaskee/Grid';
import { LoadingSpinner } from '@/components/btaskee/LoadingSpinner';
import ErrorMessageBase from '@/components/btaskee/MessageBase';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { json } from '@remix-run/node';
import {
  Link,
  useActionData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { hocAction } from '~/hoc/remix';
import { resetPassword } from '~/services/auth.server';
import { type ActionTypeWithError } from '~/types';

export const action = hocAction(async ({ request }) => {
  const formData = await request.clone().formData();
  const email = formData.get('email')?.toString() || '';

  await resetPassword(email);

  return json({ isSent: true });
});

export async function loader() {
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

  const { handleSubmit, formState, register } = useForm<{ email: string }>();

  const onSubmit = (data: { email: string }) => {
    const formData = new FormData();

    formData.append('email', data.email);

    submit(formData, { method: 'post' });
  };

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
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label>{t('EMAIL')}</Label>
                  <Input
                    {...register('email' as const, {
                      required: t('THIS_FIELD_IS_REQUIRED'),
                    })}
                    placeholder="name@btaskee.com"
                  />
                  <ErrorMessageBase name="email" errors={formState.errors} />
                </div>
                <Button>
                  {state !== 'idle' ? <LoadingSpinner /> : t('SEND')}
                </Button>
              </div>
            </form>
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
