import { momentTz } from '~/utils/common';
import { Types } from '~/utils/db.server';

export const statusOriginal = {
  ACTIVE: 'ACTIVE',
  REMOVED: 'REMOVED',
};

export const newRecordCommonField = () => ({
  createdAt: momentTz().toDate(),
  _id: new Types.ObjectId().toString(),
  status: statusOriginal.ACTIVE,
});

export const EXPIRED_RESET_PASSWORD = 15; // by minutes
export const EXPIRED_VERIFICATION_CODE = 10; // by minutes
