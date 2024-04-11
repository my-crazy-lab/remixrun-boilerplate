import { Bar, type BarProps } from 'recharts';

export type BarBaseProps = Omit<BarProps, 'ref'>;

const BarBase = Bar;

export default BarBase;
