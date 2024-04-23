import { type Document } from 'mongodb';
import { PERMISSIONS } from '~/constants/common';
import { res404 } from '~/hoc/remix';
import GroupsModel from '~/model/groups.server';
import PermissionsModel from '~/model/permissions.server';
import RolesModel from '~/model/roles.servers';
import UsersModel from '~/model/users.server';
import {
  newRecordCommonField,
  statusOriginal,
} from '~/services/constants.server';
import { getUserId } from '~/services/helpers.server';
import { type Groups, type Permissions, type Roles, type Users } from '~/types';
import { type GetRolesOfGroupsProjection } from '~/types/bridge';
import {
  convertRolesToPermissions,
  momentTz,
  removeDuplicatedItem,
} from '~/utils/common';

/**
 * @description verify the user is super-user or not
 */
export async function isRoot(userId: string) {
  const permissions: Array<string> = await getUserPermissions(userId);
  return Boolean(permissions.includes(PERMISSIONS.ROOT));
}

export async function verifyPermissions(
  { request }: { request: Request },
  permissions: Array<string>,
) {
  const userId = await getUserId({ request });
  const roles = await RolesModel.find(
    { permissions: { $in: permissions }, status: statusOriginal.ACTIVE },
    { projection: { _id: 1 } },
  ).exec();

  const groupFound = await GroupsModel.findOne({
    userIds: userId,
    roleIds: { $in: roles.map(role => role._id) },
    status: statusOriginal.ACTIVE,
  });

  if (groupFound) {
    return true;
  }
  return false;
}

export async function requirePermissions(
  { request }: { request: Request },
  permissions: Array<string>,
) {
  const isAccepted = await verifyPermissions({ request }, permissions);
  if (!isAccepted) {
    throw new Error("User don't have permission");
  }
}

export async function getUserPermissions(userId: string) {
  const matchGroups = {
    $match: {
      userIds: userId,
      status: statusOriginal.ACTIVE,
    },
  };

  const lookupRole = {
    $lookup: {
      from: 'roles',
      localField: 'roleAssignedIds',
      foreignField: '_id',
      as: 'roles',
    },
  };

  const unwindRole = {
    $unwind: {
      path: '$roles',
      preserveNullAndEmptyArrays: true,
    },
  };

  const aggregate = [matchGroups, lookupRole, unwindRole];

  const groups = await GroupsModel.aggregate(aggregate).exec();

  const permissions = convertRolesToPermissions(
    groups.map(group => group.roles),
  );

  if (permissions.includes(PERMISSIONS.ROOT)) {
    const allPermissions = await getAllPermissions();
    return allPermissions.map(p => p._id);
  }

  return permissions;
}

export async function createGroup({
  name,
  description,
  parent,
  userIds,
  roleAssignedIds,
}: Pick<Groups, 'name' | 'description' | 'userIds' | 'roleAssignedIds'> & {
  parent: string;
}) {
  const parentGroup = await GroupsModel.findOne({
    _id: parent,
    status: statusOriginal.ACTIVE,
  });
  if (!parentGroup) {
    throw new Error('PARENT_GROUP_NOT_FOUND');
  }

  await GroupsModel.create({
    ...newRecordCommonField(),
    name,
    description,
    userIds,
    roleAssignedIds,
    genealogy: [...(parentGroup.genealogy || []), parent],
    hierarchy: parentGroup.hierarchy + 1, // increase hierarchy
  });
}

export async function updateGroups({
  groupId,
  name,
  description,
  userIds,
  roleAssignedIds,
}: Pick<Groups, 'name' | 'description' | 'userIds' | 'roleAssignedIds'> & {
  groupId: string;
}) {
  await GroupsModel.updateOne(
    { _id: groupId },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        name,
        description,
        userIds,
        roleAssignedIds,
      },
    },
  );
}

export async function getRoleDetail(roleId: string) {
  const roles = await RolesModel.aggregate<
    Roles & { actionPermissions: Permissions[] }
  >([
    { $match: { _id: roleId, status: statusOriginal.ACTIVE } },
    {
      $lookup: {
        from: 'permissions',
        localField: 'permissions',
        foreignField: '_id',
        as: 'actionPermissions',
      },
    },
  ]).exec();

  if (!roles.length) throw new Response(null, res404);

  return roles[0];
}

export async function getRolesOfGroups(groupId: string) {
  const groups = await GroupsModel.aggregate<GetRolesOfGroupsProjection>([
    {
      $match: {
        status: statusOriginal.ACTIVE,
        $or: [{ genealogy: { $in: [groupId] } }, { _id: groupId }],
      },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roleIds',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $project: { 'roles.name': 1, 'roles._id': 1 },
    },
  ]).exec();

  return groups[0]?.roles || [];
}

