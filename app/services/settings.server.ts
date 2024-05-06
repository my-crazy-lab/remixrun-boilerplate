import { defaultLanguage } from '~/constants/common';
import ActionsHistoryModel from '~/services/model/actionHistory.server';
import UsersModel from '~/services/model/users.server';
import { type ActionsHistory, type Users } from '~/types';
import { momentTz } from '~/utils/common';
import { type PipelineStage } from '~/utils/db.server';

import { newRecordCommonField, statusOriginal } from './constants.server';
import GroupsModel from './model/groups.server';
import { getUsersInGroupsByUserId } from './role-base-access-control.server';

interface ISearch {
  $match: {
    'user.username'?: {
      $regex: string;
      $options: string;
    };
  };
}

export async function getTotalActionsHistoryManageByManagerId({
  searchText,
  managerId,
}: {
  searchText: string;
  managerId: string;
}) {
  const $search: ISearch = { $match: {} };

  if (searchText) {
    $search.$match['user.username'] = {
      $regex: searchText,
      $options: 'i',
    };
  }
  const userIdsManaged = await getUsersInGroupsByUserId(managerId);

  const result = await ActionsHistoryModel.aggregate<{ total: number }>([
    {
      $match: {
        $or: [{ actorId: { $in: userIdsManaged } }, { actorId: managerId }],
      },
    },
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
  ]).exec();

  return result.length > 0 ? result?.[0].total : 0;
}

export async function getActionsHistoryManagedByManagerId({
  skip,
  limit,
  projection,
  searchText,
  managerId,
}: {
  searchText: string;
  skip: PipelineStage.Skip['$skip'];
  limit: PipelineStage.Limit['$limit'];
  projection: PipelineStage.Project['$project'];
  managerId: string;
}) {
  const $search: ISearch = { $match: {} };
  const userIdsManaged = await getUsersInGroupsByUserId(managerId);

  if (searchText) {
    $search.$match['user.username'] = {
      $regex: searchText,
      $options: 'i',
    };
  }

  const actionsHistory = await ActionsHistoryModel.aggregate<ActionsHistory>([
    {
      $match: {
        $or: [{ actorId: { $in: userIdsManaged } }, { actorId: managerId }],
      },
    },
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
    { $sort: { createdAt: -1 } },
    { $project: { ...projection } },
    { $skip: skip },
    { $limit: limit },
  ]).exec();

  return actionsHistory;
}

export async function getTotalUsersManagedByManagerId(managerId: string) {
  const userIds = await getUsersInGroupsByUserId(managerId);

  const users = await UsersModel.find(
    { status: statusOriginal.ACTIVE, _id: { $in: userIds } },
    {},
  ).lean<Users[]>();

  return users.length;
}

export async function getUsersManagedByManagerId({
  skip,
  limit,
  projection,
  managerId,
}: {
  skip: PipelineStage.Skip['$skip'];
  limit: PipelineStage.Limit['$limit'];
  projection: PipelineStage.Project['$project'];
  managerId: string;
}) {
  const userIds = await getUsersInGroupsByUserId(managerId);

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
  groupIds,
}: Pick<Users, 'username' | 'email' | 'cities' | 'isoCode'> & {
  groupIds: Array<string>;
}) {
  const newUser = await UsersModel.create({
    ...newRecordCommonField(),
    username,
    email,
    cities,
    isoCode,
    lang: defaultLanguage,
  });

  await GroupsModel.updateMany(
    {
      _id: { $in: groupIds },
    },
    {
      $push: { userIds: newUser._id },
    },
  );

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
