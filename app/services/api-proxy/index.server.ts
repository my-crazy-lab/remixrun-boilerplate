import { IsoCode as EnumIsoCode } from '~/enums';

import id from './id.server';
import th from './th.server';
import vn from './vn.server';

export enum API_KEY {}

export type ApiUrl = {
  [k in keyof typeof API_KEY]: string;
};

const storageApi: {
  [key in EnumIsoCode]: ApiUrl;
} = {
  [EnumIsoCode.VN]: vn,
  [EnumIsoCode.TH]: th,
  [EnumIsoCode.ID]: id,
};

function getRestApiByMultiRegion({
  apiKey,
  isoCode,
}: {
  apiKey: keyof typeof API_KEY;
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
