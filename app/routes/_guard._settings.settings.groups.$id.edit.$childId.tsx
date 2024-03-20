import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect, MultiSelectAsync } from '@/components/ui/multi-select';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { MoveLeft } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { PERMISSIONS } from '~/constants/common';
import { hoc404, hocAction, hocLoader, res403GroupParent } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  getGroupDetail,
  getRolesOfGroups,
  isParentOfGroup,
  searchUser,
  updateGroups,
} from '~/services/role-base-access-control.server';

export const action = hocAction(async ({ params }, { formData }) => {
  try {
    const { name, description, userIds, roleIds } = formData;
    await updateGroups({
      name,
      description,
      userIds: JSON.parse(userIds),
      roleIds: JSON.parse(roleIds),
      groupId: params.id,
    });

    return redirect(`/settings/groups/${params.id}`);
  } catch (err: any) {
    return json({ err });
  }
}, PERMISSIONS.WRITE_GROUP);

interface LoaderData {
  group: {
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
  };
  isParent: boolean;
}

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const groupId = params.id || '';
    const childId = params.childId || '';

    // roles must be get from parent
    const roles = await getRolesOfGroups(groupId);

    const url = new URL(request.url);
    const searchText = url.searchParams.get('users') || '';
    const users = await searchUser(searchText);
    const userId = await getUserId({ request });

    const isParent = await isParentOfGroup({
      userId,
      groupId: childId,
    });
    if (!isParent) {
      throw new Response(null, res403GroupParent);
    }

    const group = await hoc404(async () =>
      getGroupDetail<LoaderData>({
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

export default function Screen() {
  const { group, roles, users } = useLoaderData<any>();
  const navigation = useNavigation();

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      name: group.name,
      description: group.description,
      userIds: group.users?.map((user: any) => ({
        value: user._id,
        label: user.username,
      })),
      roleIds: group.roles?.map((role: any) => ({
        value: role._id,
        label: role.name,
      })),
    },
  });

  const submit = useSubmit();

  const onSubmit = (data: any) => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append(
      'userIds',
      JSON.stringify(data.userIds.map((user: any) => user.value)),
    );
    formData.append(
      'roleIds',
      JSON.stringify(data.roleIds.map((role: any) => role.value)),
    );

    submit(formData, { method: 'post' });
  };

  return (
    <>
      <div className="flex flex-row items-center text-xl px-0 pb-6 gap-4">
        <Button onClick={goBack}>
          <MoveLeft className="h-5 w-5" />{' '}
        </Button>
        Update role
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="gap-4 pb-4 grid p-0">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-left">
                Group name
              </Label>
              <Input
                {...register('name' as const, {
                  required: true,
                })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Input
                {...register('description' as const, {
                  required: true,
                })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left">Users</Label>
              <div className="col-span-3">
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
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left">Roles</Label>
              <div className="col-span-3">
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
          </div>
        </CardContent>
        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </>
  );
}
