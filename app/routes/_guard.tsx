import { Logo } from '@/components/btaskee/BTaskeeLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useSubmit,
} from '@remix-run/react';
import { UserCircle } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ROUTE_NAME from '~/constants/route';
import type { GlobalStore } from '~/hooks/useGlobalStore';
import { GlobalContext, createGlobalStore } from '~/hooks/useGlobalStore';
import { authenticator } from '~/services/auth.server';
import { getUserPermissionsIgnoreRoot } from '~/services/role-base-access-control.server';
import { commitSession, getSession } from '~/services/session.server';
import { getUserProfile } from '~/services/settings.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: ROUTE_NAME.SIGN_IN,
  });
  const session = await getSession(request.headers.get('cookie'));
  const userPermissions = await getUserPermissionsIgnoreRoot(user.userId);
  const userProfile = await getUserProfile(user.userId);

  // get flash session
  session.get('flashMessage');

  return json(
    {
      user: { ...user, permissions: userPermissions },
      userProfile,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session), // You must commit the session whenever you read a flash
      },
    },
  );
}

export default function Screen() {
  const { user, userProfile } = useLoaderData<typeof loader>();

  const storeRef = useRef<GlobalStore>();
  if (!storeRef.current) {
    storeRef.current = createGlobalStore(user);
  }
  const { t } = useTranslation(['common']);

  const { i18n } = useTranslation();
  const submit = useSubmit();

  const location = useLocation();

  const onSubmit = (language: string) => {
    const formData = new FormData();
    formData.append('language', language);
    formData.append('name', 'changeLanguage');
    formData.append('redirect', location.pathname);

    i18n.changeLanguage(language);
    submit(formData, {
      method: 'post',
      action: '/',
    });
  };

  return (
    <div className="hidden flex-col md:flex max-w-[1392px] m-auto">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <nav className="flex items-center space-x-0.5 lg:space-x-2 mx-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors">
              <Logo />
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <Input
              type="search"
              placeholder={t('SEARCH')}
              className="md:w-[100px] lg:w-[270px]"
            />
            <Select
              defaultValue={userProfile?.language}
              onValueChange={onSubmit}>
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Vietnamese</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile?.avatarUrl} />
                    <AvatarFallback>
                      <UserCircle />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link className="w-full" to={ROUTE_NAME.PROFILE_SETTING}>
                    {t('SETTINGS')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Form className="w-full" method="post" action="/logout">
                    <button className="w-full text-start" type="submit">
                      {t('LOGOUT')}
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
