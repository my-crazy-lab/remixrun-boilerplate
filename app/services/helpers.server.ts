import { getSession } from '~/services/session.server';

export async function getUserId({ request }: { request: Request }) {
  const authSession = await getSession(request.headers.get('cookie'));
  return authSession.get('user')?.userId || '';
}
export async function getUserSession({
  headers,
}: {
  headers: Request['headers'];
}) {
  const authSession = await getSession(headers.get('cookie'));

  // Make sure if not cookie data, redirect login page
  // Just declare for checking by typescript
  const defaultReturnValue = { userId: '', isSuperUser: false, isoCode: '' };

  return authSession.get('user') || defaultReturnValue;
}
