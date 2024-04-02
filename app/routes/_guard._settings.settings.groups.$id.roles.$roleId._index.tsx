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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const loaderData = useLoaderData<LoaderData>();

  return (
    <>
      <div className="text-2xl px-0 pb-6">
        <div className="flex flex-row items-center text-xl px-0 pb-6 gap-4">

          {loaderData.role.name}
        </div>
        <p className="text-base mt-2">{loaderData.role.description}</p>
      </div>
      {_.map(loaderData.role.actionPermissions, actionPermission => (
        <Accordion type="single" collapsible>
          <AccordionItem value={actionPermission.module}>
            <AccordionTrigger>
              {actionPermission?.module?.toUpperCase()} {t('FEATURE')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {_.map(actionPermission.actions, action => (
                  <div key={action._id} className="my-2">
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-sm text-gray-500">
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
