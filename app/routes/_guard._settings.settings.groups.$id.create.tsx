import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect, MultiSelectAsync } from '@/components/ui/multi-select';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ERROR, PERMISSIONS } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction, hocLoader } from '~/hoc/remix';
import {
  createGroup,
  getRolesOfGroups,
  searchUser,
} from '~/services/role-base-access-control.server';
import { type ReturnValueIgnorePromise } from '~/types';

export const action = hocAction(async ({ params }, { formData }) => {
  try {
    if (!params.id) {
      return json({ error: ERROR.UNKNOWN_ERROR });
    }
    const { name, description, userIds, roleIds } = formData;
    await createGroup({
      name,
      description,
      userIds: JSON.parse(userIds),
      roleAssignedIds: JSON.parse(roleIds),
      parent: params.id,
    });

    return redirect(`/settings/groups/${params.id}`);
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message });
    }
    return json({ error: ERROR.UNKNOWN_ERROR });
  }
}, PERMISSIONS.WRITE_GROUP);

interface LoaderData {
  roles: ReturnValueIgnorePromise<typeof getRolesOfGroups>;
  users: ReturnValueIgnorePromise<typeof searchUser>;
}

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const roles = await getRolesOfGroups(params.id || '');

    const url = new URL(request.url);
    const searchText = url.searchParams.get('users') || '';
    const users = await searchUser(searchText);

    return json({ roles, users });
  },
  PERMISSIONS.WRITE_GROUP,
);

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink to={ROUTE_NAME.GROUP_SETTING} label="CREATE_GROUP" />
  ),
};

interface FormData {
  name: string;
  description: string;
  userIds: Array<{ label: string; value: string }>;
  roleIds: Array<{ label: string; value: string }>;
}

export default function Screen() {
  const { t } = useTranslation(['user-settings']);
  const navigation = useNavigation();

  const loaderData = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { register, control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      userIds: [],
      roleIds: [],
    },
  });
  const submit = useSubmit();

  const onSubmit = (data: FormData) => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append(
      'userIds',
      JSON.stringify(data.userIds.map(user => user.value)),
    );
    formData.append(
      'roleIds',
      JSON.stringify(data.roleIds.map(role => role.value)),
    );

    submit(formData, { method: 'post' });
  };

  return (
    <>
      <div className="grid space-y-2 bg-secondary p-4 rounded-xl">
        <Typography variant="h3">{t('CREATE_GROUP')}</Typography>
        <Breadcrumbs />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="grid items-center gap-4">
            <Label htmlFor="group_name">{t('GROUP_NAME')}</Label>
            <Input
              {...register('name' as const, {
                required: true,
              })}
              className="col-span-2"
              placeholder={t('ENTER_GROUP_NAME')}
            />
          </div>
          <div className="grid items-center gap-4">
            <Label htmlFor="group_description">{t('GROUP_DESCRIPTION')}</Label>
            <Input
              {...register('description' as const, {
                required: true,
              })}
              className="col-span-2"
              placeholder={t('ENTER_DESCRIPTION')}
            />
          </div>
          <div className="grid items-center gap-4">
            <Label htmlFor="users">{t('USERS')}</Label>
            <div className="col-span-2">
              <Controller
                control={control}
                name="userIds"
                render={({ field: { onChange, value } }) => (
                  <MultiSelectAsync
                    isLoading={navigation.state === 'loading'}
                    defaultSearchValue={searchParams.get('users') || ''}
                    searchRemix={{ searchKey: 'users', setSearchParams }}
                    isDisplayAllOptions
                    options={loaderData.users.map(user => ({
                      value: user._id,
                      label: user.username,
                    }))}
                    selected={value}
                    setSelected={onChange}
                    className="w-[360px]"
                  />
                )}
              />
            </div>
          </div>
          <div className="grid items-center gap-4">
            <Label className="text-left">{t('ROLES')}</Label>
            <div className="col-span-2">
              <Controller
                control={control}
                name="roleIds"
                render={({ field: { onChange, value } }) => (
                  <MultiSelect
                    isDisplayAllOptions
                    options={loaderData.roles.map(role => ({
                      value: role._id,
                      label: role.name,
                    }))}
                    selected={value}
                    setSelected={onChange}
                    className="w-[360px]"
                  />
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">{t('SAVE_CHANGES')}</Button>
        </div>
      </form>
    </>
  );
}
