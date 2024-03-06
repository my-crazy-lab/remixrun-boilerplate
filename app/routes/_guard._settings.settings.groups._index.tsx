import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { DataTableColumnHeader } from "@/components/ui/table-data/data-table-column-header";
import { DataTableRowActions } from "@/components/ui/table-data/data-table-row-actions";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/table-data/data-table-pagination";
import { DataTableToolbar } from "@/components/ui/table-data/data-table-toolbar";

const dataUser = [
  {
    _id: "R5pRgZqKyhTKRX2Ng",
    city: [
      "Hồ Chí Minh",
      "Hà Nội",
      "Đà Nẵng",
      "Bình Dương",
      "Đồng Nai",
      "Cần Thơ",
      "Hải Phòng",
      "Lâm Đồng",
      "Khánh Hòa",
      "Bangkok",
    ],
    isoCode: "VN",
    services: "",
    username: "myquyen.le",
    emails: "xnguyen9a101@gmail.com",
    ipAddress: "127.0.0.1",
    profile: {
      language: "vi",
      timezone: "Asia/Ho_Chi_Minh",
    },
    teams: ["customer-service", "tasker", "marketing"],
  },
  {
    _id: "ebxuQxvqjcsnonTkY",
    username: "admin",
    emails: "xnguyen9a10@gmail.com",
    email: "xnguyen9a10@gmail.com",
    city: [
      "Hồ Chí Minh",
      "Hà Nội",
      "Đà Nẵng",
      "Bình Dương",
      "Đồng Nai",
      "Cần Thơ",
      "Hải Phòng",
      "Lâm Đồng",
      "Khánh Hòa",
      "Bangkok",
    ],
    districts: [],
    voiceCallStatus: "INACTIVE",
    ipAddress: "127.0.0.1",
    isoCode: "VN",
    teams: ["customer-service", "tasker", "marketing"],
  },
];

const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UserName" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("username")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "emails",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emails" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("emails")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }: any) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] space-x-2 space-y-2 truncate font-medium overflow-visible whitespace-normal">
            {row.getValue("city").map((e: any, index: number) => (
              <Badge key={index}>{e}</Badge>
            ))}
          </span>
        </div>
      );
    },
  },

  {
    id: "actions",
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
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
                  className="h-24 text-center"
                >
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

export default function UsersPage() {
  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Users management
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your users!
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Add group</Button>
          </DialogTrigger>
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
                        value: "next.js",
                        label: "Next.js",
                      },
                      {
                        value: "sveltekit",
                        label: "SvelteKit",
                      },
                      {
                        value: "nuxt.js",
                        label: "Nuxt.js",
                      },
                      {
                        value: "remix",
                        label: "Remix",
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
                        value: "next.js",
                        label: "Next.js",
                      },
                      {
                        value: "sveltekit",
                        label: "SvelteKit",
                      },
                      {
                        value: "nuxt.js",
                        label: "Nuxt.js",
                      },
                      {
                        value: "remix",
                        label: "Remix",
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
                        value: "next.js",
                        label: "Next.js",
                      },
                      {
                        value: "sveltekit",
                        label: "SvelteKit",
                      },
                      {
                        value: "nuxt.js",
                        label: "Nuxt.js",
                      },
                      {
                        value: "remix",
                        label: "Remix",
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
      <DataTable data={dataUser} columns={columns} />
    </div>
  );
}
