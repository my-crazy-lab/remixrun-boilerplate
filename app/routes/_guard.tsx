import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { authenticator } from '~/services/auth.server';
import { commitSession, getSession } from '~/services/session.server';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import React from 'react';
import type { GlobalProps, GlobalStore } from '~/hooks/useGlobalStore';
import { GlobalContext, createGlobalStore } from '~/hooks/useGlobalStore';
import { getUserPermissions } from '~/services/role-base-access-control.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/sign-in',
  });
  const session = await getSession(request.headers.get('cookie'));

  const userPermissions = await getUserPermissions(user.userId);

  return json(
    { user: { userId: user.userId, permissions: userPermissions } },
    {
      headers: {
        'Set-Cookie': await commitSession(session), // You must commit the session whenever you read a flash
      },
    },
  );
}

export default function Screen() {
  const { t } = useTranslation();
  const { user } = useLoaderData<{ user: GlobalProps }>();

  const storeRef = React.useRef<GlobalStore>();
  if (!storeRef.current) {
    storeRef.current = createGlobalStore(user);
  }

  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Home page
            </Link>
            <Link
              to="/settings/profile"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Settings
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <Input
              type="search"
              placeholder="Search..."
              className="md:w-[100px] lg:w-[300px]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">shadcn</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      m@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Form className="w-full" method="post" action="/logout">
                    <button className="w-full  text-start" type="submit">
                      Logout
                    </button>
                  </Form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <GlobalContext.Provider value={storeRef.current}>
          <Outlet />
        </GlobalContext.Provider>
      </div>
    </div>
  );
}
