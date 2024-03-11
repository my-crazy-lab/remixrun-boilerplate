import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { PERMISSIONS } from '~/constants/common';
import useGlobalStore from '~/hooks/useGlobalStore';
import { getUserId } from '~/services/helpers.server';
import { getGroupsOfUser } from '~/services/role-base-access-control.server';

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
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Groups management
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your groups!
          </p>
        </div>
        <Dialog>
          {globalData.permissions.includes(PERMISSIONS.WRITE_GROUP) ? (
            <DialogTrigger asChild>
              <Button variant="outline">Add group</Button>
            </DialogTrigger>
          ) : null}
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>New group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group name
                </Label>
                <Input id="group" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Users</Label>
                <div className="col-span-3">
                  <MultiSelect
                    isDisplayAllOptions
                    options={[
                      {
                        value: 'next.js',
                        label: 'Next.js',
                      },
                      {
                        value: 'sveltekit',
                        label: 'SvelteKit',
                      },
                      {
                        value: 'nuxt.js',
                        label: 'Nuxt.js',
                      },
                      {
                        value: 'remix',
                        label: 'Remix',
                      },
                    ]}
                    className="w-[360px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Roles</Label>
                <div className="col-span-3">
                  <MultiSelect
                    isDisplayAllOptions
                    options={[
                      {
                        value: 'next.js',
                        label: 'Next.js',
                      },
                      {
                        value: 'sveltekit',
                        label: 'SvelteKit',
                      },
                      {
                        value: 'nuxt.js',
                        label: 'Nuxt.js',
                      },
                      {
                        value: 'remix',
                        label: 'Remix',
                      },
                    ]}
                    className="w-[360px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Teams</Label>
                <div className="col-span-3">
                  <MultiSelect
                    isDisplayAllOptions
                    options={[
                      {
                        value: 'next.js',
                        label: 'Next.js',
                      },
                      {
                        value: 'sveltekit',
                        label: 'SvelteKit',
                      },
                      {
                        value: 'nuxt.js',
                        label: 'Nuxt.js',
                      },
                      {
                        value: 'remix',
                        label: 'Remix',
                      },
                    ]}
                    className="w-[360px]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
