import { Table } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  column: string;
}

export function DataTableToolbar<TData>({
  table,
  column,
}: DataTableToolbarProps<TData>) {
  return (
    <Input
      placeholder="Search..."
      value={(table.getColumn(column)?.getFilterValue() as string) ?? ''}
      onChange={event =>
        table.getColumn(column)?.setFilterValue(event.target.value)
      }
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
}
