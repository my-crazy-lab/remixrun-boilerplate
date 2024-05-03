import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
  isTesting?: boolean;
  statusClasses?: { [key: string]: string };
}

const DefaultStatusClasses: { [key: string]: string } = {
  ACTIVE: 'bg-secondary text-secondary-foreground rounded-md text-center',
  INACTIVE: 'bg-gray-50 text-gray-500 rounded-md text-center',
  DEFAULT: 'bg-blue-50 text-blue rounded-md text-center',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isTesting = false,
  statusClasses = DefaultStatusClasses,
}) => {
  const { t } = useTranslation(['common']);
  const statusClass = statusClasses[status] || statusClasses.DEFAULT;

  return (
    <div className={isTesting ? 'flex flex-col items-center gap-2' : ''}>
      <Badge className={cn(statusClass, 'text-sm font-normal')}>
        {t(status)}
      </Badge>
      {isTesting && (
        <Badge className="bg-blue-50 text-blue rounded-md text-center">
          {t('Data test')}
        </Badge>
      )}
    </div>
  );
};
