import BarBase, { type BarBaseProps } from '~/Base/BarBase';
import BarChartBase, { type BarChartProps } from '~/Base/BarChartBase';
import CartesianGridBase, {
  type CartesianGridBaseProps,
} from '~/Base/CartesianGridBase';
import LegendBase from '~/Base/LegendBase';
import ResponsiveContainerBase, {
  type ResponsiveContainerBaseProps,
} from '~/Base/ResponsiveContainerBase';
import TooltipBase from '~/Base/TooltipBase';
import XAxisBase from '~/Base/XAxisBase';
import YAxisBase from '~/Base/YAxisBase';

export interface SimpleBarChartProps extends ResponsiveContainerBaseProps {
  chartProps: BarChartProps;
  cartesianProps?: CartesianGridBaseProps;
  bars: Array<BarBaseProps>;
  xAxisKey: string;
}

const SimpleBarChart = ({
  chartProps,
  xAxisKey,
  cartesianProps,
  bars,
  ...props
}: SimpleBarChartProps) => (
  <ResponsiveContainerBase {...props}>
    <BarChartBase {...chartProps}>
      <CartesianGridBase {...cartesianProps} />
      <XAxisBase dataKey={xAxisKey} />
      <YAxisBase />
      <TooltipBase />
      <LegendBase />
      {bars?.map((bar, idx) => <BarBase key={idx} {...bar} />)}
    </BarChartBase>
  </ResponsiveContainerBase>
);

export default SimpleBarChart;
