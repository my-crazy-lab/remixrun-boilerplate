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
import { CheckIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import {
  Toast,
  ToastTitle,
  ToastProvider,
  ToastViewport,
} from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { IActionPermission } from '~/types';
import { json } from '@remix-run/node';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import _ from 'lodash';
import { Slash } from 'lucide-react';
import { PERMISSIONS } from '~/constants/common';
import { hocAction, hocLoader } from '~/hoc/remix';
import { useForm, Controller } from 'react-hook-form';
import {
  getRoleDetail,
  updateRole,
} from '~/services/role-base-access-control.server';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';

const actionPermissions: Array<IActionPermission> = [
  {
    module: 'special',
    actions: [
      {
        _id: 'root',
        name: 'ROOT',
        description: 'This is root user, with all power',
        module: 'special',
      },
    ],
  },
  {
    module: 'tasker',
    actions: [
      {
        _id: 'read:tasker/things-to-know',
        name: 'Read things to know',
        description: 'Read things to know',
        module: 'tasker',
      },
      {
        _id: 'write:tasker/things-to-know',
        name: 'Write things to know',
        description: 'Write things to know',
        module: 'tasker',
        children: [
          {
            _id: 'read:tasker/things-to-know',
          },
        ],
      },
    ],
  },
  {
    module: 'task',
    actions: [
      {
        _id: 'write:task/set-expired-task',
        name: 'Expired task',
        description: 'Set a task is EXPIRED',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/set-date',
        name: 'Update working date',
        description: 'Update working date',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/set-duration',
        name: 'Update working duration',
        description: 'Update working duration',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task/note',
        name: 'Read task note',
        description: 'Read notes of a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/note',
        name: 'Write task note',
        description: 'Write notes of a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/note',
          },
        ],
      },
      {
        _id: 'read:task/viewed-tasker',
        name: 'Read viewed tasker',
        description: 'Read taskers who viewed this task ',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task/accepted-tasker',
        name: 'Read accepted tasker',
        description: 'Read taskers who aceepted this task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/accept-tasker',
        name: 'Update accepted tasker',
        description: 'Add/Remove taskers from accepted tasker list',
        module: 'task',
        children: [
          {
            _id: 'read:task/accepted-tasker',
          },
        ],
      },
      {
        _id: 'read:task/conversation',
        name: 'Read conversation',
        description: 'Read conversation',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task/suport-asker-tasker',
        name: 'Read task support',
        description: 'Read history support asker/tasker ',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task/recommend-tasker',
        name: 'Read recommend tasker',
        description: 'Get recommend taskers for the task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task/cancel-history',
        name: 'Read task canceled history',
        description: 'Read task canceled history',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task/tasker-blacklist',
        name: 'Read blacklist tasker',
        description: 'Read tasker blacklist of a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/tasker-blacklist',
        name: 'Update blacklist tasker',
        description: 'Add/Remove tasker blacklist of a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/tasker-blacklist',
          },
        ],
      },
      {
        _id: 'read:task/changes-history',
        name: 'Read changes history',
        description: 'Read changes history',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/create-schedule',
        name: 'Create schedule',
        description: 'Create schedule based on a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/create-subscription',
        name: 'Create subscription',
        description: 'Create subscription based on a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/support-asker-tasker',
        name: 'Support Task',
        description: 'Support tasker/asker by support amount of money (bPay) ',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/promotion',
        name: 'Create promotion',
        description: 'Create promotion for a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/promotion',
          },
        ],
      },
      {
        _id: 'read:task/promotion',
        name: 'Read promotion',
        description: 'Read promotion code created by a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task-special-list/search',
        name: 'Search task special list',
        description: 'Search/Read task special list',
        module: 'task',
      },
      {
        _id: 'write:task-special-list/search',
        name: 'Update task special list',
        description: 'Change cs_status to CANCEL or DONE',
        module: 'task',
        children: [
          {
            _id: 'read:task-special-list/search',
          },
        ],
      },
      {
        _id: 'read:task-report/search',
        name: 'Search task-report',
        description: 'Search/Read tasks report (in 2 weeks)',
        module: 'task',
      },
      {
        _id: 'read:task-canceled/search',
        name: 'Search task-canceled',
        description: 'Search/Read tasks canceled ',
        module: 'task',
      },
      {
        _id: 'write:task/set-address',
        name: 'Update task place',
        description: 'Update task place of a task',
        module: 'task',
      },
      {
        _id: 'write:task/set-payment-method',
        name: 'Update payment method',
        description: 'Update payment method of a task',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/rating',
        name: 'Rating a task',
        description: 'Rating a task',
        module: 'task',
      },
      {
        _id: 'write:task/write-task-change-asker',
        name: 'Change asker of a task',
        description: 'Change asker of a task',
        module: 'task',
      },
      {
        _id: 'write:task/fine-asker',
        name: 'Fine asker',
        description: 'Fine asker',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'write:task/fine-tasker',
        name: 'Fine tasker',
        description: 'Fine tasker',
        module: 'task',
        children: [
          {
            _id: 'read:task/general-info',
          },
        ],
      },
      {
        _id: 'read:task/compensation-list',
        name: 'Read compensation history',
        description: 'Read compensation history',
        module: 'task',
        children: [],
      },
      {
        _id: 'read:task/penalty-list',
        name: 'Read penalty history',
        description: 'Read penalty history',
        module: 'task',
        children: [],
      },
      {
        _id: 'read:task/refund',
        name: 'Read refund request',
        description: 'Read refund request',
        module: 'task',
      },
      {
        _id: 'write:task/refund',
        name: 'Refund task',
        description: 'Refund task',
        module: 'task',
        children: [
          {
            _id: 'read:task/refund',
          },
        ],
      },
      {
        _id: 'write:task/change-to-posted',
        name: 'write Task Change To Posted',
        description: 'write Task Change To Posted',
        module: 'task',
      },
      {
        _id: 'send:task/send-receipt-email',
        name: 'Send email receipt of task to customer',
        description: 'Send email receipt of task to customer',
        module: 'task',
      },
    ],
  },
];

