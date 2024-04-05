import Typography from "@/components/btaskee/Typography";
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, Outlet, useLocation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

const navigations = [
  {
    title: 'Promotion',
    href: '/marketing/promotion',
    premission: ''
  },
  {
    title: 'Rewards',
    href: '/marketing/rewards',
    premission: ''
  },
  {
    title: 'Campaign',
    href: '/marketing/campaign',
    premission: ''
  },
  {
    title: 'Combo Vouchers',
    href: '/marketing/combo-vouchers',
    premission: '',
  },
]

export default function Screen() {
  const { t } = useTranslation(['common', 'settings']);
  const { pathname } = useLocation();

  return (
    <div className="space-y-6 md:block">
      <div className="space-y-2">
        <Typography variant='h2'>{t('marketing')}</Typography>
        <Typography className="text-gray-400" variant='p' affects='removePMargin'>
          Pellentesque ut rhoncus nibh. Sed interdum ullamcorper libero, semper suscipit ex. Integer eget nisi
        </Typography>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/6">
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
