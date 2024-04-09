import { ResponsiveContainer, type ResponsiveContainerProps } from 'recharts';

export type ResponsiveContainerBaseProps = Omit<
  ResponsiveContainerProps,
  'children'
>;

const ResponsiveContainerBase = ResponsiveContainer;

export default ResponsiveContainerBase;
