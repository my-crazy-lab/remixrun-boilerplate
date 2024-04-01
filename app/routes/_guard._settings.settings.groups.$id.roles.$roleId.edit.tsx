import ErrorMessageBase from '@/components/btaskee/MessageBase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import _ from 'lodash';
import { Slash } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { PERMISSIONS } from '~/constants/common';
import ROUTE_LINK from '~/constants/routeURL';
import { hocAction, hocLoader, res403 } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  getGroupPermissions,
  getRoleDetail,
  isParentOfGroup,
  updateRole,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import { groupPermissionsByModule } from '~/utils/helpers';

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const groupId = params.id || '';
    const userId = await getUserId({ request });

    const isParent = await isParentOfGroup({
      userId,
      groupId,
    });
    const userInGroup = await verifyUserInGroup({ userId, groupId });
    if (!isParent && !userInGroup) {
      throw new Response(null, res403);
    }

    if (!params.roleId) return json({ role: {} });
    const role = await getRoleDetail(params.roleId);

    const permissions = await getGroupPermissions(groupId);
    return json({
      role,
      groupPermissions: {
        permissions,
        actionPermissions: groupPermissionsByModule(permissions),
      },
    });
  },
  PERMISSIONS.WRITE_ROLE,
);

export interface IFormData {
  formData: {
    name: string;
    description: string;
    permissions: string;
  };
}

export const action = hocAction(
  async ({ params }: ActionFunctionArgs, { formData }: IFormData) => {
    try {
      const { name, description, permissions } = formData;
      updateRole({
        name,
        description,
        permissions: JSON.parse(permissions),
        roleId: params.roleId,
      });

      return redirect(`${ROUTE_LINK.GROUP_SETTING}/${params.id}`);
    } catch (err: any) {
      return json({ err });
    }
  },
  PERMISSIONS.WRITE_ROLE,
);

export default function Screen() {
  const { role, groupPermissions } = useLoaderData<typeof loader>();
  console.log(role, groupPermissions);

  const submit = useSubmit();

  const getDefaultValues = () => {
    const defaultValues: any = {
      permissions: {},
      name: role.name || '',
      description: role.description || '',
    };

    role?.actionPermissions?.forEach((permissionFromServer: any) => {
      defaultValues.permissions[permissionFromServer.module] = {};

      permissionFromServer.actions.forEach((action: any) => {
        defaultValues.permissions[permissionFromServer.module][action._id] =
          role?.permissions?.includes(action._id) || false;
      });
    });

    return {
      defaultValues,
    };
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>(getDefaultValues());

  const onSubmit = ({
    name,
    permissions,
    description,
  }: {
    name: string;
    permissions: any;
    description: string;
  }) => {
    const selectedPermissions: string[] = [];

    role?.actionPermissions?.forEach((actionPermission: any) => {
      actionPermission.actions.forEach((action: any) => {
        if (permissions?.[actionPermission.module]?.[action._id]) {
          selectedPermissions.push(action._id);
        }
      });
    });

    submit(
      { name, description, permissions: JSON.stringify(selectedPermissions) },
      { method: 'post' },
    );
  };

  return (
    <>
      <div className="text-2xl px-0 pb-6 flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" to={ROUTE_LINK.GROUP_SETTING}>
                Groups
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" to={ROUTE_LINK.GROUP_SETTING}>
                Group root
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg">Edit role</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="gap-4 flex mt-4">
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="default"
            type="submit"
            color="primary">
            Save changes
          </Button>
        </div>
      </div>
      <form>
        <p>Name</p>
        <Input
          {...register('name', { required: 'Please enter name role' })}
          className="mt-2"
          placeholder="Enter name..."
        />
        <ErrorMessageBase name="name" errors={errors} />
        <p className="mt-2">Description</p>
        <Input
          {...register('description', {
            required: 'Please enter name description',
          })}
          className="mt-2"
          placeholder="Enter description..."
        />
        <ErrorMessageBase name="description" errors={errors} />
        <Separator className="my-4" />
        <p className="mt-2">Permissions</p>
        <ScrollArea className="mt-4 rounded-md border p-4">
          {_.map(role?.actionPermissions, actionPermission => (
            <Accordion
              key={actionPermission.module}
              defaultValue={role?.actionPermissions[0].module}
              type="single"
              collapsible>
              <AccordionItem value={actionPermission.module}>
                <AccordionTrigger>
                  {actionPermission?.module?.toUpperCase()} features
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {_.map(actionPermission.actions, action => (
                      <Controller
                        key={action._id}
                        control={control}
                        name={`permissions.${actionPermission.module}.${action._id}`}
                        render={({ field: { onChange, value } }) => (
                          <div key={action._id} className="my-2">
                            <Label
                              htmlFor={action._id}
                              className="block text-base font-medium text-gray-700">
                              {action.name}
                            </Label>
                            <div className="mt-1 flex items-center gap-2">
                              <Switch
                                onCheckedChange={onChange}
                                checked={value}
                              />
                              <Label
                                className="text-sm text-gray-500"
                                htmlFor={action._id}>
                                {action.description}
                              </Label>
                            </div>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </ScrollArea>
      </form>
    </>
  );
}