export async function searchUser(searchText: string) {
  const pattern = new RegExp(searchText, 'i');
  const users = await UsersModel.find<Users>({
    status: statusOriginal.ACTIVE,
    $or: [
      {
        email: { $regex: pattern },
      },
      {
        username: { $regex: pattern },
      },
    ],
  }).exec();
  return users;
}

/**
 * @description get groups detail with 2 cases: parent or not
 * @param isParent have another logic to get data if user is parent of group
 */
export async function getGroupDetail<T = Document>({
  isSuperUser,
  userId,
  isParent,
  groupId,
  projection,
}: {
  isParent: boolean;
  userId: string;
  groupId: string;
  isSuperUser: boolean;
  projection: Document;
}) {
  const lookupRoles = {
    $lookup: {
      from: 'roles',
      localField: 'roleIds',
      foreignField: '_id',
      as: 'roles',
    },
  };
  const lookupRolesAssigned = {
    $lookup: {
      from: 'roles',
      localField: 'roleAssignedIds',
      foreignField: '_id',
      as: 'roleAssigned',
    },
  };
  const lookupChildrenGroups = [
    {
      $lookup: {
        from: 'groups',
        localField: '_id',
        foreignField: 'genealogy',
        as: 'children',
      },
    },
    {
      $addFields: {
        children: {
          $filter: {
            input: {
              $map: {
                input: '$children',
                as: 'child',
                in: {
                  $mergeObjects: [
                    '$$child',
                    {
                      lastGenealogy: {
                        $arrayElemAt: ['$$child.genealogy', -1],
                      },
                    },
                  ],
                },
              },
            },
            as: 'child',
            cond: {
              $and: [
                {
                  $eq: ['$$child.lastGenealogy', groupId],
                },
                {
                  $eq: ['$$child.status', statusOriginal.ACTIVE],
                },
              ],
            },
          },
        },
      },
    },
  ];
  const lookupUsers = {
    $lookup: {
      from: 'users',
      localField: 'userIds',
      foreignField: '_id',
      as: 'users',
    },
  };

  // super user can view all groups
  if (isSuperUser) {
    const groupAsSuperUser = await GroupsModel.aggregate([
      {
        $match: { _id: groupId, status: statusOriginal.ACTIVE },
      },
      ...lookupChildrenGroups,
      lookupRoles,
      lookupRolesAssigned,
      lookupUsers,
      {
        $project: {
          ...projection,
        },
      },
    ]).exec();

    if (!groupAsSuperUser?.[0]) {
      throw new Response(null, res404);
    }
    return groupAsSuperUser[0] as T;
  }

  const lookupParentGroups = {
    $lookup: {
      from: 'groups',
      localField: 'genealogy',
      foreignField: '_id',
      as: 'parents',
    },
  };

  // allow access group detail when user is parent of group
  if (isParent) {
    const groupOfOwner = await GroupsModel.aggregate([
      {
        $match: { _id: groupId, status: statusOriginal.ACTIVE },
      },
      lookupParentGroups,
      ...lookupChildrenGroups,
      lookupRoles,
      lookupRolesAssigned,
      lookupUsers,
      {
        $match: {
          'parents.userIds': userId,
        },
      },
      {
        $project: {
          ...projection,
        },
      },
    ]).exec();

    if (!groupOfOwner?.[0]) {
      throw new Response(null, res404);
    }
    return groupOfOwner[0] as T;
  }

  // verify user in group
  const groupOfUser = await GroupsModel.aggregate([
    {
      $match: { _id: groupId, userIds: userId, status: statusOriginal.ACTIVE },
    },
    ...lookupChildrenGroups,
    lookupRoles,
    lookupRolesAssigned,
    lookupUsers,
    {
      $project: {
        ...projection,
      },
    },
  ]).exec();

  if (!groupOfUser?.[0]) {
    throw new Response(null, res404);
  }
  return groupOfUser[0] as T;
}

