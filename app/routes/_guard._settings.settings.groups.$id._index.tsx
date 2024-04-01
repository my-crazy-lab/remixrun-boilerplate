import Typography from '@/components/btaskee/Typography';
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
import { Separator } from '@/components/ui/separator';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useNavigate, useParams } from '@remix-run/react';
import { Plus } from 'lucide-react';
import { useCallback } from 'react';
import { PERMISSIONS } from '~/constants/common';
import { hoc404 } from '~/hoc/remix';
import useGlobalStore from '~/hooks/useGlobalStore';
import { getUserId } from '~/services/helpers.server';
import {
  getGroupDetail,
  isParentOfGroup,
} from '~/services/role-base-access-control.server';

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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const groupId = params.id || '';
  const userId = await getUserId({ request });

  const isParent = await isParentOfGroup({
    userId,
    groupId,
  });

  // accept parent and user(in group) with permission Read
  const group = await hoc404(async () =>
    getGroupDetail<LoaderData>({
      userId,
      groupId,
      isParent,
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
    }),
  );
  return json({ group, isParent });
};

export default function Screen() {
  const params = useParams();
  const loaderData = useLoaderData<LoaderData>();
  const globalData = useGlobalStore(state => state);

  const navigate = useNavigate();
  const goBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <>
      <div className="flex justify-between items-center text-xl bg-secondary p-6 rounded-md">
        <div className="flex items-center gap-4">
          {/* <Button onClick={goBack}>
            <MoveLeft className="h-5 w-5" />
          </Button> */}
          <Typography variant='h4'>{loaderData.group?.name}</Typography>

        </div>
        {globalData.permissions?.includes(PERMISSIONS.WRITE_GROUP) ? (
          <Link to={`/settings/groups/${params.id}/create`}>
            <Button className='gap-2'><Plus />Create new group</Button>
          </Link>
        ) : null}
      </div>
      <p>{loaderData.group?.description}</p>
      <div>
        <Typography className='py-4' variant='h4'>Children groups</Typography>
        <div className="grid grid-cols-4 gap-4">
          {loaderData.group?.children?.length
            ? loaderData.group.children.map((child, index: number) => {
              return (
                <Link key={index} to={`/settings/groups/${child?._id}`}>
                  <Card className="cursor-pointer hover:border-primary">
                    <CardHeader className="font-semibold flex flex-row justify-between items-center p-4">
                      <h1>{child?.name}</h1>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                            <DotsHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        {globalData.permissions?.includes(
                          PERMISSIONS.WRITE_GROUP,
                        ) ? (
                          <DropdownMenuContent
                            align="start"
                            className="w-[160px]">
                            <Link
                              to={`/settings/groups/${params.id}/edit/${child._id}`}>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        ) : null}
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>{child?.description}</CardContent>
                  </Card>
                </Link>
              );
            })
            : 'No user group here!'}
        </div>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 mt-6">
        <Card className="p-6 col-span-2">
          <div className="flex justify-between items-center pb-4">
            <div className='flex flex-col'>
              <Typography variant={'h4'}>
                Set roles and permissions
              </Typography>
              <Typography className='text-gray pb-4' variant={'p'} affects={'removePMargin'}>To change your personal detail, edit and save from here</Typography>
              <Separator />
            </div>
            {globalData.permissions?.includes(PERMISSIONS.WRITE_ROLE) ? (
              <Link to={`/settings/groups/${params.id}/roles/create`}>
                <Button className='gap-2'><Plus />Create roles</Button>
              </Link>
            ) : null}
          </div>

          {loaderData.group?.roles?.map(role => {
            return (
              <Link
                key={role._id}
                to={`/settings/groups/${params.id}/roles/${role._id}`}>
                <Button variant="secondary" className="mr-4 mt-4">
                  {role.name}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    {globalData.permissions?.includes(
                      PERMISSIONS.WRITE_ROLE,
                    ) ? (
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <Link
                          to={`/settings/groups/${params.id}/roles/${role._id}/edit`}>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    ) : null}
                  </DropdownMenu>
                </Button>
              </Link>
            );
          })}
        </Card>

        <Card className="p-6 col-span-1">
          <div className="flex flex-col pb-4">
            <Typography variant={'h4'}>
              Users
            </Typography>
            <Typography className='text-gray' variant={'p'} affects={'removePMargin'}>To change your personal</Typography>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-2">
            {loaderData.group?.users?.map(user => {
              return (
                <Link key={user._id} to={'/settings/profile'}>
                  <div className="mt-4 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>bTaskee</AvatarFallback>
                      </Avatar>
                    </Button>
                    <div>
                      <Typography variant='h4'>{user.username}</Typography>
                      <Typography className='text-gray' variant='p' affects='removePMargin'>{user.email}</Typography>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
