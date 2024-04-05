import CartesianGridBase, {
  type CartesianGridBaseProps,
} from '~/Base/CartesianGridBase';
import LegendBase from '~/Base/LegendBase';
import LineBase, { type LineBaseProps } from '~/Base/LineBase';
import LineChartBase, {
  type LineChartBaseProps,
} from '~/Base/LineChartBase';
import ResponsiveContainerBase, {
  type ResponsiveContainerBaseProps,
} from '~/Base/ResponsiveContainerBase';
import TooltipBase from '~/Base/TooltipBase';
import XAxisBase from '~/Base/XAxisBase';
import YAxisBase from '~/Base/YAxisBase';

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
