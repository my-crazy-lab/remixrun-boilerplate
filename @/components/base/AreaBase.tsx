import { Area, type AreaProps } from 'recharts';

export type AreaBaseProps = Omit<AreaProps, 'ref'>;

const AreaBase = Area;

export default AreaBase;
