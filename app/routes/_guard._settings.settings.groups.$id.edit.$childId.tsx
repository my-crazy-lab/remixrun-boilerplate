import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect, MultiSelectAsync } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/use-toast';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME, PERMISSIONS } from '~/constants/common';
import { hoc404, hocAction, hocLoader } from '~/hoc/remix';
import { getUserSession } from '~/services/helpers.server';
import {
  getGroupDetail,
  getRolesByGroupId,
  isParentOfGroup,
  searchUser,
  updateGroups,
} from '~/services/role-base-access-control.server';
import { type ReturnValueIgnorePromise } from '~/types';

export const action = hocAction(
  async ({ request, params }, { setInformationActionHistory }) => {
    const formData = await request.formData();

    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const userIds = JSON.parse(formData.get('userIds')?.toString() || '') || [];
    const roleAssignedIds =
      JSON.parse(formData.get('roleIds')?.toString() || '') || [];

    await updateGroups({
      name,
      description,
      userIds,
      roleAssignedIds,
      groupId: params.childId || '',
    });
    setInformationActionHistory({
      action: ACTION_NAME.UPDATE_GROUP,
    });

    return redirect(`/settings/groups/${params.id}`);
  },
  PERMISSIONS.WRITE_GROUP,
);

interface LoaderData {
  group: ReturnValueIgnorePromise<
    typeof getGroupDetail<{
      _id: string;
      roleAssigned: Array<{
        _id: string;
        name: string;
        description: string;
      }>;
      users: Array<{
        _id: string;
        email: string;
        username: string;
      }>;
      children: Array<{
        _id: string;
        name?: string;
        description?: string;
      }>;
      name: string;
      description: string;
      parent: string;
      hierarchy: number;
    }>
  >;
  users: ReturnValueIgnorePromise<typeof searchUser>;
  roles: ReturnValueIgnorePromise<typeof getRolesByGroupId>;
}

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const groupId = params.id || '';
    const childId = params.childId || '';

    const roles = await getRolesByGroupId(groupId);

    const url = new URL(request.url);
    const searchText = url.searchParams.get('users') || '';
    const users = await searchUser(searchText);
    const { userId, isSuperUser } = await getUserSession({
      headers: request.headers,
    });

    const isParent = await isParentOfGroup({
      userId,
      groupId: childId,
    });

    const group = await hoc404(async () =>
      getGroupDetail<LoaderData['group']>({
        projection: {
          roleAssigned: 1,
          users: 1,
          children: 1,
          parent: 1,
          hierarchy: 1,
          name: 1,
          description: 1,
          parents: 1,
        },
        userId,
        groupId: childId,
        isParent,
        isSuperUser,
      }),
    );

    return json({ group, roles, users });
  },
  PERMISSIONS.WRITE_GROUP,
);

interface FormData {
  name: string;
  description: string;
  userIds: Array<{
    value: string;
    label: string;
  }>;
  roleIds: Array<{
    value: string;
    label: string;
  }>;
}

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink to="/settings/groups" label="EDIT_GROUP" />
  ),
};

export default function Screen() {
  const { t } = useTranslation(['user-settings']);

  const actionData = useActionData<{
    error?: string;
  }>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  const { group, roles, users } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  const { register, control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: group.name,
      description: group.description,
      userIds: group.users?.map(user => ({
        value: user._id,
        label: user.username,
      })),
      roleIds: group.roleAssigned?.map(role => ({
        value: role._id,
        label: role.name,
      })),
    },
  });

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
      <div className="grid space-y-2 bg-secondary rounded-xl p-4">
        <Typography variant="h3">{t('EDIT_GROUP')}</Typography>
        <Breadcrumbs />
      </div>
      <form className="gap-4 grid p-0" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 py-4 grid-cols-2">
          <div className="grid items-center gap-4">
            <Label htmlFor="group" className="text-left">
              {t('GROUP_NAME')}
            </Label>
            <Input
              {...register('name' as const, {
                required: true,
              })}
              placeholder={t('ENTER_GROUP_NAME')}
            />
          </div>

          <div className="grid items-center gap-4">
            <Label htmlFor="description">{t('DESCRIPTION')}</Label>
            <Input
              {...register('description' as const, {
                required: true,
              })}
              placeholder={t('ENTER_DESCRIPTION')}
            />
          </div>

          <div className="grid items-center gap-4">
            <Label>{t('USERS')}</Label>
            <Controller
              control={control}
              name="userIds"
              render={({ field: { onChange, value } }) => (
                <MultiSelectAsync
                  isLoading={navigation.state === 'loading'}
                  defaultSearchValue={searchParams.get('users') || ''}
                  searchRemix={{ searchKey: 'users', setSearchParams }}
                  isDisplayAllOptions
                  options={users.map(user => ({
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
          <div className="grid items-center gap-4">
            <Label>{t('ROLES')}</Label>
            <Controller
              control={control}
              name="roleIds"
              render={({ field: { onChange, value } }) => (
                <MultiSelect
                  isDisplayAllOptions
                  options={roles.map(role => ({
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
        <div className="flex justify-end">
          <Button type="submit">{t('SAVE_CHANGES')}</Button>
        </div>
      </form>
    </>
  );
}
