import { defaultLanguage } from '~/constants/common';
import ActionsHistoryModel from '~/services/model/actionHistory.server';
import UsersModel from '~/services/model/users.server';
import { type Users } from '~/types';
import { momentTz } from '~/utils/common';
import { type PipelineStage } from '~/utils/db.server';

import { newRecordCommonField, statusOriginal } from './constants.server';
import { getUsersInGroupsByUserId } from './role-base-access-control.server';

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
  userId,
}: {
  searchText: string;
  userId: string;
}) {
  const $search: ISearch = { $match: {} };

  if (searchText) {
    $search.$match['user.username'] = {
      $regex: searchText,
      $options: 'i',
    };
  }
  const userIds = await getUsersInGroupsByUserId(userId);

  const result = await ActionsHistoryModel.aggregate([
    { $match: { actorId: { $in: userIds } } },
    {
      $lookup: {
        from: 'users',
        localField: 'actorId',
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
  userId,
}: {
  searchText: string;
  skip: PipelineStage.Skip['$skip'];
  limit: PipelineStage.Limit['$limit'];
  projection: PipelineStage.Project['$project'];
  userId: string;
}) {
  const $search: ISearch = { $match: {} };
  const userIds = await getUsersInGroupsByUserId(userId);

  if (searchText) {
    $search.$match['user.username'] = {
      $regex: searchText,
      $options: 'i',
    };
  }

  const actionsHistory = await ActionsHistoryModel.aggregate([
    { $match: { actorId: { $in: userIds } } },
    {
      $lookup: {
        from: 'users',
        localField: 'actorId',
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

export async function getTotalUsers(userId: string) {
  const userIds = await getUsersInGroupsByUserId(userId);

  const users = await UsersModel.find(
    { status: statusOriginal.ACTIVE, _id: { $in: userIds } },
    {},
  ).lean<Users[]>();

  return users.length;
}

export async function getUsers({
  skip,
  limit,
  projection,
  userId,
}: {
  skip: PipelineStage.Skip['$skip'];
  limit: PipelineStage.Limit['$limit'];
  projection: PipelineStage.Project['$project'];
  userId: string;
}) {
  const userIds = await getUsersInGroupsByUserId(userId);

  const users = await UsersModel.find(
    { status: statusOriginal.ACTIVE, _id: { $in: userIds } },
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
  ).lean<Users[]>();

  return users;
}

export function getUserProfile(_id: string) {
  return UsersModel.findOne({ _id }).lean<Users>();
}

export async function createNewUser({
  username,
  email,
  cities,
  isoCode,
  groupId,
}: Pick<Users, 'username' | 'email' | 'cities' | 'isoCode'> & {
  groupId?: string;
}) {
  const newUser = await UsersModel.create({
    ...newRecordCommonField(),
    username,
    email,
    cities,
    isoCode,
    lang: defaultLanguage,
  });

  return newUser;
}

export async function setUserLanguage({
  language,
  userId,
}: Pick<Users, 'language'> & { userId: string }) {
  await UsersModel.updateOne(
    { _id: userId },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        language,
      },
    },
  );
}

export async function changeUserAvatar({
  avatarUrl,
  userId,
}: Pick<Users, 'avatarUrl'> & { userId: string }) {
  await UsersModel.updateOne(
    { _id: userId },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        avatarUrl,
      },
    },
  );
}
