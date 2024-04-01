import BTaskeeTable from '@/components/btaskee/TableBase';
import Typography from '@/components/btaskee/Typography';
import { DataTableColumnHeader } from '@/components/btaskee/table-data/data-table-column-header';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';
import {
  getActionsHistory,
  getTotalActionsHistory,
} from '~/services/settings.server';
import { getPageSizeAndPageIndex, getSkipAndLimit } from '~/utils/helpers';

interface IActionsHistory {
  _id: string;
  userId: string;
  action: string;
  data: unknown;
  createdAt: Date;
}

const columns: ColumnDef<IActionsHistory>[] = [
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Name" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue('username')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created Date" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate font-medium">
          {moment(row.getValue('createdAt'))
            .local()
            .format('DD/MM/YYYY HH:mm:ss')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('action')}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'data',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data" />
    ),
    cell: ({ row }) => (
      <button
        {...{
          onClick: row.getToggleExpandedHandler(),
          style: { cursor: 'pointer' },
        }}>
        {row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
      </button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchText = url.searchParams.get('username') || '';
  const total = await getTotalActionsHistory({
    searchText,
  });

  const { limit, skip } = getSkipAndLimit(
    getPageSizeAndPageIndex({
      total,
      pageSize: Number(url.searchParams.get('pageSize')) || 0,
      pageIndex: Number(url.searchParams.get('pageIndex')) || 0,
    }),
  );

  const actionsHistory = await getActionsHistory({
    searchText: url.searchParams.get('username') || '',
    skip,
    limit,
    projection: {
      username: '$user.username',
      action: 1,
      data: 1,
      createdAt: 1,
    },
  });

  return json({ actionsHistory, total });
};

const renderSubComponent = ({ row }: { row: Row<any> }) => (
  <pre style={{ fontSize: '10px' }}>
    <code>{JSON.stringify(row.getValue('data'), null, 2)}</code>
  </pre>
);

export default function Screen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { total, actionsHistory } = useLoaderData<{
    total: number;
    actionsHistory: [IActionsHistory];
  }>();

  return (
    <>
      <div className="flex items-center justify-between space-y-2 bg-secondary p-4 rounded-xl mb-4">
        <Typography variant='h3'>Actions history</Typography>
      </div>

      <BTaskeeTable
        total={total || 0}
        data={actionsHistory || []}
        columns={columns}
        pagination={getPageSizeAndPageIndex({
          total: total || 0,
          pageSize: Number(searchParams.get('pageSize') || 0),
          pageIndex: Number(searchParams.get('pageIndex') || 0),
        })}
        searchField="username"
        setSearchParams={setSearchParams}
        renderSubComponent={renderSubComponent}
        getRowCanExpand={() => true}
      />
    </>
  );
}
