import ID from '~/services/model/isoCode/id/index.server';
import TH from '~/services/model/isoCode/th/index.server';
import VN from '~/services/model/isoCode/vn/index.server';

export type ModelName = 'task' | 'workingPlaces';

export function getModels(isoCode: string) {
  if (typeof name !== 'string') {
    throw new Error('Name of collection is not a string');
  }

  if (isoCode === 'VN') {
    return VN;
  }
  if (isoCode === 'TH') {
    return TH;
  }
  if (isoCode === 'ID') {
    return ID;
  }

  throw new Error('Iso code not is VN or TH or ID');
}
