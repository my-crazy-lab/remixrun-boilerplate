import { ObjectId } from 'mongodb';
import type { FindOptions } from 'mongodb';
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

export const EXPIRED_RESET_PASSWORD = 15; // by minutes
export const EXPIRED_VERIFICATION_CODE = 10; // by minutes
