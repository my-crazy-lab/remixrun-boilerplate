import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Form, Link, useLocation } from '@remix-run/react';
import ROUTE_NAME from '~/constants/route';

import { Logo } from './BTaskeeLogo';
import LanguageSelector from './LanguageSelector';
import TimezoneSwitcher from './TimezoneSwitcher';

const navigation = [
  {
    title: 'Settings',
    href: ROUTE_NAME.PROFILE_SETTING,
  },
  {
    title: 'Marketing',
    href: 'marketing/promotion',
  },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <nav className="flex items-center space-x-0.5 lg:space-x-2 mx-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors">
            <Logo />
          </Link>
          {navigation.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                pathname.includes(item.href)
                  ? 'text-primary font-medium'
                  : 'text-gray font-normal',
                'text-sm transition-colors hover:text-primary',
              )}>
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Search..."
            className="md:w-[100px] lg:w-[270px]"
          />
          <TimezoneSwitcher />
          <LanguageSelector />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-10 w-10">
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
  );
}
