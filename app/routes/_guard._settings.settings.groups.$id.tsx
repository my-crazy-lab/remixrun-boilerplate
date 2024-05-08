import { BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import ROUTE_NAME from '~/constants/route';
import { hoc404 } from '~/hoc/remix';
import { getUserSession } from '~/services/helpers.server';
import {
  getGroupDetail,
  isParentOfGroup,
} from '~/services/role-base-access-control.server';
import { type Groups } from '~/types';
import { type GroupDetail } from '~/types/LoaderData';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const groupId = params.id || '';
  const { userId, isSuperUser } = await getUserSession({
    headers: request.headers,
  });
  const isParent = await isParentOfGroup({
    parentId: userId,
    groupId,
  });

  const group = await hoc404(async () =>
    getGroupDetail<GroupDetail>({
      isSuperUser,
      isParent,
      userId,
      groupId,
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
  breadcrumb: (data: { group: Groups }) => {
    const { group } = data;

    return (
      <BreadcrumbsLink
        to={`${ROUTE_NAME.GROUP_SETTING}/${group._id}`}
        label={group.name}
      />
    );
  },
};

export default function Screen() {
  const loaderData = useLoaderData<typeof loader>();

  return <Outlet context={loaderData} />;
}
