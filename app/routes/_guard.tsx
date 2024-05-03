import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { useRef } from 'react';
import ROUTE_NAME from '~/constants/route';
import type { GlobalProps, GlobalStore } from '~/hooks/useGlobalStore';
import { GlobalContext, createGlobalStore } from '~/hooks/useGlobalStore';
import { authenticator } from '~/services/auth.server';
import { getUserPermissionsIgnoreRoot } from '~/services/role-base-access-control.server';
import { commitSession, getSession } from '~/services/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: ROUTE_NAME.SIGN_IN,
  });
  const session = await getSession(request.headers.get('cookie'));

  const userPermissions = await getUserPermissionsIgnoreRoot(user.userId);

  return json(
    {
      user: { userId: user.userId, permissions: userPermissions },
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session), // You must commit the session whenever you read a flash
      },
    },
  );
}

export default function Screen() {
  const { user } = useLoaderData<{
    user: GlobalProps;
  }>();

  const storeRef = useRef<GlobalStore>();
  if (!storeRef.current) {
    storeRef.current = createGlobalStore(user);
  }

  return (
    <div className="hidden flex-col md:flex max-w-[1392px] m-auto">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <GlobalContext.Provider value={storeRef.current}>
          <Outlet />
        </GlobalContext.Provider>
      </div>
    </div>
  );
}
