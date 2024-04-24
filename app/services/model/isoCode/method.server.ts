import ID from '~/services/model/isoCode/id/index.server';
import TH from '~/services/model/isoCode/th/index.server';
import VN from '~/services/model/isoCode/vn/index.server';

export type ModelName = 'task';

export async function getModels({
  name,
  isoCode,
}: {
  name: ModelName;
  isoCode: string;
}) {
  if (typeof name !== 'string') {
    throw new Error('Name of collection is not a string');
  }

  if (isoCode === 'VN') {
    return VN[name];
  }
  if (isoCode === 'TH') {
    return TH[name];
  }
  if (isoCode === 'ID') {
    return ID[name];
  }

  throw new Error('Iso code not is VN or TH or ID');
}
