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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData, useParams, useSubmit } from '@remix-run/react';
import _ from 'lodash';
import { Slash } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { PERMISSIONS } from '~/constants/common';
import { hocAction, hocLoader } from '~/hoc/remix';
import {
  createRole,
  getGroupPermissions,
} from '~/services/role-base-access-control.server';
import { groupPermissionsByModule } from '~/utils/helpers';

export const action = hocAction(
  async ({ params }: ActionFunctionArgs, { formData }: any) => {
    try {
      const { name, description, permissions } = formData;
      await createRole({
        name,
        groupId: params.id,
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
  const permissions = await getGroupPermissions(params.id || '');

  return json({
    permissions,
    permissionsGrouped: groupPermissionsByModule(permissions),
  });
}, PERMISSIONS.WRITE_ROLE);

export default function RolesDetail() {
  const params = useParams();
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

  const onSubmit = (data: any) => {
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
  console.log(loaderData);

  return (
    <>
      <div className="flex justify-between items-center text-2xl px-0 pb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" to="/settings/groups">
                Groups
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-lg"
                to={`/settings/groups/${params.id}`}>
                {/* {loaderData.group.name} */}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg">Create role</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Label className="text-left" htmlFor="name">
          Role name
        </Label>
        <Input
          placeholder="Role"
          {...register('name' as const, { required: true })}></Input>
        <Label className="text-left mt-4" htmlFor="description">
          Description
        </Label>
        <Input
          placeholder="Description"
          {...register('description' as const, { required: true })}></Input>
        <Separator className="my-4" />

        {_.map(loaderData.permissionsGrouped, (actionPermission: any) => (
          <Accordion type="single" collapsible key={actionPermission._id}>
            <AccordionItem value={actionPermission.module}>
              <AccordionTrigger>
                {actionPermission?.module?.toUpperCase()}
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

        <div className="gap-4 flex justify-end mt-4">
          <Link to={`/settings/groups/${params.id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="default" type="submit" color="primary">
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
