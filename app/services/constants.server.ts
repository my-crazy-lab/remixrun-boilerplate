import { FindOptions, ObjectId } from 'mongodb';
import { momentTz } from '~/utils/common';

export const statusOriginal = {
  ACTIVE: 'ACTIVE',
  REMOVED: 'REMOVED',
};

export const newRecordCommonField = () => ({
  createdAt: momentTz().toDate(),
  _id: new ObjectId().toString(),
  status: statusOriginal.ACTIVE,
});

export type FindOptionsClient = Pick<
  FindOptions,
  'limit' | 'sort' | 'projection' | 'skip'
>;
