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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect, type OptionType } from '@/components/ui/multi-select';

import { DataTableColumnHeader } from '@/components/btaskee/table-data/data-table-column-header';
import { DataTableRowActions } from '@/components/btaskee/table-data/data-table-row-actions';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams, useSubmit } from '@remix-run/react';

import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import BTaskeeTable from '@/components/btaskee/TableBase';
import Typography from '@/components/btaskee/Typography';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ERROR, PERMISSIONS } from '~/constants/common';
import { hocAction } from '~/hoc/remix';
import {
  createNewUser,
  getTotalUsers,
  getUsers,
} from '~/services/settings.server';
import { type ReturnValueIgnorePromise } from '~/types';
import { getPageSizeAndPageIndex, getSkipAndLimit } from '~/utils/helpers';

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink to="/settings/users" label="Users management" />
  ),
};

const columns: ColumnDef<LoaderData['users'][0]>[] = [
  {
    id: 'select',
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
      <DataTableColumnHeader column={column} title="UserName" />
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
            {row.getValue('cities')?.map((e, index) => (
              <Badge variant="secondary" key={index}>
                {e}
              </Badge>
            ))}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

export const action = hocAction(async ({}, { formData }) => {
  try {
    const { username, email, password, cities } = formData;

    await createNewUser({
      username,
      password,
      email,
      cities: JSON.parse(cities) || [],
    });

    return null;
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message });
    }
    return json({ error: ERROR.UNKNOWN_ERROR });
  }
}, PERMISSIONS.WRITE_USER);

interface LoaderData {
  users: ReturnValueIgnorePromise<typeof getUsers>;
  total: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const total = await getTotalUsers();

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
    projection: { cities: 1, username: 1, email: 1 },
  });
  return json({ users, total });
};

interface FormData {
  email: string;
  password: string;
  cities: Array<OptionType>;
  username: string;
}

export default function Screen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const loaderData = useLoaderData<LoaderData>();

  const { register, control, reset, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      cities: [],
      username: '',
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
    formData.append('password', data.password);
    formData.append('cities', JSON.stringify(data.cities.map(c => c.value)));
    formData.append('username', data.username);

    submit(formData, { method: 'post' });
    onCloseAndReset();
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 flex">
      <div className="flex items-center justify-between space-y-2 bg-secondary p-4 rounded-xl">
        <div className="grid space-y-2">
          <Typography variant="h2"> Users management</Typography>
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
          <DialogTrigger asChild>
            <Button className="gap-2" variant="default">
              <Plus /> Add new user
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>New user</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    {...register('username' as const, {
                      required: true,
                    })}
                    className="col-span-3"
                    placeholder="Username"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    {...register('email' as const, {
                      required: true,
                    })}
                    type="email"
                    className="col-span-3"
                    placeholder="Email"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    {...register('password' as const, {
                      required: true,
                    })}
                    autoComplete="off"
                    type="password"
                    className="col-span-3"
                    placeholder="Password"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Cities</Label>
                  <div className="col-span-3">
                    <Controller
                      control={control}
                      name="cities"
                      render={({ field: { onChange, value } }) => (
                        <MultiSelect
                          selected={value}
                          setSelected={onChange}
                          isDisplayAllOptions
                          options={[
                            {
                              value: 'HCM',
                              label: 'Ho Chi Minh',
                            },
                            {
                              value: 'HN',
                              label: 'Hanoi',
                            },
                            {
                              value: 'DT',
                              label: 'Dong Thap',
                            },
                          ]}
                          className="w-[360px]"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <BTaskeeTable
        total={loaderData?.total || 0}
        data={loaderData?.users || []}
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
