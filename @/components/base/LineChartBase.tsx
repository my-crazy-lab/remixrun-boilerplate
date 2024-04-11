import { LineChart } from 'recharts';
import { type CategoricalChartProps } from 'recharts/types/chart/generateCategoricalChart';

export type LineChartBaseProps = CategoricalChartProps;

const LineChartBase = ({ children, ...props }: LineChartBaseProps) => (
  <LineChart {...props}>{children}</LineChart>
);

export default LineChartBase;
