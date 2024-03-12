import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ThickArrowLeftIcon } from '@radix-ui/react-icons';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData, useParams, useSubmit } from '@remix-run/react';
import _ from 'lodash';
import React from 'react';
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
    <Card className="p-4">
      <CardHeader className="flex-row flex font-bold text-xl items-center px-0">
        <Link to={`/settings/groups/${params.id}`}>
          <ThickArrowLeftIcon className="cursor-pointer mr-2 h-5 w-5" />
        </Link>
        New role
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Label className="text-left" htmlFor="name">
          Role name
        </Label>
        <Input
          placeholder="Role"
          {...register('name' as const, { required: true })}></Input>
        <Label className="text-left" htmlFor="description">
          Description
        </Label>
        <Input
          placeholder="Role"
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
          <Button variant="outline">Cancel</Button>
          <Button variant="default" type="submit" color="primary">
            Create
          </Button>
        </div>
      </form>
    </Card>
  );
}
