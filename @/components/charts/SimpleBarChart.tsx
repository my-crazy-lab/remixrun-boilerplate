import BarBase, { type BarBaseProps } from '@/components/base/BarBase';
import BarChartBase, { type BarChartProps } from '@/components/base/BarChartBase';
import CartesianGridBase, {
  type CartesianGridBaseProps,
} from '@/components/base/CartesianGridBase';
import LegendBase from '@/components/base/LegendBase';
import ResponsiveContainerBase, {
  type ResponsiveContainerBaseProps,
} from '@/components/base/ResponsiveContainerBase';
import TooltipBase from '@/components/base/TooltipBase';
import XAxisBase from '@/components/base/XAxisBase';
import YAxisBase from '@/components/base/YAxisBase';

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
