import { Line, type LineProps } from 'recharts';

export type LineBaseProps = Omit<LineProps, 'ref'>;

const LineBase = Line;

export default LineBase;