export const loader = hocLoader(async ({ params }: LoaderFunctionArgs) => {
  if (!params.id) return json({ role: {} });
  const role = await getRoleDetail(params.id);

  return json({ role });
}, PERMISSIONS.WRITE_ROLE);

export interface IFormData {
  name: string;
  description: string;
  permissions: string;
}

export const action = hocAction(
  async (
    { params }: ActionFunctionArgs,
    {
      formData,
    }: {
      formData: IFormData;
    },
  ) => {
    try {
      const { name, description, permissions } = formData;

      updateRole({
        name,
        description,
        permissions: JSON.parse(permissions),
        roleId: params.id,
      });
      return true;
    } catch (err: any) {
      console.log(err);
      return json({ err });
    }
  },
  PERMISSIONS.WRITE_ROLE,
);

export default function EditRole() {
  const { role } = useLoaderData<typeof loader>();
  const isShowSuccess = useActionData<typeof action>()
  const submit = useSubmit();

  const getDefaultValues = () => {
    const defaultValues: any = {
      permissions: {},
      name: role.name || '',
      description: role.description || '',
    };
    actionPermissions.forEach(permissionFromServer => {
      defaultValues.permissions[permissionFromServer.module] = {};

      permissionFromServer.actions.forEach(action => {
        defaultValues.permissions[permissionFromServer.module][action._id] =
          role.permissions.includes(action._id);
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

    actionPermissions.forEach(actionPermission => {
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
    <ToastProvider swipeDirection="right">
      <div className="text-2xl px-0 pb-6 flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" href={`/settings/groups`}>
                Groups
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" href={`/settings/groups/`}>
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>Name</p>
        <Input
          {...register('name', { required: true })}
          className="mt-2"
          placeholder="Enter name..."
        />
        <p className="mt-2">Description</p>
        <Input
          {...register('description', { required: true })}
          className="mt-2"
          placeholder="Enter description..."
        />
        <Separator className="my-4" />

        <p className="mt-2">Permissions</p>
        <ScrollArea className="mt-4 rounded-md border p-4">
          {_.map(actionPermissions, actionPermission => (
            <Accordion
              key={actionPermission.module}
              defaultValue={actionPermissions[0].module}
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
      <Toast className="flex flex-col" open={isShowSuccess}>
        <ToastTitle className="font-bold text-xl text-green-500">
          <div className='flex'>
            <CheckIcon className="mr-2 w-6 h-6" />
            Updated successfully
          </div>
        </ToastTitle>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}
