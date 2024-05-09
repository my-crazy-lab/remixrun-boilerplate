import { dotenv } from './dotenv.server';

async function fetchAPI<T>(url: string, params: T, isoCode: string) {
  const data = await fetch(`${dotenv.GO_REST_API_URI}/${url}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accessKey: dotenv.ACCESS_KEY,
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
    .catch(error => {
      throw new Error(
        error.error?.message ||
          error.error?.response?.data?.error?.message ||
          error.error?.response?.data?.message ||
          error.error?.response?.content ||
          error.error?.code ||
          error.error?.error?.message ||
          error.error?.error?.code ||
          error.error ||
          error.data ||
          error.error?.data ||
          '',
      );
    });

  return data;
}

export { fetchAPI };
