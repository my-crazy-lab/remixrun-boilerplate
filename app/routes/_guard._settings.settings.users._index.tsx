import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import BTaskeeTable from '@/components/btaskee/TableBase';
import Typography from '@/components/btaskee/Typography';
import { DataTableColumnHeader } from '@/components/btaskee/table-data/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/use-toast';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { type LoaderFunctionArgs, json } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME, PERMISSIONS } from '~/constants/common';
import { hocAction } from '~/hoc/remix';
import useGlobalStore from '~/hooks/useGlobalStore';
import i18next from '~/i18next.server';
import { getCities, getUserSession } from '~/services/helpers.server';
import {
  deleteUser,
  getAllChildrenGroupOfUser,
} from '~/services/role-base-access-control.server';
import {
  createNewUser,
  getTotalUsers,
  getUsers,
} from '~/services/settings.server';
import type { Groups, OptionType, ReturnValueIgnorePromise } from '~/types';
import { getPageSizeAndPageIndex, getSkipAndLimit } from '~/utils/helpers';

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink to="/settings/users" label="USERS_MANAGEMENT" />
  ),
};

const columns: ColumnDef<LoaderData['users'][0]>[] = [
  {
    accessorKey: '_id',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue('username')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('email')}
          </span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'cities',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] space-x-2 space-y-2 truncate font-medium overflow-visible whitespace-normal">
            {// TODO fix typing for react hook form
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            row.getValue('cities')?.map((e, index) => (
              <Badge className="bg-blue-50 text-blue rounded-md" key={index}>
                {e}
              </Badge>
            ))}
          </span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <Link to={`/settings/users/${row.getValue('_id')}/edit`}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </Link>
          <Form className="w-full" method="post">
            <button
              style={{ width: '100%' }}
              name="userDeleted"
              value={row.getValue('_id')}
              type="submit">
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </button>
          </Form>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const action = hocAction(
  async ({ request }, { setInformationActionHistory }) => {
    const formData = await request.clone().formData();
    const userDeleted = formData.get('userDeleted')?.toString() || '';

    if (userDeleted) {
      await deleteUser(userDeleted);
      setInformationActionHistory({
        action: ACTION_NAME.DELETE_USER,
      });
    } else {
      const username = formData.get('username')?.toString() || '';
      const email = formData.get('email')?.toString() || '';
      const cities = JSON.parse(formData.get('cities')?.toString() || '') || [];
      const groupIds =
        JSON.parse(formData.get('groupIds')?.toString() || '') || [];

      const { isoCode } = await getUserSession({ headers: request.headers });

      const newUser = await createNewUser({
        username,
        email,
        isoCode,
        cities,
        groupIds,
      });

      setInformationActionHistory({
        action: ACTION_NAME.CREATE_USER,
        dataRelated: { userId: newUser?._id },
      });
    }

    const t = await i18next.getFixedT(request, 'user-settings');

    return json({ message: t('CREATE_USER_SUCCESSFUL') });
  },
  PERMISSIONS.MANAGER,
);

interface LoaderData {
  users: ReturnValueIgnorePromise<typeof getUsers>;
  total: number;
  cities: Array<string>;
  groups: Pick<Groups, 'name' | '_id'>[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const { userId, isoCode } = await getUserSession({
    headers: request.headers,
  });

  const total = await getTotalUsers(userId);
  const { limit, skip } = getSkipAndLimit(
    getPageSizeAndPageIndex({
      total,
      pageSize: Number(url.searchParams.get('pageSize')) || 0,
      pageIndex: Number(url.searchParams.get('pageIndex')) || 0,
    }),
  );

  const users = await getUsers({
    skip,
    limit,
    projection: { _id: 1, cities: 1, username: 1, email: 1 },
    userId,
  });
  const groups = await getAllChildrenGroupOfUser(userId);
  const cities = await getCities(isoCode);

  return json({ users, cities, total, groups });
};

interface FormData {
  email: string;
  cities: Array<OptionType>;
  username: string;
  groupIds: Array<OptionType>;
}

export default function Screen() {
  const actionData = useActionData<{
    error?: string;
    message?: string;
  }>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }
  if (actionData?.message) {
    toast({ variant: 'success', description: actionData.message });
  }

  const { t } = useTranslation(['user-settings']);
  const [searchParams, setSearchParams] = useSearchParams();
  const loaderData = useLoaderData<LoaderData>();
  const globalData = useGlobalStore(state => state);

  const { register, control, reset, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: '',
      cities: [],
      username: '',
      groupIds: [],
    },
  });

  const submit = useSubmit();
  const [open, setOpen] = useState<boolean>(false);

  const onCloseAndReset = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = (data: FormData) => {
    const formData = new FormData();

    formData.append('email', data.email);
    formData.append('cities', JSON.stringify(data.cities?.map(c => c.value)));
    formData.append('username', data.username);
    formData.append(
      'groupIds',
      JSON.stringify(data.groupIds?.map(c => c.value)),
    );

    submit(formData, { method: 'post' });
    onCloseAndReset();
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 flex">
      <div className="flex items-center justify-between space-y-2 bg-secondary p-4 rounded-xl">
        <div className="grid space-y-2">
          <Typography variant="h3">{t('USER_MANAGEMENT')}</Typography>
          <Breadcrumbs />
        </div>
        <Dialog
          open={open}
          onOpenChange={open => {
            if (!open) {
              reset();
            }
            setOpen(open);
          }}>
          {globalData.permissions?.includes(PERMISSIONS.MANAGER) ? (
            <DialogTrigger asChild>
              <Button className="gap-2" variant="default">
                <Plus />
                {t('ADD_NEW_USER')}
              </Button>
            </DialogTrigger>
          ) : null}
          <DialogContent className="sm:max-w-[560px]">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{t('NEW_USER')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    {t('USERNAME')}
                  </Label>
                  <Input
                    {...register('username' as const, {
                      required: true,
                    })}
                    className="col-span-3"
                    placeholder={t('USERNAME')}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    {t('EMAIL')}
                  </Label>
                  <Input
                    {...register('email' as const, {
                      required: true,
                    })}
                    type="email"
                    className="col-span-3"
                    placeholder={t('EMAIL')}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{t('CITIES')}</Label>
                  <div className="col-span-3">
                    <Controller
                      control={control}
                      name="cities"
                      render={({ field: { onChange, value } }) => (
                        <MultiSelect
                          selected={value}
                          setSelected={onChange}
                          isDisplayAllOptions
                          options={loaderData.cities?.map(e => ({
                            label: e,
                            value: e,
                          }))}
                          className="w-[360px]"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{t('GROUPS')}</Label>
                  <div className="col-span-3">
                    <Controller
                      control={control}
                      name="groupIds"
                      render={({ field: { onChange, value } }) => (
                        <MultiSelect
                          selected={value}
                          setSelected={onChange}
                          isDisplayAllOptions
                          options={loaderData.groups?.map(e => ({
                            label: e.name,
                            value: e._id,
                          }))}
                          className="w-[360px]"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t('SAVE_CHANGES')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <BTaskeeTable
        total={loaderData?.total || 0}
        // TODO fix typing for Table
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data={loaderData?.users || []}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        columns={columns}
        pagination={getPageSizeAndPageIndex({
          total: loaderData?.total || 0,
          pageSize: Number(searchParams.get('pageSize') || 0),
          pageIndex: Number(searchParams.get('pageIndex') || 0),
        })}
        setSearchParams={setSearchParams}
      />
    </div>
  );
}
