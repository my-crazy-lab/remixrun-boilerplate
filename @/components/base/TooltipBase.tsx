import { Tooltip } from 'recharts';

export interface IPayLoadTooltip {
  payload: { fill: string };
  name: string;
  value: number;
}

const TooltipBase = Tooltip;

export default TooltipBase;
