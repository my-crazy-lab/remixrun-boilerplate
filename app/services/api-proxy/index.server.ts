import { IsoCode as EnumIsoCode } from '~/enums';

import id from './id.server';
import th from './th.server';
import vn from './vn.server';

export enum API_KEY {}

export type IApiKey = keyof typeof API_KEY;
const storageApi: {
  [key in EnumIsoCode]: {
    [k in IApiKey]: string | null;
  };
} = {
  [EnumIsoCode.VN]: vn,
  [EnumIsoCode.TH]: th,
  [EnumIsoCode.ID]: id,
};

function getRestApiByMultiRegion({
  apiKey,
  isoCode,
}: {
  apiKey: IApiKey;
  isoCode: string;
}) {
  if (isoCode === 'VN') {
    return storageApi.VN[apiKey];
  }
  if (isoCode === 'TH') {
    return storageApi.TH[apiKey];
  }
  if (isoCode === 'ID') {
    return storageApi.ID[apiKey];
  }

  throw new Error('Iso code not is VN or TH or ID');
}

export default getRestApiByMultiRegion;
