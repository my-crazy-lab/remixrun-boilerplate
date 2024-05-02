import { PasswordInput } from '@/components/btaskee/PasswordInput';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction } from '~/hoc/remix';
import { verifyAndSendCode } from '~/services/auth.server';

interface ActionData {
  error?: string;
}

export const action = hocAction(
  async ({ request }, { setInformationActionHistory }) => {
    const formData = await request.formData();
    const { username, password } = Object.fromEntries(formData);

    const { verificationToken, userId } = await verifyAndSendCode({
      username: username.toString(),
      password: password.toString(),
    });
    setInformationActionHistory({
      action: ACTION_NAME.LOGIN,
      actorId: userId,
      ignoreFormData: true,
    });
    return redirect(`${ROUTE_NAME.VERIFICATION_CODE}/${verificationToken}`);
  },
);

export default function Screen() {
  const { t } = useTranslation(['authentication']);
  const actionData = useActionData<ActionData>();

  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  const navigation = useNavigation();

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Typography variant={'h3'}>{t('SIGN_IN')}</Typography>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('USERNAME')}</Label>
              <Input
                name="username"
                required
                placeholder={t('ENTER_USERNAME')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('PASSWORD')}</Label>
              <PasswordInput
                name="password"
                required
                placeholder={t('ENTER_PASSWORD')}
              />
            </div>
            <Link
              className="text-end mb-6 text-primary text-sm font-normal"
              to={'/reset-password'}>
              {t('FORGOT_PASSWORD')}?
            </Link>
            <Button disabled={navigation.state !== 'idle'}>
              {t('SIGN_IN')}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