export async function getGroupPermissions({
  groupId,
  isSuperUser,
}: {
  groupId: string;
  isSuperUser: boolean;
}) {
  // root account can access all permissions
  if (isSuperUser) {
    return PermissionsModel.find({}).lean();
  }

  const matchGroups = {
    $match: {
      _id: groupId,
      status: statusOriginal.ACTIVE,
    },
  };

  const lookupRole = {
    $lookup: {
      from: 'roles',
      localField: 'roleAssignedIds',
      foreignField: '_id',
      as: 'roles',
    },
  };

  const unwindRole = {
    $unwind: {
      path: '$roles',
      preserveNullAndEmptyArrays: true,
    },
  };

  const aggregate = [matchGroups, lookupRole, unwindRole];

  type GroupUnwindRole = Groups & { roles: Roles };
  const data = await GroupsModel.aggregate<GroupUnwindRole>(aggregate).exec();

  const initial: Roles['permissions'] = [];
  const permissions = data.reduce((accumulator, obj) => {
    const setOfPermissions = new Set([
      ...accumulator,
      ...(obj?.roles?.permissions || []),
    ]);
    return [...setOfPermissions];
  }, initial);

  return PermissionsModel.find({
    _id: { $in: permissions },
  }).lean();
}

export async function verifyUserInGroup({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const group = await GroupsModel.findOne({
    status: statusOriginal.ACTIVE,
    _id: groupId,
    userIds: userId,
  });
  return Boolean(group);
}

export async function getGroupsOfUser<T extends Document = Document>({
  projection,
  userId,
}: {
  projection: Document;
  userId: string;
}) {
  const lookupUser = {
    $lookup: {
      from: 'users',
      localField: 'userIds',
      foreignField: '_id',
      as: 'users',
    },
  };
  const lookupRole = {
    $lookup: {
      from: 'roles',
      localField: 'roleIds',
      foreignField: '_id',
      as: 'roles',
    },
  };

  const groups = await GroupsModel.aggregate<T>([
    {
      $match: {
        userIds: userId,
        status: statusOriginal.ACTIVE,
      },
    },
    lookupUser,
    lookupRole,
    { $project: projection },
  ]).exec();

  return groups;
}

/**
 * @description create role and add roleId into group
 * (the role must be existed in a group)
 */
export async function createRole({
  groupId,
  name,
  permissions,
  description,
}: Pick<Roles, 'name' | 'description' | 'permissions'> & { groupId: string }) {
  const createdRoles = await RolesModel.create({
    ...newRecordCommonField(),
    name,
    slug: name.toLocaleLowerCase().split(' ').join('-'),
    permissions,
    description,
  });

  await GroupsModel.updateOne(
    { _id: groupId },
    { $push: { roleIds: createdRoles._id } },
  );
}

export function getAllPermissions() {
  return PermissionsModel.find({}).exec();
}

export async function deleteUser(userId: string) {
  await UsersModel.updateOne(
    { _id: userId },
    {
      $set: {
        status: statusOriginal.REMOVED,
        updatedAt: momentTz().toDate(),
      },
    },
  );
}

export async function getRolesByGroupId({ groupId }: { groupId: string }) {
  const groups = await GroupsModel.aggregate([
    {
      $match: {
        status: statusOriginal.ACTIVE,
        _id: groupId,
      },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roleIds',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $project: { roles: 1 },
    },
  ]).exec();

  return convertRolesToPermissions(groups[0]?.roles || []);
}

/**
 * @description
 * @param param0
 */
export async function deleteRole({
  roleId,
  groupId,
}: {
  roleId: string;
  groupId: string;
}) {
  const updatedAt = momentTz().toDate();
  const prePermissions = await getRolesByGroupId({ groupId });

  await RolesModel.updateOne(
    { _id: roleId, status: statusOriginal.ACTIVE },
    {
      $set: {
        updatedAt,
        status: statusOriginal.REMOVED,
      },
    },
  );
  await GroupsModel.updateOne(
    { _id: groupId, status: statusOriginal.ACTIVE },
    {
      $set: {
        updatedAt,
      },
      $pull: {
        roleIds: roleId,
      },
    },
  );

  const finalPermissions = await getRolesByGroupId({ groupId });
  const comparePermissions = prePermissions.filter(
    permission => !finalPermissions.includes(permission),
  );

  // get groups have roles will be updated
  const children = await GroupsModel.aggregate<
    Groups & { roles?: Roles[]; rolesAssigned?: Roles[] }
  >([
    {
      $match: {
        genealogy: groupId,
        status: statusOriginal.ACTIVE,
      },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roleAssignedIds',
        foreignField: '_id',
        as: 'rolesAssigned',
      },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roleIds',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $match: {
        $or: [
          {
            'rolesAssigned.permissions': { $in: comparePermissions },
          },
          {
            'roles.permissions': { $in: comparePermissions },
          },
        ],
      },
    },
  ]).exec();

  const rolesWillBeUpdated = removeDuplicatedItem(
    children.map(e => {
      if (e?.roles) {
        return e.roles.map(i => i._id);
      }
      if (e?.rolesAssigned) {
        return e.rolesAssigned.map(i => i._id);
      }
      return [];
    }),
  );

  // remove permissions of roles were born from list permissions deleted
  await RolesModel.updateMany(
    { _id: { $in: rolesWillBeUpdated } },
    {
      $set: {
        updatedAt,
      },
      $pullAll: { permissions: comparePermissions },
    },
  );
}

