import { defaultPageSize } from '@/components/ui/table-data/data-table-pagination';
import { type PaginationState } from '@tanstack/react-table';
import { type NonEmptyArray, type Permissions } from '~/types';

export function findClosest({
  arr,
  v,
  defaultValue,
}: {
  arr: NonEmptyArray<number>;
  v: number;
  defaultValue: number;
}): number {
  const arrSorted = [...arr];
  arrSorted.sort((a, b) => a - b);

  if (v < arrSorted[0]) return defaultValue;

  let closest = arrSorted[0];
  let minDiff = Math.abs(v - closest);

  for (const num of arrSorted) {
    const diff = v - num;
    if (diff < 0) {
      break;
    }
    closest = num;
    minDiff = diff;
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
    v: pageSize,
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

export const mapReplacer = (key: any, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    };
  }
  return value;
};

export const mapReviver: Parameters<JSON['parse']>[1] = (
  _: any,
  value: any,
) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
};
