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
import { useLoaderData, useOutletContext, useSubmit } from '@remix-run/react';
import _ from 'lodash';
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
import { groupPermissionsByModule } from '~/utils/helpers';

interface LoaderData {
  role: ReturnValueIgnorePromise<typeof getRoleDetail>;
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

export interface FormData {
  name: string;
  description: string;
  permissions: string;
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
  const test = useOutletContext();
  console.log(test)

  const submit = useSubmit();

  const getDefaultValues = () => {
    const defaultValues = {
      permissions: {},
      name: role.name || '',
      description: role.description || '',
    };

    role?.actionPermissions?.forEach(permissionFromServer => {
      defaultValues.permissions[permissionFromServer.module] = {};

      permissionFromServer.actions.forEach(action => {
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
  } = useForm<FormData>(getDefaultValues());

  const onSubmit = ({ name, permissions, description }: FormData) => {
    const selectedPermissions: string[] = [];

    role?.actionPermissions?.forEach(actionPermission => {
      actionPermission.actions.forEach(action => {
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
      <div className="flex justify-between items-center bg-secondary p-4 rounded-md">
        <Typography variant='h3'>Edit role</Typography>
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
      <form className='mt-2'>
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
          placeholder="Enter description"
        />
        <ErrorMessageBase name="description" errors={errors} />

        {_.map(role?.actionPermissions, actionPermission => (
          <Accordion
            key={actionPermission.module}
            defaultValue={role?.actionPermissions[0].module}
            type="single"
            collapsible
            className='mt-4'
          >
            <AccordionItem value={actionPermission.module}>
              <AccordionTrigger>
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
      </form>
    </>
  );
}
