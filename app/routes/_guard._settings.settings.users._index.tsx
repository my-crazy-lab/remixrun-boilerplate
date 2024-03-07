import { Button } from "@/components/ui/button";
import { useNavigate } from "@remix-run/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableColumnHeader } from "@/components/ui/table-data/data-table-column-header";
import { DataTableRowActions } from "@/components/ui/table-data/data-table-row-actions";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
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
import {
  DataTablePagination,
  defaultPageSize,
} from "@/components/ui/table-data/data-table-pagination";
import { DataTableToolbar } from "@/components/ui/table-data/data-table-toolbar";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  createNewUser,
  getGroupsByUser,
  getTotalUsers,
  getUsers,
} from "~/services/settings.server";
import {
  useLoaderData,
  useLocation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import {
  findClosest,
  getPageSieAndPageIndex,
  getSkipAndLimit,
} from "~/utils/helpers";
import { getSession } from "~/services/session.server";
import { useForm } from "react-hook-form";

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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("email")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cities",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }: any) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] space-x-2 space-y-2 truncate font-medium overflow-visible whitespace-normal">
            {row
              ?.getValue("cities")
              .map((e: any, index: number) => <Badge key={index}>{e}</Badge>)}
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

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const { username, email, password, cities, groupIds } =
      Object.fromEntries(formData);

    await createNewUser({
      username,
      password,
      email,
      cities: JSON.parse(cities),
      groupsIds: JSON.parse(groupIds),
    });

    return null;
  } catch (error: any) {
    return error;
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const total = await getTotalUsers();

  const { limit, skip } = getSkipAndLimit(
    getPageSieAndPageIndex({
      total,
      pageSize: Number(url.searchParams.get("pageSize")) || 0,
      pageIndex: Number(url.searchParams.get("pageIndex")) || 0,
    }),
  );

  const users = await getUsers({
    skip,
    limit,
    projection: { cities: 1, username: 1, email: 1 },
  });
  const session = await getSession(request.headers.get("cookie"));
  const groups = await getGroupsByUser({
    userId: session.get("user").userId,
    projection: { name: 1 },
  });
  return json({ users, total, groups });
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  pagination: PaginationState;
  setSearchParams: any;
}

function BtaskeeTable<TData, TValue>({
  columns,
  data,
  total,
  pagination,
  setSearchParams,
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
      pagination: pagination,
    },
    rowCount: total,
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
            {table.getCoreRowModel().rows?.length ? (
              table.getCoreRowModel().rows.map((row) => (
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
      <DataTablePagination table={table} setSearchParams={setSearchParams} />
    </div>
  );
}

export default function Screen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const loaderData = useLoaderData();
  console.log(loaderData);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      email: "",
      password: "",
      cities: ["HCM", "HN"],
      groupIds: [],
      username: "",
    },
  });
  const submit = useSubmit();

  const onSubmit = (data: any) => {
    console.log(data, "submit form");

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("cities", JSON.stringify(data.cities));
    formData.append("groupIds", JSON.stringify(data.groupIds));
    formData.append("username", data.username);

    submit(formData, { method: "post" });
  };
  console.log(errors);

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
            <Button variant="outline">Add new user</Button>
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
                    {...register("username" as const, {
                      required: true,
                    })}
                    id="username"
                    className="col-span-3"
                    placeholder="Username"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    {...register("email" as const, {
                      required: true,
                    })}
                    id="email"
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
                    {...register("password" as const, {
                      required: true,
                    })}
                    autoComplete="off"
                    id="password"
                    type="password"
                    className="col-span-3"
                    placeholder="Password"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Cities</Label>
                  <div className="col-span-3">
                    <MultiSelect
                      isDisplayAllOptions
                      options={[
                        {
                          value: "HCM",
                          label: "Ho Chi Minh",
                        },
                        {
                          value: "HN",
                          label: "Hanoi",
                        },
                      ]}
                      className="w-[360px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Groups</Label>
                  <div className="col-span-3">
                    <MultiSelect
                      options={loaderData?.groups?.map((e) => ({
                        value: e._id,
                        label: e.name,
                      }))}
                      className="w-[360px]"
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

      <BtaskeeTable
        total={loaderData?.total || 0}
        data={loaderData?.users || []}
        columns={columns}
        pagination={getPageSieAndPageIndex({
          total: loaderData?.total || 0,
          pageSize: Number(searchParams.get("pageSize") || 0),
          pageIndex: Number(searchParams.get("pageIndex") || 0),
        })}
        setSearchParams={setSearchParams}
      />
    </div>
  );
}
