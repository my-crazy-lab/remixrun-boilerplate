import { Card, CardHeader } from '@/components/ui/card';
import CellBase from '@/components/base/CellBase';
import PieBase, { type PieBaseProps } from '@/components/base/PieBase';
import PieChartBase, { type PieChartBaseProps } from '@/components/base/PieChartBase';
import ResponsiveContainerBase, {
  type ResponsiveContainerBaseProps,
} from '@/components/base/ResponsiveContainerBase';
import TooltipBase, { type IPayLoadTooltip } from '@/components/base/TooltipBase';
import { PIE_CHART_COLOR } from '~/constants/common';

export interface SimplePieChartProps extends ResponsiveContainerBaseProps {
  chartProps: PieChartBaseProps;
  pieProps: PieBaseProps;
  sign: string;
}

const SimplePieChart = ({
  chartProps,
  pieProps,
  sign,
  ...props
}: SimplePieChartProps) => {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active: boolean;
    payload: IPayLoadTooltip;
  }) => {
    if (active && payload) {
      return (
        <Card>
          <CardHeader>{`${payload?.name}: ${payload?.value} ${sign}`}</CardHeader>
        </Card>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainerBase {...props}>
      <PieChartBase {...chartProps}>
        <PieBase {...pieProps}>
          {PIE_CHART_COLOR.map(color => (
            <CellBase key={color} fill={color} />
          ))}
        </PieBase>
        <TooltipBase
          content={(...args) =>
            args[0].active ? (
              <CustomTooltip
                active={args[0].active}
                payload={args[0].payload?.[0] as IPayLoadTooltip}
              />
            ) : null
          }
        />
      </PieChartBase>
    </ResponsiveContainerBase>
  );
};

export default SimplePieChart;
