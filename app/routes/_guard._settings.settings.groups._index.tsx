import { Button } from '@/components/ui/button';
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
import { MultiSelect } from '@/components/ui/multi-select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table-data/data-table-column-header';
import { DataTablePagination } from '@/components/ui/table-data/data-table-pagination';
import { DataTableRowActions } from '@/components/ui/table-data/data-table-row-actions';
import { DataTableToolbar } from '@/components/ui/table-data/data-table-toolbar';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';
import { PERMISSIONS } from '~/constants/common';
import useGlobalStore from '~/hooks/useGlobalStore';
import { getUserId } from '~/services/helpers.server';
import { getGroupsOfUser } from '~/services/role-base-access-control.server';

const columns: ColumnDef<any>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group Name" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('name')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('description')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'users',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Users" />
    ),
    cell: ({ row }: any) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] space-x-2 space-y-2 truncate font-medium overflow-visible whitespace-normal">
            {row.getValue('users').map((e: any, index: number) => (
              <Badge key={index}>{e.username}</Badge>
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar column="username" table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId({ request });
  const groups = await getGroupsOfUser({
    userId,
    projection: {
      name: 1,
      description: 1,
      'users.username': 1,
      'users.email': 1,
      roles: 1,
      createdAt: 1,
      parent: 1,
      hierarchy: 1,
    },
  });
  return json({ groups });
};

export default function Screen() {
  const loaderData = useLoaderData<{ groups: any }>();
  const globalData = useGlobalStore(state => state);
  console.log(loaderData, globalData, '!!');

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Groups management
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your groups!
          </p>
        </div>
        <Dialog>
          {globalData.permissions.includes(PERMISSIONS.WRITE_GROUP) ? (
            <DialogTrigger asChild>
              <Button variant="outline">Add group</Button>
            </DialogTrigger>
          ) : null}
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>New group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group name
                </Label>
                <Input id="group" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Users</Label>
                <div className="col-span-3">
                  <MultiSelect
                    isDisplayAllOptions
                    options={[
                      {
                        value: 'next.js',
                        label: 'Next.js',
                      },
                      {
                        value: 'sveltekit',
                        label: 'SvelteKit',
                      },
                      {
                        value: 'nuxt.js',
                        label: 'Nuxt.js',
                      },
                      {
                        value: 'remix',
                        label: 'Remix',
                      },
                    ]}
                    className="w-[360px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Roles</Label>
                <div className="col-span-3">
                  <MultiSelect
                    isDisplayAllOptions
                    options={[
                      {
                        value: 'next.js',
                        label: 'Next.js',
                      },
                      {
                        value: 'sveltekit',
                        label: 'SvelteKit',
                      },
                      {
                        value: 'nuxt.js',
                        label: 'Nuxt.js',
                      },
                      {
                        value: 'remix',
                        label: 'Remix',
                      },
                    ]}
                    className="w-[360px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Teams</Label>
                <div className="col-span-3">
                  <MultiSelect
                    isDisplayAllOptions
                    options={[
                      {
                        value: 'next.js',
                        label: 'Next.js',
                      },
                      {
                        value: 'sveltekit',
                        label: 'SvelteKit',
                      },
                      {
                        value: 'nuxt.js',
                        label: 'Nuxt.js',
                      },
                      {
                        value: 'remix',
                        label: 'Remix',
                      },
                    ]}
                    className="w-[360px]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={loaderData.groups} columns={columns} />
    </div>
  );
}
