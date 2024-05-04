import getLodash from 'lodash/get';
import type { MustBeAny } from '~/types';

const throwError = (error: MustBeAny) => {
  throw new Error(
    getLodash(
      error,
      // `error.errorText.${getMeteorUser().profile.language}`,
      error?.message ||
        error.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error.response?.content ||
        error.code ||
        error?.error?.message ||
        error?.error?.code ||
        error,
    ),
    getLodash(error, 'data', error?.error?.data || ''),
  );
};

const fetchAPI = async (url: string, params: MustBeAny, isoCode: string) => {
  const data = await fetch(`http://localhost:8080/api/${url}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accessKey: 'dumpkey',
    },
    // body data type must match "Content-Type" header
    body: JSON.stringify({ ...params, isoCode }),
  })
    .then(async res => {
      // Fetch successful
      if (res?.status === 200) {
        return res.json();
      }
      const error = await res.text();

      try {
        // Fetch error and server return JSON
        return Promise.reject(JSON.parse(error));
      } catch (err) {
        // Fetch error but server can not return JSON
        return Promise.reject(new Error(`${res.status} ${res.statusText}`));
      }
    })
    .then(response => Promise.resolve(response))
    .catch(error => throwError(error));

  return data;
};

export default fetchAPI;
