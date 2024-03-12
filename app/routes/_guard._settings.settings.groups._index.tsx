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
import { Link, useLoaderData } from '@remix-run/react';
import useGlobalStore from '~/hooks/useGlobalStore';
import { getUserId } from '~/services/helpers.server';
import { getGroupsOfUser } from '~/services/role-base-access-control.server';

export const handle = {
  breadcrumb: () => <Link to="/settings/groups">Groups</Link>,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId({ request });
  const groups = await getGroupsOfUser({
    userId,
    projection: {
      name: 1,
      description: 1,
      'users.username': 1,
      'users.email': 1,
      roles: 1,
      createdAt: 1,
      parent: 1,
      hierarchy: 1,
    },
  });
  return json({ groups });
};

export default function Screen() {
  const loaderData = useLoaderData<{ groups: any }>();
  const globalData = useGlobalStore(state => state);
  console.log(loaderData, globalData, '!!');

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Groups management
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your groups!
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {loaderData.groups.map((group: any, index: number) => {
          return (
            <Link key={index} to={`/settings/groups/${group._id}`}>
              <Card>
                <CardHeader className="font-semibold flex flex-row justify-between items-center">
                  {group.name}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[160px]">
                      <Link to={`/settings/groups/${group._id}/edit`}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>.desc here</CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