export async function updateRole({
  roleId,
  name,
  permissions,
  description,
  groupId,
}: Pick<Roles, 'name' | 'permissions' | 'description'> & {
  roleId: string;
  groupId: string;
}) {
  const updatedAt = momentTz().toDate();
  const prePermissions = await getRolesByGroupId({ groupId });

  await RolesModel.updateOne(
    { _id: roleId },
    {
      $set: {
        updatedAt,
        name,
        slug: name.toLocaleLowerCase().split(' ').join('-'),
        permissions,
        description,
      },
    },
  );

  const finalPermissions = await getRolesByGroupId({ groupId });
  const comparePermissions = prePermissions.filter(
    permission => !finalPermissions.includes(permission),
  );

  // get groups have roles will be updated
  const children = await GroupsModel.aggregate<
    Groups & { roles?: Roles[]; rolesAssigned?: Roles[] }
  >([
    {
      $match: {
        genealogy: groupId,
        status: statusOriginal.ACTIVE,
      },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roleAssignedIds',
        foreignField: '_id',
        as: 'rolesAssigned',
      },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roleIds',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $match: {
        $or: [
          {
            'rolesAssigned.permissions': { $in: comparePermissions },
          },
          {
            'roles.permissions': { $in: comparePermissions },
          },
        ],
      },
    },
  ]).exec();

  const rolesWillBeUpdated = removeDuplicatedItem(
    children.map(e => {
      if (e?.roles) {
        return e.roles.map(i => i._id);
      }
      if (e?.rolesAssigned) {
        return e.rolesAssigned.map(i => i._id);
      }
      return [];
    }),
  );

  // remove permissions of roles were born from list permissions deleted
  await RolesModel.updateMany(
    { _id: { $in: rolesWillBeUpdated } },
    {
      $set: {
        updatedAt,
      },
      $pullAll: { permissions: comparePermissions },
    },
  );
}

export async function deleteGroup({ groupId }: { groupId: string }) {
  const updatedAt = momentTz().toDate();

  const groups = await GroupsModel.find({
    status: statusOriginal.ACTIVE,
    $or: [{ _id: groupId }, { genealogy: groupId }],
  }).lean();

  // get roles will be deleted
  const rolesWillBeDeleted = removeDuplicatedItem(
    groups.map(e => [...e.roleIds, ...e.roleAssignedIds]),
  );

  // remove roles
  await RolesModel.updateMany(
    { _id: { $in: rolesWillBeDeleted } },
    {
      $set: {
        updatedAt,
        status: statusOriginal.REMOVED,
      },
    },
  );
  // remove group and children group
  await GroupsModel.updateMany(
    {
      $or: [{ _id: groupId }, { genealogy: groupId }],
    },
    {
      $set: {
        updatedAt,
        status: statusOriginal.REMOVED,
      },
    },
  );
}

export async function getPermissionsOfGroup(groupId: string) {
  const lookupRole = {
    $lookup: {
      from: 'roles',
      localField: 'roles._id',
      foreignField: '_id',
      as: 'roles',
    },
  };

  const unwindRole = {
    $unwind: {
      path: '$roles',
      preserveNullAndEmptyArrays: true,
    },
  };

  const aggregate = [
    { $match: { _id: groupId, status: statusOriginal.ACTIVE } },
    lookupRole,
    unwindRole,
  ];

  type GroupUnwindRole = Groups & { roles: Roles };
  const data = await GroupsModel.aggregate<GroupUnwindRole>(aggregate).exec();

  return convertRolesToPermissions(data.map(e => e.roles));
}

/**
 * @description verify the current user is parent of group or not
 */
export async function isParentOfGroup({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const group = await GroupsModel.aggregate([
    {
      $match: { _id: groupId, status: statusOriginal.ACTIVE },
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'genealogy',
        foreignField: '_id',
        as: 'parents',
      },
    },
    {
      $match: {
        'parents.userIds': userId,
      },
    },
  ]).exec();

  return Boolean(group.length);
}
