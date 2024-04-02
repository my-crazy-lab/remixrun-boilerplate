import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, Outlet, useLocation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export default function Screen() {
  const {t} = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="hidden space-y-6 md:block">
      <div className="space-y-0.5">
        <div className="flex space-x-2 items-center">
          <h2 className="text-2xl font-bold tracking-tight">{t('SETTINGS')}</h2>
        </div>

        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav
            className={cn(
              'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
            )}>
            {[
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
            ].map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  pathname.includes(item.href)
                    ? 'bg-muted hover:bg-muted'
                    : 'hover:bg-transparent hover:underline',
                  'justify-start',
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
