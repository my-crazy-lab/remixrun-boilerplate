import { Breadcrumbs } from '@/components/btaskee/Breadcrumbs';
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
import TabGroupIcon from '@/images/tab-group.svg';
import UsersIcon from '@/images/user-group.svg';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useParams } from '@remix-run/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '~/constants/common';
import { hoc404, res403 } from '~/hoc/remix';
import useGlobalStore from '~/hooks/useGlobalStore';
import { getUserId } from '~/services/helpers.server';
import {
  getGroupDetail,
  isParentOfGroup,
  verifyUserInGroup,
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

  const userInGroup = await verifyUserInGroup({ userId, groupId });
  // just accept user is parent or member of group
  if (!isParent && !userInGroup) {
    throw new Response(null, res403);
  }

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
  const { t } = useTranslation(['user-settings']);

  const params = useParams();
  const loaderData = useLoaderData<LoaderData>();
  const globalData = useGlobalStore(state => state);

  return (
    <>
      <div className="flex justify-between items-center bg-secondary p-4 rounded-md">
        <div className="grid space-y-2">
          <Typography variant="h3">{loaderData.group?.name}</Typography>
          <Breadcrumbs />
        </div>

        {globalData.permissions?.includes(PERMISSIONS.WRITE_GROUP) ? (
          <Link to={`/settings/groups/${params.id}/create`}>
            <Button className="gap-2">
              <Plus />
              {t('CREATE_NEW_GROUP')}
            </Button>
          </Link>
        ) : null}
      </div>
      <div>
        <Typography className="py-4 font-medium text-base" variant="p">
          {t('CHILDREN_GROUP')}
        </Typography>
        <div className="grid grid-cols-3 gap-8">
          {loaderData.group?.children?.length
            ? loaderData.group.children.map((child, index: number) => {
                return (
                  <Link key={index} to={`/settings/groups/${child?._id}`}>
                    <Card className="bg-gray-100">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <Typography variant="h4" affects="removePMargin">
                            {child.name}
                          </Typography>
                          {globalData.permissions?.includes(
                            PERMISSIONS.WRITE_GROUP,
                          ) ? (
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
                                <Link
                                  to={`/settings/groups/${params.id}/edit/${child._id}`}>
                                  <DropdownMenuItem>
                                    {t('EDIT')}
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  {t('DELETE')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                        <Typography
                          className="text-gray-500"
                          variant="p"
                          affects="removePMargin">
                          {child?.description}
                        </Typography>
                      </CardHeader>
                      <CardContent className="flex flex-row gap-4 p-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary-50 p-3 rounded-md">
                            <img src={TabGroupIcon} alt="tab-group-icon" />
                          </div>
                          <div>
                            <Typography className="text-gray-400" variant="p">
                              {t('CHILDREN_GROUP')}
                            </Typography>
                            <Typography className="text-primary" variant="h4">
                              2
                            </Typography>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-secondary p-3 rounded-md">
                            <img src={UsersIcon} alt="user-group-icon" />
                          </div>
                          <div>
                            <Typography className="text-gray-400" variant="p">
                              {t('USERS')}
                            </Typography>
                            <Typography
                              className="text-secondary-foreground"
                              variant="h3">
                              2
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            : t('NO_USER_GROUP_HERE')}
        </div>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 mt-6">
        <Card className="p-4 col-span-2">
          <div className="flex justify-between items-center pb-4">
            <div className="flex flex-col">
              <Typography variant={'h4'}>
                {t('SET_ROLES_AND_PERMISSIONS')}
              </Typography>
              <Typography
                className="text-gray pb-4"
                variant={'p'}
                affects={'removePMargin'}>
                {t('SET_ROLES_AND_PERMISSIONS_HELPER_TEXT')}
              </Typography>
              <Separator />
            </div>
            {globalData.permissions?.includes(PERMISSIONS.WRITE_ROLE) ? (
              <Link to={`/settings/groups/${params.id}/roles/create`}>
                <Button className="gap-2">
                  <Plus />
                  {t('CREATE_ROLES')}
                </Button>
              </Link>
            ) : null}
          </div>

          {loaderData.group?.roles?.map(role => {
            return (
              <Link
                key={role._id}
                to={`/settings/groups/${params.id}/roles/${role._id}`}>
                <Button variant="secondary" className="mr-4">
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
                          <DropdownMenuItem>{t('EDIT')}</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{t('DELETE')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    ) : null}
                  </DropdownMenu>
                </Button>
              </Link>
            );
          })}
        </Card>

        <Card className="p-4 col-span-1">
          <div className="flex flex-col pb-4">
            <Typography variant={'h4'}>{t('USERS')}</Typography>
            <Typography
              className="text-gray"
              variant={'p'}
              affects={'removePMargin'}>
              {t('USERS_HELPER_TEXT')}
            </Typography>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-2">
            {loaderData.group?.users?.map(user => {
              return (
                <Link key={user._id} to={`/settings/profile/${user._id}`}>
                  <div className="mt-4 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                    </Button>
                    <div>
                      <Typography variant="h4">{user.username}</Typography>
                      <Typography
                        className="text-gray"
                        variant="p"
                        affects="removePMargin">
                        {user.email}
                      </Typography>
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
