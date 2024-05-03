import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export const Grid = ({ className, ...props }: HTMLAttributes<HTMLElement>) => {
  return (
    <div className={cn('grid-auto-fill-md grid gap-2', className)} {...props} />
  );
};
