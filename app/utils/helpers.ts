import { defaultPageSize } from '@/components/btaskee/table-data/data-table-pagination';
import { type PaginationState } from '@tanstack/react-table';
import { type NonEmptyArray } from '~/types';

export function findClosest({
  arr,
  valueChecking,
  defaultValue,
}: {
  arr: NonEmptyArray<number>;
  valueChecking: number;
  defaultValue: number;
}): number {
  const arrSorted = [...arr];
  arrSorted.sort((a, b) => a - b);

  if (valueChecking < arrSorted[0]) return defaultValue;

  let closest = arrSorted[0];

  for (const itemOfArrSorted of arrSorted) {
    const diff = valueChecking - itemOfArrSorted;
    if (diff < 0) {
      break;
    }
    closest = itemOfArrSorted;
  }

  return closest;
}

export function getSkipAndLimit({ pageSize, pageIndex }: PaginationState) {
  return { skip: pageSize * pageIndex, limit: pageSize };
}

export function getPageSizeAndPageIndex({
  total,
  pageIndex,
  pageSize,
}: { total: number } & PaginationState) {
  const pageSizeVerified = findClosest({
    arr: [...defaultPageSize],
    valueChecking: pageSize,
    defaultValue: defaultPageSize[0],
  });
  const maxIndex = Math.floor(total / pageSizeVerified);

  if (maxIndex < pageIndex) {
    return {
      pageIndex: maxIndex,
      pageSize: pageSizeVerified,
    };
  }
  return {
    pageSize: pageSizeVerified,
    pageIndex,
  };
}
