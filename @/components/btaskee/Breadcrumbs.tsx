import { cn } from "@/lib/utils";
import type { NavLinkProps, UIMatch } from "@remix-run/react";
import { useMatches } from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { Fragment } from "react";
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
        "group-last:group-[&:not(:only-child)]:line-clamp-1 group-last:text-secondary-foreground",
        "group-only:font-medium group-only:text-secondary",
        "max-md:font-medium max-md:text-gray-400",
        "text-gray-400"
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
    <span className="pointer-events-none text-sm text-gray" {...props}>
      <ChevronRight className="h-4 w-4" />
    </span>
  )
}

type BreadcrumbMatch = UIMatch<Record<string, unknown>,
  { breadcrumb: (data?: unknown) => JSX.Element }>

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
