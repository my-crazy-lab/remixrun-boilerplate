import { type Users } from '~/types';
import { mongodb } from '~/utils/db.server';

import { momentTz } from '~/utils/common';
import { hashPassword } from './auth.server';
import type { FindOptionsClient } from './constants.server';
import { newRecordCommonField } from './constants.server';

interface ISearch {
  $match: {
    'user.username'?: {
      $regex: string;
      $options: string;
    };
  };
}

export async function getTotalActionsHistory({
  searchText,
}: {
  searchText: string;
}) {
  const $search: ISearch = { $match: {} };

  if (searchText) {
    $search.$match['user.username'] = {
      $regex: searchText,
      $options: 'i',
    };
  }

  const result = await mongodb
    .collection('actionsHistory')
    .aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      $search,
      { $count: 'total' },
    ])
    .toArray();

  return result.length > 0 ? result[0].total : 0;
}

export async function getActionsHistory({
  skip,
  limit,
  projection,
  searchText,
}: FindOptionsClient & { searchText: string }) {
  const $search: ISearch = { $match: {} };

  if (searchText) {
    $search.$match['user.username'] = {
      $regex: searchText,
      $options: 'i',
    };
  }

  const actionsHistory = await mongodb
    .collection('actionsHistory')
    .aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
      { $project: { ...projection } },
      $search,
      { $skip: skip },
      { $limit: limit },
    ])
    .toArray();

  return actionsHistory;
}

export async function getTotalUsers() {
  const total = await mongodb.collection('users').count({});

  return total;
}

export async function getUsers({ skip, limit, projection }: FindOptionsClient) {
  const users = await mongodb
    .collection<Users>('users')
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

export function getUserProfile(_id: string) {
  return mongodb.collection<Users>('users').findOne({ _id });
}

export async function createNewUser({
  username,
  password,
  email,
  cities,
}: Pick<Users, 'username' | 'email' | 'cities'> & { password: string }) {
  const usersCol = mongodb.collection<Users>('users');
  const passwordHashed = hashPassword(password);

  await usersCol.insertOne({
    ...newRecordCommonField(),
    username,
    email,
    cities,
    services: { password: { bcrypt: passwordHashed } },
  });
}

export async function setUserLanguage({ language, _id }: Pick<Users, 'language' | '_id'>) {
  await mongodb.collection<Users>('users').updateOne(
    { _id },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        language,
      },
    },
  );
}
