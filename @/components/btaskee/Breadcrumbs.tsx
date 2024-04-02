import type { NavLinkProps, UIMatch } from "@remix-run/react";
import { useMatches } from "@remix-run/react";
import type { HTMLAttributes, ReactNode } from "react";
import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { NavigationLink } from "./NavigationLink";

type BreadcrumbsItemProps = HTMLAttributes<HTMLElement> &
  NavLinkProps & {
    label: ReactNode
  }

export const BreadcrumbsLink = ({ children, label, ...props }: BreadcrumbsItemProps) => {
  return (
    <NavigationLink
      itemProp="item"
      className={cn([
        "group-last:group-[&:not(:only-child)]:line-clamp-1",
        "group-only:font-medium group-only:text-neutral-800 group-only:dark:text-neutral-200",
        "max-md:font-medium max-md:text-neutral-800 max-md:dark:text-neutral-200",
      ])}
      end
      {...props}
    >
      {children}

      <span itemProp="name">{label}</span>
    </NavigationLink>
  )
}

const BreadcrumbsSeparator = ({ ...props }: HTMLAttributes<HTMLElement>) => {
  return (
    <span className="pointer-events-none text-sm text-neutral-300 dark:text-neutral-600" {...props}>
      /
    </span>
  )
}

type BreadcrumbMatch = UIMatch<
  Record<string, unknown>,
  { breadcrumb: (data?: unknown) => JSX.Element }
>

export const Breadcrumbs = ({ className, ...props }: HTMLAttributes<HTMLElement>) => {
  const matches = (useMatches() as unknown as BreadcrumbMatch[]).filter(
    ({ handle }) => handle?.breadcrumb
  )

  return (
    <ol
      itemScope
      itemType="https://schema.org/BreadcrumbList"
      className={cn("flex items-center gap-2.5", className)}
      {...props}
    >
      {matches.map(({ handle, data }, i) => (
        <Fragment key={i}>
          <li
            className={cn("group contents", i > 0 && "max-md:hidden")}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {i > 0 && <BreadcrumbsSeparator />}
            {handle.breadcrumb(data)}
            <meta itemProp="position" content={`${i + 1}`} />
          </li>
        </Fragment>
      ))}
    </ol>
  )
}
