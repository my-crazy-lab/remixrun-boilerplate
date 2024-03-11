import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ThickArrowLeftIcon } from "@radix-ui/react-icons";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "@remix-run/node";
import {
  json,
  redirect,
} from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import _ from "lodash";
import { PERMISSIONS } from "~/constants/common";
import { hocAction, hocLoader } from "~/hoc/remix";
import {
  createRole,
  getGroupPermissions
} from "~/services/role-base-access-control.server";

export const action = hocAction(
  async ({ params }: ActionFunctionArgs, { formData }: any) => {
    try {
      const { name, description, permissions } = formData;
      await createRole({
        name,
        description,
        permissions: JSON.parse(permissions),
      });

      return redirect(`/settings/groups/${params.id}`);
    } catch (err: any) {
      console.log(err);
      return json({ err });
    }
  },
  PERMISSIONS.WRITE_ROLE,
);

export const loader = hocLoader(async ({ params }: LoaderFunctionArgs) => {
  const permissions = await getGroupPermissions(params.id || "");

  function groupPermissionsByModule() {
    return Object.values(
      permissions.reduce((acc: any, { module, ...rest }: any) => {
        if (!acc[module]) {
          acc[module] = { module, actions: [] };
        }
        acc[module].actions.push({ ...rest });
        return acc;
      }, {}),
    );
  }

  return json({ permissions: groupPermissionsByModule() });
}, PERMISSIONS.WRITE_ROLE);

export default function RolesDetail() {
  const params = useParams();
  const loaderData = useLoaderData<any>();

  console.log(loaderData);

  return (
    <Card className="p-4">
      <CardHeader className="flex-row flex font-bold text-xl items-center px-0">
        <Link to={`/settings/groups/${params.id}`}>
          <ThickArrowLeftIcon className="cursor-pointer mr-2 h-5 w-5" /> New
          role
        </Link>
      </CardHeader>
      <p className="my-4">Role name</p>
      <Input placeholder="Role"></Input>
      <Separator className="my-4" />
      {_.map(loaderData.permissions, (actionPermission: any) => (
        <Accordion type="single" collapsible>
          <AccordionItem value={actionPermission.module}>
            <AccordionTrigger>
              {actionPermission?.module?.toUpperCase()} features
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {_.map(actionPermission.actions, (action) => (
                  <div key={action._id} className="my-2">
                    <Label
                      htmlFor={action._id}
                      className="block text-base font-medium text-gray-700"
                    >
                      {action.name}
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Switch id={action._id} />
                      <Label
                        className="text-sm text-gray-500"
                        htmlFor={action._id}
                      >
                        {action.description}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

      <div className="gap-4 flex justify-end mt-4">
        <Button variant="outline">Cancel</Button>
        <Button variant="default" color="primary">
          Create
        </Button>
      </div>
    </Card>
  );
}
