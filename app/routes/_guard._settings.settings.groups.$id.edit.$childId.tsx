import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import ErrorMessageBase from '@/components/btaskee/MessageBase';
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
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME, PERMISSIONS } from '~/constants/common';
import { hoc404, hocAction, hocLoader } from '~/hoc/remix';
import { useConfirm } from '~/hooks/useConfirmation';
import { getUserSession } from '~/services/helpers.server';
import {
  getGroupDetail,
  getRolesByGroupId,
  isParentOfGroup,
  searchUser,
  updateGroups,
} from '~/services/role-base-access-control.server';
import { commitSession, getSession } from '~/services/session.server';
import type {
  ActionTypeWithError,
  Groups,
  LoaderTypeWithError,
  Roles,
  Users,
} from '~/types';

export const action = hocAction(
  async ({ request, params }, { setInformationActionHistory }) => {
    const formData = await request.clone().formData();

    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const userIds = JSON.parse(formData.get('userIds')?.toString() || '') || [];
    const roleAssignedIds =
      JSON.parse(formData.get('roleIds')?.toString() || '') || [];

    const group = await updateGroups({
      name,
      description,
      userIds,
      roleAssignedIds,
      groupId: params.childId || '',
    });
    setInformationActionHistory({
      action: ACTION_NAME.UPDATE_GROUP,
    });

    const session = await getSession(request.headers.get('cookie'));
    session.flash('flashMessage', `Group ${group?.name} updated`);

    const newSession = await commitSession(session);

    return redirect(`/settings/groups/${params.id}`, {
      headers: {
        'Set-Cookie': newSession,
      },
    });
  },
  PERMISSIONS.WRITE_GROUP,
);

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
      parentId: userId,
      groupId: childId,
    });

    const group = await hoc404(async () =>
      getGroupDetail<
        Pick<Groups, 'name' | 'description'> & {
          users: Users[];
          roleAssigned: Roles[];
        }
      >({
        projection: {
          name: 1,
          description: 1,
          roleAssigned: 1,
          users: 1,
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
  i18n: 'user-settings',
};

export default function Screen() {
  const { t } = useTranslation('user-settings');

  const { group, roles, users } =
    useLoaderData<LoaderTypeWithError<typeof loader>>();

  const actionData = useActionData<ActionTypeWithError<typeof action>>();
  useEffect(() => {
    if (actionData?.error) {
      toast({ description: actionData.error });
    }
  }, [actionData]);

  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const confirm = useConfirm();

  const { register, control, handleSubmit, formState } = useForm<FormData>({
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

  async function onSubmit(data: FormData) {
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

    const isConfirm = await confirm({
      title: t('CREATE'),
      body: t('ARE_YOU_SURE_CREATE_NEW_RECORD'),
    });

    if (isConfirm) submit(formData, { method: 'post' });
  }

  return (
    <>
      <div className="grid space-y-2 bg-secondary rounded-xl p-4">
        <Typography variant="h3">{t('EDIT_GROUP')}</Typography>
        <Breadcrumbs />
      </div>
      <form className="gap-4 grid p-0" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 py-4 grid-cols-2">
          <div className="grid items-center gap-2">
            <Label htmlFor="group" className="text-left">
              {t('GROUP_NAME')}
            </Label>
            <Input
              {...register('name' as const, {
                required: t('THIS_FIELD_IS_REQUIRED'),
              })}
              placeholder={t('ENTER_GROUP_NAME')}
            />
            <ErrorMessageBase errors={formState.errors} name="name" />
          </div>

          <div className="grid items-center gap-2">
            <Label htmlFor="description">{t('DESCRIPTION')}</Label>
            <Input
              {...register('description' as const, {
                required: t('THIS_FIELD_IS_REQUIRED'),
              })}
              placeholder={t('ENTER_DESCRIPTION')}
            />
            <ErrorMessageBase errors={formState.errors} name="description" />
          </div>

          <div className="grid items-center gap-2">
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
          <div className="grid items-center gap-2">
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
