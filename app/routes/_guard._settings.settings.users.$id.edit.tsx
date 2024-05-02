import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect, type OptionType } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/use-toast';
import { ThickArrowLeftIcon } from '@radix-ui/react-icons';
import { type LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME, PERMISSIONS } from '~/constants/common';
import { hocAction, hocLoader } from '~/hoc/remix';
import { getUserByUserId, updateUser } from '~/services/auth.server';
import { getCities, getUserSession } from '~/services/helpers.server';
import { type Users } from '~/types';

interface FormData {
  email: string;
  password: string;
  cities: Array<OptionType>;
  username: string;
}
interface LoaderData {
  cities: Array<string>;
  user: Users;
}

export const action = hocAction(
  async ({ request, params }, { setInformationActionHistory }) => {
    const formData = await request.formData();

    const username = formData.get('username')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const cities = JSON.parse(formData.get('cities')?.toString() || '') || [];

    await updateUser({
      username,
      email,
      cities,
      userId: params.id || '',
    });
    setInformationActionHistory({
      action: ACTION_NAME.UPDATE_USER,
    });

    return redirect('/settings/users');
  },
  PERMISSIONS.MANAGER,
);

export const loader = hocLoader(
  async ({ request, params }: LoaderFunctionArgs) => {
    const { isoCode } = await getUserSession({ headers: request.headers });

    const cities = await getCities(isoCode);
    const user = await getUserByUserId({ userId: params.id || '' });

    return json({ cities, user });
  },
  PERMISSIONS.MANAGER,
);

export default function Screen() {
  const { t } = useTranslation(['user-settings']);

  const actionData = useActionData<{
    error?: string;
  }>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  const loaderData = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const { register, control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: loaderData.user.email,
      cities: loaderData.user.cities.map(city => ({
        value: city,
        label: city,
      })),
      username: loaderData.user.username,
    },
  });

  const onSubmit = (data: FormData) => {
    const formData = new FormData();

    formData.append('email', data.email);
    formData.append('cities', JSON.stringify(data.cities.map(c => c.value)));
    formData.append('username', data.username);

    submit(formData, { method: 'post' });
  };
  const navigate = useNavigate();

  return (
    <>
      <div className="flex-row flex font-bold text-xl items-center px-0 mb-4">
        <ThickArrowLeftIcon
          onClick={() => {
            navigate(-1);
          }}
          className="cursor-pointer mr-2 h-5 w-5"
        />{' '}
        Update user
      </div>
      <Card className="p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="gap-4 pb-4 grid sm:w-2/3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                {t('USERNAME')}
              </Label>
              <Input
                {...register('username' as const, {
                  required: true,
                })}
                className="col-span-3"
                placeholder={t('USERNAME')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('EMAIL')}
              </Label>
              <Input
                {...register('email' as const, {
                  required: true,
                })}
                type="email"
                className="col-span-3"
                placeholder={t('EMAIL')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('CITIES')}</Label>
              <div className="col-span-3">
                <Controller
                  control={control}
                  name="cities"
                  render={({ field: { onChange, value } }) => (
                    <MultiSelect
                      selected={value}
                      setSelected={onChange}
                      isDisplayAllOptions
                      options={loaderData.cities.map(e => ({
                        label: e,
                        value: e,
                      }))}
                      className="w-[360px]"
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-0">
            <Button type="submit">{t('SAVE_CHANGES')}</Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
