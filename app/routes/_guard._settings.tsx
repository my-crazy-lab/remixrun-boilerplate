import { BreadcrumbsLink } from "@/components/btaskee/Breadcrumbs";
import Typography from "@/components/btaskee/Typography";
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, Outlet, useLocation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

const navigations = [
  {
    title: 'Profile',
    href: '/settings/profile',
  },
  {
    title: 'Users management',
    href: '/settings/users',
  },
  {
    title: 'Groups',
    href: '/settings/groups',
  },
  {
    title: 'Action history',
    href: '/settings/action-history',
  },
]

export const handle = {
  breadcrumb: () => <BreadcrumbsLink to="/settings" label="Setting" />,
}

export default function Screen() {
  const { t } = useTranslation(['common', 'settings']);
  const { pathname } = useLocation();

  return (
    <div className="space-y-6 md:block">
      <div className="space-y-0.5">
        <Typography variant='h2'>{t('SETTINGS')}</Typography>
        <Typography className="text-gray-400" variant='p' affects='removePMargin'>
          Manage your account settings and set e-mail preferences.
        </Typography>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav
            className={cn(
              'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
            )}>
            {navigations.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  pathname.includes(item.href)
                    ? 'bg-muted hover:bg-muted font-medium'
                    : 'hover:bg-muted text-gray font-normal',
                  'justify-start text-base',
                )}>
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
