import { Breadcrumbs } from '@/components/btaskee/Breadcrumbs';
import Typography from '@/components/btaskee/Typography';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import _ from 'lodash';
import { PERMISSIONS } from '~/constants/common';
import { hocLoader, res403 } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  getRoleDetail,
  isParentOfGroup,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import { type ReturnValueIgnorePromise } from '~/types';
import { groupPermissionsByModule } from '~/utils/common';

interface LoaderData {
  role: ReturnValueIgnorePromise<typeof getRoleDetail> & {
    actionPermissions: ReturnType<typeof groupPermissionsByModule>;
  };
}

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const groupId = params.id || '';
    const userId = await getUserId({ request });

    const isParent = await isParentOfGroup({
      userId,
      groupId,
    });
    const userInGroup = await verifyUserInGroup({ userId, groupId });

    // just parent or member in group can view role detail of group
    if (!isParent && !userInGroup) {
      throw new Response(null, res403);
    }

    const role = await getRoleDetail(params.roleId || '');
    return json({
      role: {
        ...role,
        actionPermissions: groupPermissionsByModule(role.actionPermissions),
      },
    });
  },
  PERMISSIONS.READ_ROLE,
);

export default function RolesDetail() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <>
      <div className="grid space-y-2 bg-secondary p-4 rounded-xl mb-4">
        <Typography className="capitalize" variant="h3">
          {loaderData.role.name}
        </Typography>
        <Breadcrumbs />
      </div>
      <Typography variant="p">{loaderData.role.description}</Typography>

      {_.map(loaderData.role.actionPermissions, actionPermission => (
        <Accordion type="single" collapsible>
          <AccordionItem value={actionPermission.module}>
            <AccordionTrigger className="capitalize">
              {actionPermission?.module}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {_.map(actionPermission.actions, action => (
                  <div key={action._id} className="my-2">
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="text-sm text-blue bg-blue-50 rounded-lg">
                        {action.name}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
}
