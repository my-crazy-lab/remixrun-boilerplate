import { IsoCode as EnumIsoCode } from '~/enums';
import ID, { IDName } from '~/services/model/isoCode/id/index.server';
import TH, { THName } from '~/services/model/isoCode/th/index.server';
import VN, { VNName } from '~/services/model/isoCode/vn/index.server';

export type ModelName = 'task' | 'workingPlaces';

export function getModels(isoCode: string) {
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

// Legacy
export function getFieldNameByIsoCode({
  isoCode,
  fieldName,
}: {
  fieldName: string;
  isoCode: string;
}) {
  if (isoCode === EnumIsoCode.VN) return fieldName;
  return `${isoCode}_${fieldName}`;
}

export function getCollectionNameByIsoCode(isoCode: string) {
  if (isoCode === 'VN') {
    return VNName;
  }
  if (isoCode === 'TH') {
    return THName;
  }
  if (isoCode === 'ID') {
    return IDName;
  }

  throw new Error('Iso code not is VN or TH or ID');
}
