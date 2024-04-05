import { BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { hoc404 } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  getGroupDetail,
  isParentOfGroup,
} from '~/services/role-base-access-control.server';
import { type Roles } from '~/types';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const groupId = params.id || '';
  const userId = await getUserId({ request });

  const isParent = await isParentOfGroup({
    userId,
    groupId,
  });

  // accept parent and user(in group) with permission Read
  const group = await hoc404(async () =>
    getGroupDetail<{
      roles: Roles[];
    }>({
      userId,
      groupId,
      isParent,
      projection: {
        roles: 1,
        users: 1,
        children: 1,
        parent: 1,
        hierarchy: 1,
        name: 1,
        description: 1,
        parents: 1,
      },
    }),
  );
  return json({ group, isParent });
};

export const handle = {
  breadcrumb: (data: { group: any }) => {
    const { group } = data;

    return (
      <BreadcrumbsLink
        to={`/settings/groups/${group._id}`}
        label={group.name}
      />
    );
  },
};

export default function Screen() {
  const loaderData = useLoaderData();
  return <Outlet context={loaderData} />;
}
