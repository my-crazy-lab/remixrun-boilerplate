import { type MustBeAny } from '~/types';

export function mockResponseThrowError() {
  const errorText = 'response return error message';

  const spy = jest
    .spyOn(global, 'Response')
    .mockImplementation(() => new Error(errorText) as MustBeAny);

  function restore() {
    spy.mockRestore();
  }
  return { restore, errorText };
}
