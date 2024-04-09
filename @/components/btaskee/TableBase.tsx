import { DataTablePagination } from '@/components/btaskee/table-data/data-table-pagination';
import { DataTableToolbar } from '@/components/btaskee/table-data/data-table-toolbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  pagination: PaginationState;
  searchField?: string;
  setSearchParams: () => void;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<TData>) => boolean;
}

const BTaskeeTable = <TData, TValue>({
  data,
  total,
  pagination,
  columns,
  searchField,
  renderSubComponent,
  getRowCanExpand = () => false,
  setSearchParams,
}: DataTableProps<TData, TValue>) => {
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
    getRowCanExpand,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
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
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="space-y-4">
      {searchField && (
        <DataTableToolbar
          column={searchField}
          table={table}
          setSearchParams={setSearchParams}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                className="bg-gray-100 rounded-s-sm"
                key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getCoreRowModel().rows?.length ? (
              table.getCoreRowModel().rows.map(row => (
                <>
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
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
      <DataTablePagination table={table} setSearchParams={setSearchParams} />
    </div>
  );
};

export default BTaskeeTable;
