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
import { hocLoader } from '~/hoc/remix';
import { getRoleDetail } from '~/services/role-base-access-control.server';
import type { LoaderTypeWithError } from '~/types';
import { groupPermissionsByModule } from '~/utils/common';

export const loader = hocLoader(async ({ params }: LoaderFunctionArgs) => {
  const role = await getRoleDetail(params.roleId || '');
  return json({
    role: {
      ...role,
      actionPermissions: groupPermissionsByModule(role.actionPermissions),
    },
  });
}, PERMISSIONS.READ_ROLE);

export default function RolesDetail() {
  const loaderData = useLoaderData<LoaderTypeWithError<typeof loader>>();

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
        <Accordion type="single" collapsible key={actionPermission.module}>
          <AccordionItem value={actionPermission.module}>
            <AccordionTrigger className="capitalize">
              {actionPermission?.module} permission
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-3">
                {_.map(actionPermission.actions, action => (
                  <div
                    key={action._id}
                    className="my-2 flex items-center gap-2">
                    <Badge className="text-sm text-blue bg-blue-50 rounded-md">
                      {action.name}
                    </Badge>
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
