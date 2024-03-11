import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect, MultiSelectAsync } from '@/components/ui/multi-select';
import { Slash } from 'lucide-react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  getGroupDetail,
  getRolesOfGroups,
  searchUser,
} from '~/services/role-base-access-control.server';
import { getUserId } from '~/services/helpers.server';
import { json } from '@remix-run/node';
import {
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { Controller, useForm } from 'react-hook-form';
import { hocLoader } from '~/hoc/remix';
import { PERMISSIONS } from '~/constants/common';

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const roles = await getRolesOfGroups(params.id || '');

    const url = new URL(request.url);
    const searchText = url.searchParams.get('users') || '';
    const users = await searchUser(searchText);
    const userId = await getUserId({ request });

    const group = await getGroupDetail({
      projection: {
        roles: 1,
        users: 1,
        'children.name': 1,
        'children.description': 1,
        parent: 1,
        hierarchy: 1,
        name: 1,
        description: 1,
      },
      userId,
      groupId: params.id,
    });

    if (!group) {
      throw new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });
    }
    return json({ group, roles, users });
  },
  PERMISSIONS.WRITE_GROUP,
);

export default function Screen() {
  const { group, roles, users } = useLoaderData<any>();
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
      userIds: group.users.map(user => ({
        value: user._id,
        label: user.username,
      })),
      roleIds: group.roles.map(role => ({
        value: role._id,
        label: role.name,
      })),
    },
  });

  return (
    <>
      <div className="text-2xl flex-row flex justify-between items-center px-0 pb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" to="/settings/groups">
                Groups
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg">Update group</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button type="submit">Save changes</Button>
      </div>
      <form>
        <CardContent className="gap-4 pb-4 grid p-0">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-left">
                Group name
              </Label>
              <Input
                defaultValue={group.name}
                id="group"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Input
                defaultValue={group.description}
                id="description"
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
          </div>
        </CardContent>
      </form>
    </>
  );
}
