import type { Document } from 'mongodb';
import type { CollectionIdString } from '~/types';
import { momentTz } from '~/utils/common';
import { ObjectId, mongodb } from '~/utils/db.server';

import { getSession } from './session.server';

export async function saveActionHistory(
  { request }: { request: Request },
  data: Document['data'],
) {
  const action = new URL(request.url).pathname;
  const userId = await getUserId({ request });

  const actionsHistoryCol =
    mongodb.collection<CollectionIdString>('actionsHistory');

  await actionsHistoryCol.insertOne({
    _id: new ObjectId().toString(),
    data,
    userId,
    action,
    createdAt: momentTz().toDate(),
  });
}

export async function getUserId({ request }: { request: Request }) {
  const authSession = await getSession(request.headers.get('cookie'));
  return authSession.get('user')?.userId || '';
}
export async function getUserSession({ request }: { request: Request }) {
  const authSession = await getSession(request.headers.get('cookie'));
  return authSession.get('user') || { userId: '', isSuperUser: false };
}
