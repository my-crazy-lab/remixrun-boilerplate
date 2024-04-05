import { Input } from '@/components/ui/input';
import type { Table } from '@tanstack/react-table';
import debounce from 'lodash/debounce.js';
import React from 'react';
import type { SetURLSearchParams } from 'react-router-dom';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  column: string;
  setSearchParams: SetURLSearchParams;
}

export function DataTableToolbar<TData>({
  table,
  column,
  setSearchParams,
}: DataTableToolbarProps<TData>) {
  const debouncedOnChange = React.useMemo(
    () =>
      debounce(e => {
        setSearchParams(params => {
          params.set(column, e.target.value || '');
          return params;
        });
      }, 500),
    [setSearchParams, column],
  );

  return (
    <Input
      placeholder="Search..."
      value={(table.getColumn(column)?.getFilterValue() as string) ?? ''}
      onChange={event => {
        table.getColumn(column)?.setFilterValue(event.target.value);
        debouncedOnChange(event);
      }}
      className="h-8 w-[150px] lg:w-[250px] block justify-end"
    />
  );
}
