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
import { ERROR, PERMISSIONS } from '~/constants/common';
import { hoc404, hocAction, hocLoader, res403GroupParent } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  getGroupDetail,
  getRolesOfGroups,
  isParentOfGroup,
  searchUser,
  updateGroups,
} from '~/services/role-base-access-control.server';
import { type ReturnValueIgnorePromise } from '~/types';

export const action = hocAction(async ({ params }, { formData }) => {
  try {
    const { name, description, userIds, roleIds } = formData;
    await updateGroups({
      name,
      description,
      userIds: JSON.parse(userIds),
      roleIds: JSON.parse(roleIds),
      groupId: params.id || '',
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
  group: ReturnValueIgnorePromise<
    typeof getGroupDetail<{
      _id: string;
      roles: Array<{
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
  roles: ReturnValueIgnorePromise<typeof getRolesOfGroups>;
}

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const groupId = params.id || '';
    const childId = params.childId || '';

    const roles = await getRolesOfGroups(groupId);

    const url = new URL(request.url);
    const searchText = url.searchParams.get('users') || '';
    const users = await searchUser(searchText);
    const userId = await getUserId({ request });

    const isParent = await isParentOfGroup({
      userId,
      groupId: childId,
    });
    // just parent can modify their children groups
    if (!isParent) {
      throw new Response(null, res403GroupParent);
    }

    const group = await hoc404(async () =>
      getGroupDetail<LoaderData['group']>({
        projection: {
          roles: 1,
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
  breadcrumb: () => <BreadcrumbsLink to="/settings/groups" label="Edit group" />,
}

export default function Screen() {
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
      roleIds: group.roles?.map(role => ({
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
        <Typography variant='h3'>Edit group</Typography>
        <Breadcrumbs />
      </div>
      <form className="gap-4 pb-4 grid p-0" onSubmit={handleSubmit(onSubmit)}>

        <div className="grid gap-4 py-4 grid-cols-2">
          <div className="grid items-center gap-4">
            <Label htmlFor="group" className="text-left">
              Group name
            </Label>
            <Input
              {...register('name' as const, {
                required: true,
              })}
            />
          </div>

          <div className="grid items-center gap-4">
            <Label htmlFor="description">
              Description
            </Label>
            <Input
              {...register('description' as const, {
                required: true,
              })}
            />
          </div>

          <div className="grid items-center gap-4">
            <Label>Users</Label>
            <Controller
              control={control}
              name="userIds"
              render={({ field: { onChange, value } }) => (
                <MultiSelectAsync
                  isLoading={navigation.state === 'loading'}
                  defaultSearchValue={searchParams.get('users') || ''}
                  searchRemix={{ searchKey: 'users', setSearchParams }}
                  isDisplayAllOptions
                  options={users.map((user: any) => ({
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
            <Label>Roles</Label>
            <Controller
              control={control}
              name="roleIds"
              render={({ field: { onChange, value } }) => (
                <MultiSelect
                  isDisplayAllOptions
                  options={roles.map((role: any) => ({
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
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </>
  );
}
