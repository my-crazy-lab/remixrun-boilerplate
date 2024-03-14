import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useNavigate, useParams } from '@remix-run/react';
import { MoveLeft } from 'lucide-react';
import { PERMISSIONS } from '~/constants/common';
import useGlobalStore from '~/hooks/useGlobalStore';
import { getUserId } from '~/services/helpers.server';
import { getGroupDetail } from '~/services/role-base-access-control.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await getUserId({ request });
  const group = await getGroupDetail({
    projection: {
      roles: 1,
      users: 1,
      children: 1,
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
  return json({ group });
};

export default function Screen() {
  const params = useParams();
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const loaderData = useLoaderData<any>();
  const globalData = useGlobalStore(state => state);

  return (
    <>
      <div className="flex justify-between items-center text-xl px-0 pb-6">
        <div className="flex items-center gap-4">
          <Button onClick={goBack}>
            <MoveLeft className="h-5 w-5" />{' '}
          </Button>
          {loaderData.group.name}
        </div>

        <Link to={`/settings/groups/${loaderData.group._id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>
      <p>
        {loaderData.group.description
          ? loaderData.group.description
          : `Lorem ipsum dolor sit amet and continues with nonsensical Latin-like words. If you need more information or assistance, feel free to ask!`}
      </p>

      <div>
        <div className="flex justify-between py-4">
          <h3 className="font-semibold uppercase">user groups</h3>
          {globalData.permissions.includes(PERMISSIONS.WRITE_GROUP) ? (
            <Link to={`/settings/groups/${params.id}/create`}>
              <Button>Create children group</Button>
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {loaderData.group.children.length
            ? loaderData.group.children.map((child: any, index: number) => {
                return (
                  <Link key={index} to={`/settings/groups/${child._id}`}>
                    <Card className="cursor-pointer hover:border-primary">
                      <CardHeader className="font-semibold flex flex-row justify-between items-center">
                        <h1>{child.name}</h1>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                              <DotsHorizontalIcon className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-[160px]">
                            <Link to={`/settings/groups/${child._id}/edit`}>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent>
                        {child.description
                          ? child.description
                          : `Lorem ipsum dolor sit amet and continues with nonsensical Latin-like words. If you need more information or assistance, feel free to ask!`}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            : 'No user group here!'}
        </div>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold uppercase py-4">
              set roles and permissions
            </h3>
            <Link to={`/settings/groups/${params.id}/roles/create`}>
              <Button>Create roles</Button>
            </Link>
          </div>

          {loaderData.group.roles.map((role: any, index: number) => {
            return (
              <Link
                key={index}
                to={`/settings/groups/${params.id}/roles/${role._id}`}>
                <Button variant="outline" className="mr-4 mt-4">
                  {role._id}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <Link
                        to={`/settings/groups/${params.id}/roles/${role._id}/edit`}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Button>
              </Link>
            );
          })}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold uppercase py-4">users</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {loaderData.group.users.map((user: any, index: number) => {
              return (
                <Link key={index} to={'/settings/profile'}>
                  <Card className="mt-4 flex items-center gap-4 p-2">
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>bTaskee</AvatarFallback>
                      </Avatar>
                    </Button>
                    <div>
                      <p className="text-primary"> {user.username}</p>
                      <p>{user.email}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
