import CartesianGridBase, {
  type CartesianGridBaseProps,
} from '@/components/base/CartesianGridBase';
import LegendBase from '@/components/base/LegendBase';
import LineBase, { type LineBaseProps } from '@/components/base/LineBase';
import LineChartBase, {
  type LineChartBaseProps,
} from '@/components/base/LineChartBase';
import ResponsiveContainerBase, {
  type ResponsiveContainerBaseProps,
} from '@/components/base/ResponsiveContainerBase';
import TooltipBase from '@/components/base/TooltipBase';
import XAxisBase from '@/components/base/XAxisBase';
import YAxisBase from '@/components/base/YAxisBase';

export interface SimpleLineChartProps extends ResponsiveContainerBaseProps {
  chartProps: Omit<LineChartBaseProps, 'children'>;
  lines: Array<LineBaseProps>;
  xAxisKey: string;
  cartesianProps?: CartesianGridBaseProps;
}

const SimpleLineChart = ({
  chartProps,
  lines,
  xAxisKey,
  cartesianProps,
  ...props
}: SimpleLineChartProps) => (
  <ResponsiveContainerBase {...props}>
    <LineChartBase {...chartProps}>
      <YAxisBase />
      <LegendBase />
      <CartesianGridBase {...cartesianProps} />
      <TooltipBase />
      <XAxisBase dataKey={xAxisKey} />
      {lines?.map((line, idx) => <LineBase key={idx} {...line} />)}
    </LineChartBase>
  </ResponsiveContainerBase>
);

export default SimpleLineChart;
