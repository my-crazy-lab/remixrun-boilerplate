import { cn } from '@/lib/utils';
import type { NavLinkProps, UIMatch } from '@remix-run/react';
import { useMatches } from '@remix-run/react';
import { ChevronRight } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { NavigationLink } from './NavigationLink';

type BreadcrumbsItemProps = HTMLAttributes<HTMLElement> &
  NavLinkProps & {
    label: string;
    disabled?: boolean;
  };

export const BreadcrumbsLink = ({
  children,
  label,
  disabled,
  ...props
}: BreadcrumbsItemProps) => {
  const { t } = useTranslation(['common']);
  return (
    <NavigationLink
      itemProp="item"
      className={cn([
        'group-last:group-[&:not(:only-child)]:line-clamp-1 group-last:text-secondary-foreground',
        'group-only:font-medium group-only:text-secondary',
        'max-md:font-medium max-md:text-gray-400',
        'text-gray-400',
        disabled && 'opacity-50 cursor-not-allowed',
      ])}
      end
      {...props}>
      {children}
      <span itemProp="name">{t(label)}</span>
    </NavigationLink>
  );
};

const BreadcrumbsSeparator = ({ ...props }: HTMLAttributes<HTMLElement>) => {
  return (
    <span className="pointer-events-none text-sm text-gray" {...props}>
      <ChevronRight className="h-4 w-4" />
    </span>
  );
};

type BreadcrumbMatch = UIMatch<
  Record<string, unknown>,
  { breadcrumb: (data?: unknown) => JSX.Element }
>;

export const Breadcrumbs = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => {
  const matches = useMatches() as unknown as BreadcrumbMatch[];

  return (
    <ol
      itemScope
      itemType="https://schema.org/BreadcrumbList"
      className={cn('flex items-center gap-2.5', className)}
      {...props}>
      {matches
        ?.filter(match => match?.handle?.breadcrumb)
        ?.map((match, i) => (
          <Fragment key={i}>
            <li
              className={cn('group contents', i > 0 && 'max-md:hidden')}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem">
              {i > 0 && <BreadcrumbsSeparator />}
              {match?.handle?.breadcrumb(match?.data)}
              <meta itemProp="position" content={`${i + 1}`} />
            </li>
          </Fragment>
        ))}
    </ol>
  );
};
