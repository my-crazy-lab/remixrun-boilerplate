import { Logo } from '@/components/btaskee/BTaskeeLogo';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { authenticator } from '~/services/passports.server';

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
}

export default function Screen() {
  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-3 lg:px-0">
      <div className="relative hidden h-full flex-col bg-[url('@/images/login-background.svg')] bg-cover bg-no-repeat bg-center p-6 text-white lg:flex col-span-2">
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo />
        </div>
      </div>
      <div className="lg:p-8 col-span-1">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
