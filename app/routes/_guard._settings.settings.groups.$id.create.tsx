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
  useSubmit
} from '@remix-run/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ERROR, PERMISSIONS } from '~/constants/common';
import { hocAction, hocLoader, res403 } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  createGroup,
  getRolesOfGroups,
  isParentOfGroup,
  searchUser,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import { type ReturnValueIgnorePromise } from '~/types';

export const action = hocAction(async ({ params }, { formData }) => {
  try {
    const { name, description, userIds, roleIds } = formData;
    await createGroup({
      name,
      description,
      userIds: JSON.parse(userIds),
      roleIds: JSON.parse(roleIds),
      parent: params.id || '',
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
    const groupId = params.id || '';
    const userId = await getUserId({ request });
    const isParent = await isParentOfGroup({
      userId,
      groupId,
    });
    const userInGroup = await verifyUserInGroup({ userId, groupId });
    if (!isParent && !userInGroup) {
      throw new Response(null, res403);
    }
    const roles = await getRolesOfGroups(params.id || '');

    const url = new URL(request.url);
    const searchText = url.searchParams.get('users') || '';
    const users = await searchUser(searchText);

    return json({ roles, users });
  },
  PERMISSIONS.WRITE_GROUP,
);

export const handle = {
  breadcrumb: () => <BreadcrumbsLink to="/settings/groups" label="Create group" />,
}

interface FormData {
  name: string;
  description: string;
  userIds: Array<{ label: string; value: string }>;
  roleIds: Array<{ label: string; value: string }>;
}
export default function Screen() {
  const { t } = useTranslation();
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
      <div className='grid space-y-2 bg-secondary p-4 rounded-xl'>
        <Typography variant='h2'>Create group</Typography>
        <Breadcrumbs />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="grid items-center gap-4">
            <Label htmlFor="group_name">
              Group name
            </Label>
            <Input
              {...register('name' as const, {
                required: true,
              })}
              className="col-span-2"
              placeholder='Enter group name'
            />
          </div>
          <div className="grid items-center gap-4">
            <Label htmlFor="group_description">
              Group description
            </Label>
            <Input
              {...register('description' as const, {
                required: true,
              })}
              className="col-span-2"
              placeholder='Enter description'
            />
          </div>
          <div className="grid items-center gap-4">
            <Label htmlFor="users">Users</Label>
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
            <Label className="text-left">Roles</Label>
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
          <Button type="submit">{t('SAVE')}</Button>
        </div>
      </form>
    </>
  );
}
