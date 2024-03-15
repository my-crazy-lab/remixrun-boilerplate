import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import _ from 'lodash';
import { MoveLeft } from 'lucide-react';
import { PERMISSIONS } from '~/constants/common';
import { hocLoader } from '~/hoc/remix';
import { getRoleDetail } from '~/services/role-base-access-control.server';

export const loader = hocLoader(async ({ params }: LoaderFunctionArgs) => {
  if (!params.roleId) return json({ role: {} });
  const role = await getRoleDetail(params.roleId);

  return json({ role });
}, PERMISSIONS.READ_ROLE);

export default function RolesDetail() {
  const loaderData = useLoaderData<any>();
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <>
      <div className="text-2xl px-0 pb-6">
        <div className="flex flex-row items-center text-xl px-0 pb-6 gap-4">
          <Button onClick={goBack}>
            <MoveLeft className="h-5 w-5" />{' '}
          </Button>
          {loaderData.role.actionPermissions[0].actions[0].name}
        </div>
        <p className="text-base mt-2">
          {loaderData.role.actionPermissions[0].actions[0].description}
        </p>
      </div>
      <ScrollArea>
        {_.map(loaderData.role.actionPermissions, (actionPermission: any) => (
          <Accordion type="single" collapsible>
            <AccordionItem value={actionPermission.module}>
              <AccordionTrigger>
                {actionPermission?.module?.toUpperCase()} features
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
      </ScrollArea>
    </>
  );
}
