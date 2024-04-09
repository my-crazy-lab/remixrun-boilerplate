import AreaBase, { type AreaBaseProps } from '~/Base/AreaBase';
import AreaChartBase, { type AreaChartBaseProps } from '~/Base/AreaChartBase';
import CartesianGridBase, {
  type CartesianGridBaseProps,
} from '~/Base/CartesianGridBase';
import ResponsiveContainerBase from '~/Base/ResponsiveContainerBase';
import TooltipBase from '~/Base/TooltipBase';
import XAxisBase from '~/Base/XAxisBase';
import YAxisBase from '~/Base/YAxisBase';

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
