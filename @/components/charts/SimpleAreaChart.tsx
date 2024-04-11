import AreaBase, { type AreaBaseProps } from '@/components/base/AreaBase';
import AreaChartBase, { type AreaChartBaseProps } from '@/components/base/AreaChartBase';
import CartesianGridBase, {
  type CartesianGridBaseProps,
} from '@/components/base/CartesianGridBase';
import ResponsiveContainerBase from '@/components/base/ResponsiveContainerBase';
import TooltipBase from '@/components/base/TooltipBase';
import XAxisBase from '@/components/base/XAxisBase';
import YAxisBase from '@/components/base/YAxisBase';

export interface SimpleAreaChartProps {
  chartProps: AreaChartBaseProps;
  areas: Array<AreaBaseProps>;
  cartesianProps?: CartesianGridBaseProps;
  xAxisKey: string;
}

const SimpleAreaChart = ({
  chartProps,
  xAxisKey,
  cartesianProps,
  areas,
  ...props
}: SimpleAreaChartProps) => (
  <ResponsiveContainerBase {...props}>
    <AreaChartBase {...chartProps}>
      <CartesianGridBase {...cartesianProps} />
      <XAxisBase dataKey={xAxisKey} />
      <YAxisBase />
      <TooltipBase />
      {areas?.map((area, idx) => <AreaBase key={idx} {...area} />)}
    </AreaChartBase>
  </ResponsiveContainerBase>
);

export default SimpleAreaChart;
