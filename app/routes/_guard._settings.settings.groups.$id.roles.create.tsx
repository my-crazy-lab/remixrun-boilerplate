import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import _ from 'lodash';
import { MoveLeft } from 'lucide-react';
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

interface FormData {
  name: string;
  description: string;
  permissions: { [key: string]: boolean };
}
export default function Screen() {
  const loaderData = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { register, control, handleSubmit } = useForm<FormData>({
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
      <div className="flex flex-row items-center text-xl px-0 pb-6 gap-4">
        <Button onClick={goBack}>
          <MoveLeft className="h-5 w-5" />{' '}
        </Button>
        Create role
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

        {_.map(loaderData.permissionsGrouped, actionPermission => (
          <Accordion type="single" collapsible key={actionPermission.module}>
            <AccordionItem value={actionPermission.module}>
              <AccordionTrigger>
                {actionPermission.module?.toUpperCase()}
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
