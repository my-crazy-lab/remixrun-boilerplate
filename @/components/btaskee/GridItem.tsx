import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export const GridItem = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => {
  return <div className={cn('min-h-16 space-y-2', className)} {...props} />;
};
