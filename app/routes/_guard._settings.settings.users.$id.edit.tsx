import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import { Grid } from '@/components/btaskee/Grid';
import { GridItem } from '@/components/btaskee/GridItem';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/use-toast';
import { type LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME, PERMISSIONS } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction, hocLoader } from '~/hoc/remix';
import { getUserByUserId, updateUser } from '~/services/auth.server';
import { getCities, getUserSession } from '~/services/helpers.server';
import { type OptionType, type Users } from '~/types';

export const handle = {
  breadcrumb: (data: { user: Users }) => {
    const { user } = data;

    return (
      <BreadcrumbsLink
        to={`${ROUTE_NAME.USER_SETTING}/${user._id}/edit`}
        label="UPDATE_USER"
      />
    );
  },
};
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
    const formData = await request.clone().formData();

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

    // TODO add toast and redirect
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
      cities: loaderData.user.cities?.map(city => ({
        value: city,
        label: city,
      })),
      username: loaderData.user.username,
    },
  });

  const onSubmit = (data: FormData) => {
    const formData = new FormData();

    formData.append('email', data.email);
    formData.append('cities', JSON.stringify(data.cities?.map(c => c.value)));
    formData.append('username', data.username);

    submit(formData, { method: 'post' });
  };

  return (
    <>
      <div className="flex flex-col p-4 rounded-lg bg-secondary">
        <Typography variant="h3">{t('UPDATE_USER')}</Typography>
        <Breadcrumbs />
      </div>

      <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
        <Grid className="gap-4">
          <GridItem>
            <Label htmlFor="username">{t('USERNAME')}</Label>
            <Input
              {...register('username' as const, {
                required: true,
              })}
              className="col-span-3"
              placeholder={t('USERNAME')}
            />
          </GridItem>
          <GridItem>
            <Label htmlFor="email">{t('EMAIL')}</Label>
            <Input
              {...register('email' as const, {
                required: true,
              })}
              type="email"
              className="col-span-3"
              placeholder={t('EMAIL')}
            />
          </GridItem>
          <GridItem>
            <Label>{t('CITIES')}</Label>
            <div className="col-span-3">
              <Controller
                control={control}
                name="cities"
                render={({ field: { onChange, value } }) => (
                  <MultiSelect
                    selected={value}
                    setSelected={onChange}
                    isDisplayAllOptions
                    options={loaderData.cities?.map(e => ({
                      label: e,
                      value: e,
                    }))}
                    className="w-[360px]"
                  />
                )}
              />
            </div>
          </GridItem>
        </Grid>
        <div className="justify-end flex mt-6">
          <Button type="submit">{t('SAVE_CHANGES')}</Button>
        </div>
      </form>
    </>
  );
}
