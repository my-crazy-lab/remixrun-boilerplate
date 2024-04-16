import ActionsHistoryModel from '~/model/actionHistory.server';
import UsersModel from '~/model/users.server';
import { type Users } from '~/types';
import { type PipelineStage } from '~/utils/db.server';

import { hashPassword } from './auth.server';
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

  const result = await ActionsHistoryModel.aggregate([
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
  ]);

  return result.length > 0 ? result[0].total : 0;
}

export async function getActionsHistory({
  skip,
  limit,
  projection,
  searchText,
}: {
  searchText: string;
  skip: PipelineStage.Skip['$skip'];
  limit: PipelineStage.Limit['$limit'];
  projection: PipelineStage.Project['$project'];
}) {
  const $search: ISearch = { $match: {} };

  if (searchText) {
    $search.$match['user.username'] = {
      $regex: searchText,
      $options: 'i',
    };
  }

  const actionsHistory = await ActionsHistoryModel.aggregate([
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
  ]);

  return actionsHistory;
}

export async function getTotalUsers() {
  const total = await UsersModel.countDocuments({});

  return total;
}

export async function getUsers({
  skip,
  limit,
  projection,
}: {
  skip: PipelineStage.Skip['$skip'];
  limit: PipelineStage.Limit['$limit'];
  projection: PipelineStage.Project['$project'];
}) {
  const users = await UsersModel.find(
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
  );

  return users;
}

export function getUserProfile(_id: string) {
  return UsersModel.findOne({ _id });
}

export async function createNewUser({
  username,
  password,
  email,
  cities,
}: Pick<Users, 'username' | 'email' | 'cities'> & { password: string }) {
  const passwordHashed = hashPassword(password);

  await UsersModel.create({
    ...newRecordCommonField(),
    username,
    email,
    cities,
    services: { password: { bcrypt: passwordHashed } },
  });
}
