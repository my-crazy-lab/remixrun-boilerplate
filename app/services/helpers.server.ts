import { getModels } from '~/services/model/isoCode/method.server';
import UsersModel from '~/services/model/users.server';
import { getSession } from '~/services/session.server';
import { type Users } from '~/types';

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
  const defaultReturnValue = {
    userId: '',
    isSuperUser: false,
    isoCode: '',
    username: '',
    email: '',
    language: 'en',
  };

  return authSession.get('user') || defaultReturnValue;
}

export async function getCities(isoCode: string) {
  const workingPlaces = await getModels(isoCode)
    .workingPlaces.findOne(
      {
        countryCode: isoCode,
      },
      {
        cities: 1,
      },
    )
    .lean();

  return workingPlaces?.cities?.map(city => city.name) || [];
}

export async function getCitiesByUserId({
  userId,
  isManager,
}: {
  userId: string;
  isManager: boolean;
}) {
  const user = await UsersModel.findOne(
    { _id: userId },
    { cities: 1, isoCode: 1 },
  ).lean<Users>();

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Manager can access all cities at country by iso code
  if (isManager) {
    return getCities(user.isoCode);
  }

  return user.cities || [];
}
