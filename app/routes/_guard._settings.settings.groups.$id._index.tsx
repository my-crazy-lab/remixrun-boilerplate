import { CommonAlertDialog } from '@/components/btaskee/AlertDialog';
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
import { type ActionFunctionArgs } from '@remix-run/node';
import { Form, Link, useOutletContext, useParams } from '@remix-run/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '~/constants/common';
import useGlobalStore from '~/hooks/useGlobalStore';
import {
  deleteGroup,
  deleteRole,
} from '~/services/role-base-access-control.server';
import { type GroupDetail } from '~/types/LoaderData';

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.clone().formData();

  const roleIdDeleted = formData.get('delete-role')?.toString();
  const groupIdDeleted = formData.get('delete-group')?.toString();

  if (roleIdDeleted) {
    await deleteRole({ roleId: roleIdDeleted, groupId: params.id || '' });
  } else if (groupIdDeleted) {
    await deleteGroup({ groupId: groupIdDeleted });
  }
  return null;
}

export default function Screen() {
  const { t } = useTranslation(['user-settings']);

  const params = useParams();
  const globalData = useGlobalStore(state => state);
  const loaderData = useOutletContext<GroupDetail>();

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
        <Typography className="py-4 font-medium text-base">
          {t('Children group')}
        </Typography>
        <div className="grid grid-cols-3 gap-8">
          {loaderData.group?.children?.length
            ? loaderData.group.children.map((child, index: number) => {
              return (
                <Card key={index} className="bg-gray-100">
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
                              <DropdownMenuItem>{t('EDIT')}</DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <CommonAlertDialog triggerText={t('DELETE')}
                              title="Are you absolutely sure?"
                              description='This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.'>
                              <Form className="w-full" method="post">
                                <button
                                  name="delete-group"
                                  value={child._id}
                                  className="w-full text-start"
                                  type="submit">
                                  {t('DELETE')}
                                </button>
                              </Form>
                            </CommonAlertDialog>
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
                  <Link to={`/settings/groups/${child?._id}`}>
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
                  </Link>
                </Card>
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

          <div className='flex flex-wrap gap-3'>
            {loaderData.group?.roles?.map(role => {
              return (
                <Button key={role._id} variant='secondary' className="flex text-blue bg-blue-50 gap-2">
                  <Link to={`/settings/groups/${params.id}/roles/${role._id}`}>
                    {role.name}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    {globalData.permissions?.includes(PERMISSIONS.WRITE_ROLE) ? (
                      <DropdownMenuContent align="center" className="w-[160px]">
                        <Link
                          to={`/settings/groups/${params.id}/roles/${role._id}/edit`}>
                          <DropdownMenuItem>{t('EDIT')}</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <CommonAlertDialog triggerText={t('DELETE')}
                          title="Are you absolutely sure?"
                          description='This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.'>
                          <Form className="w-full" method="post">
                            <button
                              name="delete-role"
                              value={role._id}
                              className="w-full text-start"
                              type="submit">
                              {t('DELETE')}
                            </button>
                          </Form>
                        </CommonAlertDialog>
                      </DropdownMenuContent>
                    ) : null}
                  </DropdownMenu>
                </Button>
              );
            })}
          </div>
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
      </div >
    </>
  );
}
