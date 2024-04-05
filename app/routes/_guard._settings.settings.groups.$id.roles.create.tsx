import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
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
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import _ from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { ERROR, PERMISSIONS } from '~/constants/common';
import { hocAction, hocLoader, res403 } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import {
  createRole,
  getGroupPermissions,
  isParentOfGroup,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import { type ReturnValueIgnorePromise } from '~/types';
import { groupPermissionsByModule } from '~/utils/common';

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink to="/settings/groups" label="Create role" />
  ),
};

export const action = hocAction(
  async ({ params }: ActionFunctionArgs, { formData }) => {
    try {
      const { name, description, permissions } = formData;
      await createRole({
        name,
        groupId: params.id || '',
        description,
        permissions: JSON.parse(permissions),
      });

      return redirect(`/settings/groups/${params.id}`);
    } catch (error) {
      if (error instanceof Error) {
        return json({ error: error.message });
      }
      return json({ error: ERROR.UNKNOWN_ERROR });
    }
  },
  PERMISSIONS.WRITE_ROLE,
);

interface LoaderData {
  permissions: ReturnValueIgnorePromise<typeof getGroupPermissions>;
  permissionsGrouped: ReturnType<typeof groupPermissionsByModule>;
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

    const permissions = await getGroupPermissions(groupId);

    return json({
      permissions,
      permissionsGrouped: groupPermissionsByModule(permissions),
    });
  },
  PERMISSIONS.WRITE_ROLE,
);

export default function Screen() {
  const loaderData = useLoaderData<any>();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      name: '',
      description: '',
    },
  });
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
        <Typography variant="h4">Create role</Typography>
        <Breadcrumbs />
      </div>

      <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Role name</Label>
            <Input
              placeholder="Enter role name"
              className="mt-2"
              {...register('name' as const, { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              placeholder="Enter description"
              className="mt-2"
              {...register('description' as const, { required: true })}
            />
          </div>
        </div>

        {_.map(loaderData.permissionsGrouped, actionPermission => (
          <Accordion type="single" collapsible key={actionPermission.module}>
            <AccordionItem value={actionPermission.module}>
              <AccordionTrigger className="capitalize">
                {actionPermission?.module}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {_.map(actionPermission.actions, action => (
                    <div key={action._id} className="my-2">
                      <Label
                        htmlFor={action._id}
                        className="block text-base font-medium text-gray-700">
                        {action.name}
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Controller
                          control={control}
                          name={`permissions.${action._id}`}
                          render={({ field: { value, onChange } }) => (
                            <Switch
                              checked={value}
                              onCheckedChange={onChange}
                            />
                          )}
                        />
                        <Label
                          className="text-sm text-gray-500"
                          htmlFor={`permissions.${action._id}`}>
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

        <div className="flex justify-end mt-4">
          <Button variant="default" type="submit" color="primary">
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
