import { BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import ROUTE_NAME from '~/constants/route';

export const handle = {
  breadcrumb: () => <BreadcrumbsLink to={ROUTE_NAME.GROUP_SETTING} label="GROUPS" />,
};
