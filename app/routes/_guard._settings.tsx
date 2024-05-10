import { BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import Typography from '@/components/btaskee/Typography';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, Outlet, useLocation } from '@remix-run/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import useGlobalStore from '~/hooks/useGlobalStore';

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink disabled to="/settings" label="SETTINGS" />
  ),
  i18n: 'user-settings',
};

export default function Screen() {
  const { t } = useTranslation('user-settings');
  const { pathname } = useLocation();

  // not have permission field mean not require permission
  const navigation = useMemo(
    () => [
      {
        title: 'PROFILE',
        href: ROUTE_NAME.PROFILE_SETTING,
      },
      {
        title: 'USER_MANAGEMENT',
        href: ROUTE_NAME.USER_SETTING,
        permission: PERMISSIONS.MANAGER,
      },
      {
        title: 'GROUPS',
        href: ROUTE_NAME.GROUP_SETTING,
        permission: PERMISSIONS.READ_GROUP,
      },
      {
        title: 'ACTIONS_HISTORY',
        href: ROUTE_NAME.ACTION_HISTORY_SETTING,
        permission: PERMISSIONS.MANAGER,
      },
    ],
    [],
  );

  const permissions = useGlobalStore(state => state.permissions);

  return (
    <div className="space-y-6 md:block">
      <div className="space-y-0.5">
        <Typography variant="h2">{t('SETTINGS')}</Typography>
        <Typography
          className="text-gray-400"
          variant="p"
          affects="removePMargin">
          {t('SETTINGS_HELPER_TEXT')}
        </Typography>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav
            className={cn(
              'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
            )}>
            {navigation.map(item =>
              !item.permission || permissions.includes(item.permission) ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    pathname.includes(item.href)
                      ? 'bg-primary-50 hover:bg-primary-50 hover:text-primary font-medium text-primary'
                      : 'hover:bg-primary-50 text-gray font-normal',
                    'justify-start text-base',
                  )}>
                  {t(item.title)}
                </Link>
              ) : null,
            )}
          </nav>
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
