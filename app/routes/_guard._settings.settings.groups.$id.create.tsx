import { Button } from '@/components/ui/button';
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
import { hocAction, hocLoader } from '~/hoc/remix';
import {
  createGroup,
  getRolesOfGroups,
  searchUser,
} from '~/services/role-base-access-control.server';
export const action = hocAction(async ({ params }, { formData }) => {
  try {
    const { name, description, userIds, roleIds } = formData;
    await createGroup({
      name,
      description,
      userIds: JSON.parse(userIds),
      roleIds: JSON.parse(roleIds),
      parent: params.id,
    });

    return redirect(`/settings/groups/${params.id}`);
  } catch (err: any) {
    console.log(err);
    return json({ err });
  }
}, PERMISSIONS.WRITE_GROUP);

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

export default function Screen() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const loaderData = useLoaderData<any>();
  const navigation = useNavigation();

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      name: '',
      description: '',
      userIds: [],
      roleIds: [],
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
        New group
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="group" className="text-left">
              Group name
            </Label>
            <Input
              {...register('name' as const, {
                required: true,
              })}
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="group" className="text-left">
              Group description
            </Label>
            <Input
              {...register('description' as const, {
                required: true,
              })}
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-left">Users</Label>
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
          <div className="grid grid-cols-3 items-center gap-4">
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
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </>
  );
}
