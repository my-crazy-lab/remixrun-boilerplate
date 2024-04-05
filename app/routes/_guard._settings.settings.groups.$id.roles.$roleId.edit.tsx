import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import ErrorMessageBase from '@/components/btaskee/MessageBase';
import Typography from '@/components/btaskee/Typography';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import _ from 'lodash';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ERROR, PERMISSIONS } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction, hocLoader, res403 } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  getGroupPermissions,
  getRoleDetail,
  isParentOfGroup,
  updateRole,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import { type ReturnValueIgnorePromise } from '~/types';
import { groupPermissionsByModule } from '~/utils/common';

export const handle = {
  breadcrumb: () => <BreadcrumbsLink to="/settings/groups" label="Edit role" />,
};

interface LoaderData {
  role: ReturnValueIgnorePromise<typeof getRoleDetail>;
  activePermissions: ReturnValueIgnorePromise<typeof getGroupPermissions>;
  allPermissionsAvailable: ReturnType<typeof groupPermissionsByModule>;
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

    if (!isParent && !userInGroup) {
      throw new Response(null, res403);
    }

    const role = await getRoleDetail(params.roleId || '');
    const permissions = await getGroupPermissions(groupId);

    return json({
      role,
      activePermissions: permissions,
      allPermissionsAvailable: groupPermissionsByModule(permissions), // use to display in UI
    });
  },
  PERMISSIONS.WRITE_ROLE,
);

export interface FormData {
  name: string;
  description: string;
  permissions: { [key: string]: boolean };
}

export const action = hocAction(
  async ({ params }: ActionFunctionArgs, { formData }) => {
    try {
      const { name, description, permissions } = formData;
      await updateRole({
        name,
        description,
        permissions: JSON.parse(permissions),
        roleId: params.roleId || '',
      });

      return redirect(`${ROUTE_NAME.GROUP_SETTING}/${params.id}`);
    } catch (error) {
      if (error instanceof Error) {
        return json({ error: error.message });
      }
      return json({ error: ERROR.UNKNOWN_ERROR });
    }
  },
  PERMISSIONS.WRITE_ROLE,
);

export default function Screen() {
  const { role } = useLoaderData<LoaderData>();
  const loaderData = useLoaderData<LoaderData>();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    setValue('name', loaderData.role.name);
    setValue('description', loaderData.role.description);

    const permissionMap: Record<string, boolean> = {};
    const currentPermissionsMap: Record<string, boolean> = {};
    for (const permission of loaderData.role.actionPermissions) {
      currentPermissionsMap[permission._id] = true;
    }
    for (const permission of loaderData.activePermissions) {
      permissionMap[permission._id] = Boolean(
        currentPermissionsMap[permission._id],
      );
    }

    setValue('permissions', permissionMap);
  }, [loaderData.role, loaderData.activePermissions, setValue]);

  const submit = useSubmit();

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    const permissions: string[] = [];

    Object.entries(data.permissions).forEach(item => {
      if (item[1]) {
        permissions.push(item[0]);
      }
    });

    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('permissions', JSON.stringify(permissions));

    submit(formData, { method: 'post' });
  };

  return (
    <>
      <div className="grid p-4 space-y-2 bg-secondary rounded-xl">
        <Typography variant="h4">Edit role</Typography>
        <Breadcrumbs />
      </div>
      <form className="mt-4 ">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Role name</Label>
            <Input
              {...register('name', { required: 'Please enter name role' })}
              className="mt-2"
              placeholder="Enter name..."
            />
            <ErrorMessageBase name="name" errors={errors} />
          </div>
          <div>
            <Label htmlFor="name">Role description</Label>
            <Input
              {...register('description', {
                required: 'Please enter name description',
              })}
              className="mt-2"
              placeholder="Enter description"
            />
            <ErrorMessageBase name="description" errors={errors} />
          </div>
        </div>
        {_.map(role?.actionPermissions, actionPermission => (
          <Accordion
            key={actionPermission.module}
            defaultValue={role?.actionPermissions[0].module}
            type="single"
            collapsible
            className="mt-4">
            <AccordionItem value={actionPermission.module}>
              <AccordionTrigger className="capitalize">
                {actionPermission?.module}
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

        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="default"
            type="submit"
            color="primary">
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
