import { mongodb } from '~/utils/db.server';
import { FindOptionsClient, newRecordCommonField } from './constants.server';
import { hashPassword } from './auth.server';

export async function getTotalUsers() {
  const total = await mongodb.collection('users').count({});

  return total;
}

export async function getUsers({ skip, limit, projection }: FindOptionsClient) {
  const usersCol = mongodb.collection('users');
  const users = await usersCol
    .find(
      {},
      {
        sort: {
          createdAt: -1,
        },
        projection: {
          ...projection,
        },
        skip,
        limit,
      },
    )
    .toArray();

  return users;
}

export async function createNewUser({
  username,
  password,
  email,
  cities,
  groupIds,
}: any) {
  const usersCol = mongodb.collection('users');
  const passwordHashed = await hashPassword(password);

  const newUser = await usersCol.insertOne({
    ...newRecordCommonField(),
    username,
    email,
    cities,
    services: { password: { bcrypt: passwordHashed } },
  });

  const groupCol = mongodb.collection('groups');

  await groupCol.updateMany(
    {
      _id: { $in: groupIds },
    },
    {
      $push: {
        users: newUser.insertedId.toString(),
      },
    },
  );

  return { message: 'Successful' };
}
