import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import BTaskeeTable from '@/components/btaskee/TableBase';
import Typography from '@/components/btaskee/Typography';
import { DataTableColumnHeader } from '@/components/btaskee/table-data/data-table-column-header';
import type { SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { type ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocLoader } from '~/hoc/remix';
import { getUserSession } from '~/services/helpers.server';
import {
  getActionsHistoryManagedByManagerId,
  getTotalActionsHistoryManageByManagerId,
} from '~/services/settings.server';
import {
  type LoaderTypeWithError,
  type ReturnValueIgnorePromise,
} from '~/types';
import { getPageSizeAndPageIndex, getSkipAndLimit } from '~/utils/helpers';

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink
      to={ROUTE_NAME.ACTION_HISTORY_SETTING}
      label="ACTIONS_HISTORY"
    />
  ),
  i18n: 'user-settings',
};

const columns: ColumnDef<
  SerializeFrom<
    ReturnValueIgnorePromise<typeof getActionsHistoryManagedByManagerId>[0]
  >
>[] = [
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Name" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.original.user.username}</div>
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
          {moment(row.original.createdAt).local().format('DD/MM/YYYY HH:mm:ss')}
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
            {row.original.action}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'requestFormData',
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

export const loader = hocLoader(async ({ request }) => {
  const url = new URL(request.url);
  const searchText = url.searchParams.get('username') || '';
  const { userId: managerId } = await getUserSession({
    headers: request.headers,
  });

  const total = await getTotalActionsHistoryManageByManagerId({
    searchText,
    managerId,
  });

  const { limit, skip } = getSkipAndLimit(
    getPageSizeAndPageIndex({
      total,
      pageSize: Number(url.searchParams.get('pageSize')) || 0,
      pageIndex: Number(url.searchParams.get('pageIndex')) || 0,
    }),
  );

  const actionsHistory = await getActionsHistoryManagedByManagerId({
    searchText: url.searchParams.get('username') || '',
    skip,
    limit,
    projection: {
      'user.username': 1,
      action: 1,
      requestFormData: 1,
      createdAt: 1,
    },
    managerId,
  });

  return json({ actionsHistory, total });
}, PERMISSIONS.MANAGER);

export default function Screen() {
  const { t } = useTranslation('user-settings');
  const [searchParams, setSearchParams] = useSearchParams();

  const { total, actionsHistory } =
    useLoaderData<LoaderTypeWithError<typeof loader>>();

  return (
    <>
      <div className="grid space-y-2 bg-secondary p-4 rounded-xl mb-4">
        <Typography variant="h3">{t('ACTIONS_HISTORY')}</Typography>
        <Breadcrumbs />
      </div>
      <BTaskeeTable
        total={total}
        data={actionsHistory}
        columns={columns}
        pagination={getPageSizeAndPageIndex({
          total,
          pageSize: Number(searchParams.get('pageSize') || 0),
          pageIndex: Number(searchParams.get('pageIndex') || 0),
        })}
        searchField="username"
        setSearchParams={setSearchParams}
        renderSubComponent={({ row }) => (
          <pre style={{ fontSize: '10px' }}>
            <code>
              {JSON.stringify(row.getValue('requestFormData'), null, 2)}
            </code>
          </pre>
        )}
        getRowCanExpand={() => true}
      />
    </>
  );
}
