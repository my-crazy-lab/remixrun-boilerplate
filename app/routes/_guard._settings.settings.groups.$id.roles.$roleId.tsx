import { BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { PERMISSIONS } from '~/constants/common';
import { hocLoader, res403 } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  getRoleDetail,
  isParentOfGroup,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import { type Roles } from '~/types';
import { groupPermissionsByModule } from '~/utils/common';

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const groupId = params.id || '';
    const roleId = params.roleId || '';
    const userId = await getUserId({ request });

    const isParent = await isParentOfGroup({
      parentId: userId,
      groupId,
    });
    const userInGroup = await verifyUserInGroup({ userId, groupId });

    // just parent or member in group can view role detail of group
    if (!isParent && !userInGroup) {
      throw new Response(null, res403);
    }

    const role = await getRoleDetail(roleId);
    return json({
      role: {
        ...role,
        actionPermissions: groupPermissionsByModule(role.actionPermissions),
      },
      groupId,
      roleId,
    });
  },
  PERMISSIONS.READ_ROLE,
);

export const handle = {
  breadcrumb: (data: { role: Roles; groupId: string; roleId: string }) => {
    const { role, groupId, roleId } = data;
    return (
      <BreadcrumbsLink
        to={`/settings/groups/${groupId}/roles/${roleId}`}
        label={role.name}
      />
    );
  },
};

export default function Screen() {
  const loaderData = useLoaderData();
  return <Outlet context={loaderData} />;
}
