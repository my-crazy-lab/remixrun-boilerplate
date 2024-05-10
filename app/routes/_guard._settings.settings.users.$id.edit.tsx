import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import { Grid } from '@/components/btaskee/Grid';
import { GridItem } from '@/components/btaskee/GridItem';
import ErrorMessageBase from '@/components/btaskee/MessageBase';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/use-toast';
import { type LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME, PERMISSIONS } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hoc404, hocAction, hocLoader } from '~/hoc/remix';
import { useConfirm } from '~/hooks/useConfirmation';
import { getUserByUserId, updateUser } from '~/services/auth.server';
import { getCities, getUserSession } from '~/services/helpers.server';
import { commitSession, getSession } from '~/services/session.server';
import type {
  ActionTypeWithError,
  LoaderTypeWithError,
  OptionType,
  Users,
} from '~/types';

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
  i18n: 'user-settings',
};
interface FormData {
  email: string;
  password: string;
  cities: Array<OptionType>;
  username: string;
}

export const action = hocAction(
  async ({ request, params }, { setInformationActionHistory }) => {
    const formData = await request.clone().formData();

    const username = formData.get('username')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const cities = JSON.parse(formData.get('cities')?.toString() || '') || [];

    // const user = await updateUser({
    //   username,
    //   email,
    //   cities,
    //   userId: params.id || '',
    // });

    // const session = await getSession(request.headers.get('cookie'));

    const [user, session] = await Promise.all([
      updateUser({
        username,
        email,
        cities,
        userId: params.id || '',
      }),
      getSession(request.headers.get('cookie')),
    ]);

    session.flash('flashMessage', `User ${user?.username} updated`);

    setInformationActionHistory({
      action: ACTION_NAME.UPDATE_USER,
    });

    return redirect('/settings/users', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  },
  PERMISSIONS.MANAGER,
);

export const loader = hocLoader(
  async ({ request, params }: LoaderFunctionArgs) => {
    const { isoCode } = await getUserSession({ headers: request.headers });

    const [cities, user] = await Promise.all([
      getCities(isoCode),
      hoc404(() => getUserByUserId({ userId: params.id || '' })),
    ]);

    if (!user || !user?.email) {
      throw new Error('USER_NOT_FOUND');
    }

    return json({ cities, user });
  },
  PERMISSIONS.MANAGER,
);

export default function Screen() {
  const { t } = useTranslation('user-settings');
  const confirm = useConfirm();

  const actionData = useActionData<ActionTypeWithError<typeof action>>();
  useEffect(() => {
    if (actionData?.error) {
      toast({ description: actionData.error });
    }
  }, [actionData]);

  const loaderData = useLoaderData<LoaderTypeWithError<typeof loader>>();

  const submit = useSubmit();
  const { register, control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      email: loaderData?.user?.email,
      cities: loaderData?.user?.cities?.map(city => ({
        value: city,
        label: city,
      })),
      username: loaderData?.user?.username,
    },
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();

    formData.append('email', data.email);
    formData.append('cities', JSON.stringify(data.cities?.map(c => c.value)));
    formData.append('username', data.username);

    const isConfirm = await confirm({
      title: t('EDIT'),
      body: t('ARE_YOU_SURE_EDIT_THIS_RECORD'),
    });

    if (isConfirm) submit(formData, { method: 'post' });
  }

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
                required: t('THIS_FIELD_IS_REQUIRED'),
              })}
              className="col-span-3"
              placeholder={t('USERNAME')}
            />
            <ErrorMessageBase errors={formState.errors} name="username" />
          </GridItem>
          <GridItem>
            <Label htmlFor="email">{t('EMAIL')}</Label>
            <Input
              {...register('email' as const, {
                required: t('THIS_FIELD_IS_REQUIRED'),
              })}
              type="email"
              className="col-span-3"
              placeholder={t('EMAIL')}
            />
            <ErrorMessageBase errors={formState.errors} name="email" />
          </GridItem>
          <GridItem>
            <Label>{t('CITIES')}</Label>
            <div className="col-span-3">
              <Controller
                control={control}
                name="cities"
                rules={{ required: t('THIS_FIELD_IS_REQUIRED') }}
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
              <ErrorMessageBase errors={formState.errors} name="cities" />
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
