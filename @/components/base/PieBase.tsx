import { Pie, type PieProps } from 'recharts';

export type PieBaseProps = Omit<PieProps, 'ref'>;

const PieBase = Pie;

export default PieBase;
