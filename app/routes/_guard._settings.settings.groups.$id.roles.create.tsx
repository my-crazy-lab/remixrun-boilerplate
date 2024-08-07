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
import { toast } from '@/components/ui/use-toast';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import _ from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME, PERMISSIONS } from '~/constants/common';
import { hocAction, hocLoader } from '~/hoc/remix';
import { useConfirm } from '~/hooks/useConfirmation';
import { getUserSession } from '~/services/helpers.server';
import {
  createRole,
  getGroupPermissions,
} from '~/services/role-base-access-control.server';
import { commitSession, getSession } from '~/services/session.server';
import type { ActionTypeWithError, LoaderTypeWithError } from '~/types';
import { groupPermissionsByModule } from '~/utils/common';

export const handle = {
  breadcrumb: (data: { groupId: string }) => {
    return (
      <BreadcrumbsLink
        to={`/settings/groups/${data.groupId}/roles/create`}
        label="CREATE_ROLE"
      />
    );
  },
  i18n: 'user-settings',
};

export const action = hocAction(
  async (
    { request, params }: ActionFunctionArgs,
    { setInformationActionHistory },
  ) => {
    const groupId = params.id || '';

    const formData = await request.clone().formData();

    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const permissions =
      JSON.parse(formData.get('permissions')?.toString() || '') || [];

    const role = await createRole({
      name,
      groupId,
      description,
      permissions,
    });
    setInformationActionHistory({
      action: ACTION_NAME.CREATE_ROLE,
      dataRelated: { roleId: role._id },
    });

    const session = await getSession(request.headers.get('cookie'));
    session.flash('flashMessage', `Role ${role?.name} created`);

    const newSession = await commitSession(session);

    return redirect(`/settings/groups/${params.id}`, {
      headers: {
        'Set-Cookie': newSession,
      },
    });
  },
  PERMISSIONS.WRITE_ROLE,
);

export const loader = hocLoader(
  async ({ params, request }: LoaderFunctionArgs) => {
    const groupId = params.id || '';

    const { isSuperUser } = await getUserSession({ headers: request.headers });
    const permissions = await getGroupPermissions({ groupId, isSuperUser });

    return json({
      groupId,
      permissions,
      permissionsGrouped: groupPermissionsByModule(permissions),
    });
  },
  PERMISSIONS.WRITE_ROLE,
);

interface FormData {
  permissions: { [key: string]: boolean };
  name: string;
  description: string;
}

export default function Screen() {
  const actionData = useActionData<ActionTypeWithError<typeof action>>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }

  const { t } = useTranslation('user-settings');
  const loaderData = useLoaderData<LoaderTypeWithError<typeof loader>>();

  const confirm = useConfirm();
  const { register, control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });
  const submit = useSubmit();

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    const permissions: string[] = [];

    Object.entries(data.permissions || []).forEach(item => {
      if (item[1]) {
        permissions.push(item[0]);
      }
    });

    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('permissions', JSON.stringify(permissions));

    const isConfirm = await confirm({
      title: t('EDIT'),
      body: t('ARE_YOU_SURE_EDIT_THIS_RECORD'),
    });

    if (isConfirm) submit(formData, { method: 'post' });
  }

  return (
    <>
      <div className="grid p-4 space-y-2 bg-secondary rounded-xl">
        <Typography variant="h3">{t('CREATE_ROLE')}</Typography>
        <Breadcrumbs />
      </div>

      <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">{t('ROLE_NAME')}</Label>
            <Input
              placeholder={t('ENTER_ROLE_NAME')}
              className="mt-2"
              {...register('name' as const, {
                required: t('THIS_FIELD_IS_REQUIRED'),
              })}
            />
            <ErrorMessageBase name="name" errors={formState.errors} />
          </div>
          <div>
            <Label htmlFor="description">{t('DESCRIPTION')}</Label>
            <Input
              placeholder={t('ENTER_DESCRIPTION')}
              className="mt-2"
              {...register('description' as const, {
                required: t('THIS_FIELD_IS_REQUIRED'),
              })}
            />
            <ErrorMessageBase name="description" errors={formState.errors} />
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
            {t('SAVE_CHANGES')}
          </Button>
        </div>
      </form>
    </>
  );
}
