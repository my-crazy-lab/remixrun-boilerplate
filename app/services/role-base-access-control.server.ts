import { PERMISSIONS } from '~/constants/common';
import { res403, res404 } from '~/hoc/remix';
import {
  newRecordCommonField,
  statusOriginal,
} from '~/services/constants.server';
import GroupsModel from '~/services/model/groups.server';
import PermissionsModel from '~/services/model/permissions.server';
import RolesModel from '~/services/model/roles.servers';
import UsersModel from '~/services/model/users.server';
import { type Groups, type Roles } from '~/types';
import {
  convertRolesToPermissions,
  momentTz,
  removeDuplicatedItem,
} from '~/utils/common';
import { type Projection } from '~/utils/db.server';

export async function verifySuperUser(userId: string) {
  const permissions = await getUserPermissions(userId);

  // use in group ROOT is super user
  return Boolean(permissions.includes(PERMISSIONS.ROOT));
}

export async function getUserPermissions(userId: string) {
  const groups = await GroupsModel.aggregate([
    {
      $match: {
        userIds: userId,
        status: statusOriginal.ACTIVE,
      },
    },
    // roleAssignedIds store permissions of group
    {
      $lookup: {
        from: 'roles',
        localField: 'roleAssignedIds',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $unwind: {
        path: '$roles',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]).exec();

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
  parentId,
  userIds,
  roleAssignedIds,
}: Pick<Groups, 'name' | 'description' | 'userIds' | 'roleAssignedIds'> & {
  parentId: string;
}) {
  const parentGroup = await GroupsModel.findOne({
    _id: parentId,
    status: statusOriginal.ACTIVE,
  }).lean();
  if (!parentGroup) {
    throw new Error('PARENT_GROUP_NOT_FOUND');
  }

  // root group (hierarchy 1) not have genealogy field
  const genealogy = [...(parentGroup.genealogy || []), parentId];

  await GroupsModel.create({
    ...newRecordCommonField(),
    name,
    description,
    userIds,
    roleAssignedIds,
    genealogy,
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
  const roles = await RolesModel.findOne({
    _id: roleId,
    status: statusOriginal.ACTIVE,
  }).lean();

  if (!roles) throw new Response(null, res404);

  const actionPermissions = await PermissionsModel.find({
    _id: { $in: roles.permissions },
  }).lean();

  return { ...roles, actionPermissions };
}

export async function getRolesByGroupId(groupId: string) {
  const group = await GroupsModel.findOne({
    status: statusOriginal.ACTIVE,
    $or: [{ genealogy: groupId }, { _id: groupId }],
  }).lean();

  if (!group) return [];

  const roles = await RolesModel.find({ _id: { $in: group.roleIds } }).lean();

  return roles;
}

export async function getPermissionsCreatedByGroupId({
  groupId,
}: {
  groupId: string;
}) {
  const group = await GroupsModel.findOne(
    {
      status: statusOriginal.ACTIVE,
      _id: groupId,
    },
    { roleIds: 1 },
  ).lean();

  if (!group) return [];

  const roles = await RolesModel.find({
    _id: { $in: group.roleIds },
  }).lean<Roles[]>();

  return convertRolesToPermissions(roles);
}

export async function searchUser(searchText: string) {
  const pattern = new RegExp(searchText, 'i');
  const users = await UsersModel.find({
    status: statusOriginal.ACTIVE,
    $or: [
      {
        email: { $regex: pattern },
      },
      {
        username: { $regex: pattern },
      },
    ],
  }).lean();
  return users;
}

export async function getGroupPermissions({ groupId }: { groupId: string }) {
  const group = await GroupsModel.findOne({
    _id: groupId,
    status: statusOriginal.ACTIVE,
  }).lean();
  if (!group) return [];

  const roles = await RolesModel.find({
    _id: { $in: group.roleAssignedIds },
  }).lean<Roles[]>();
  if (!roles.length) return [];

  return PermissionsModel.find({
    _id: { $in: convertRolesToPermissions(roles) },
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
  }).lean();
  return Boolean(group);
}

export async function getGroupsOfUser<T extends Projection = Projection>({
  projection,
  userId,
}: {
  projection: Projection;
  userId: string;
}) {
  const groups = await GroupsModel.aggregate<T>([
    {
      $match: {
        userIds: userId,
        status: statusOriginal.ACTIVE,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userIds',
        foreignField: '_id',
        as: 'users',
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
    { $project: projection },
  ]).exec();

  return groups;
}

export async function createRole({
  groupId,
  name,
  permissions,
  description,
}: Pick<Roles, 'name' | 'description' | 'permissions'> & { groupId: string }) {
  const createdRole = await RolesModel.create({
    ...newRecordCommonField(),
    name,
    permissions,
    description,
    slug: name.toLocaleLowerCase().split(' ').join('-'),
  });

  // add roleId into group
  // because role must be managed by at least 1 group
  await GroupsModel.updateOne(
    { _id: groupId },
    { $push: { roleIds: createdRole._id } },
  );
}

export function getAllPermissions() {
  return PermissionsModel.find({}).lean();
}

export async function deleteUser(userId: string) {
  await UsersModel.updateOne(
    { _id: userId, status: statusOriginal.ACTIVE },
    {
      $set: {
        status: statusOriginal.REMOVED,
        updatedAt: momentTz().toDate(),
      },
    },
  );

  // remove user id in group they're in
  await GroupsModel.updateMany(
    {
      userIds: userId,
      status: statusOriginal.ACTIVE,
    },
    {
      $pull: {
        userIds: userId,
      },
    },
  );
}

async function getPermissionsRemovedAfterUpdateOrRemoveRoles({
  roleId,
  groupId,
  updateOrRemoveCallback,
}: {
  roleId: string;
  groupId: string;
  updateOrRemoveCallback: () => Promise<void>;
}) {
  // get previous permissions
  const previousPermissions = await getPermissionsCreatedByGroupId({ groupId });

  await updateOrRemoveCallback();

  const permissionsAfterUpdateOrRemoveRole =
    await getPermissionsCreatedByGroupId({ groupId });

  const permissionsRemoved = previousPermissions.filter(
    permission => !permissionsAfterUpdateOrRemoveRole.includes(permission),
  );

  return permissionsRemoved;
}

async function getRolesWillBeUpdatedAtAllHierarchiesAfterUpdateOrRemoveRoles({
  roleId,
  groupId,
  permissionsRemoved,
}: {
  roleId: string;
  groupId: string;
  permissionsRemoved: Array<string>;
}) {
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
            'rolesAssigned.permissions': { $in: permissionsRemoved },
          },
          {
            'roles.permissions': { $in: permissionsRemoved },
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

  return rolesWillBeUpdated;
}

export async function deleteRole({
  roleId,
  groupId,
}: {
  roleId: string;
  groupId: string;
}) {
  const updatedAt = momentTz().toDate();

  const permissionsRemoved =
    await getPermissionsRemovedAfterUpdateOrRemoveRoles({
      roleId,
      groupId,
      updateOrRemoveCallback: async () => {
        // remove role by id
        await RolesModel.updateOne(
          { _id: roleId, status: statusOriginal.ACTIVE },
          {
            $set: {
              updatedAt,
              status: statusOriginal.REMOVED,
            },
          },
        );

        // update group created role removed
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
      },
    });

  const rolesWillBeUpdated =
    await getRolesWillBeUpdatedAtAllHierarchiesAfterUpdateOrRemoveRoles({
      groupId,
      roleId,
      permissionsRemoved,
    });

  // remove permissions of roles were born from list permissions deleted
  await RolesModel.updateMany(
    { _id: { $in: rolesWillBeUpdated } },
    {
      $set: {
        updatedAt,
      },
      $pullAll: { permissions: permissionsRemoved },
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

  const permissionsRemoved =
    await getPermissionsRemovedAfterUpdateOrRemoveRoles({
      roleId,
      groupId,
      updateOrRemoveCallback: async () => {
        // update role by id
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
      },
    });

  const rolesWillBeUpdated =
    await getRolesWillBeUpdatedAtAllHierarchiesAfterUpdateOrRemoveRoles({
      groupId,
      roleId,
      permissionsRemoved,
    });

  // remove permissions of roles were born from list permissions deleted
  await RolesModel.updateMany(
    { _id: { $in: rolesWillBeUpdated } },
    {
      $set: {
        updatedAt,
      },
      $pullAll: { permissions: permissionsRemoved },
    },
  );
}

export async function deleteGroup({ groupId }: { groupId: string }) {
  const updatedAt = momentTz().toDate();

  // get group and parent of it
  // declare together
  const groups = await GroupsModel.find({
    status: statusOriginal.ACTIVE,
    $or: [{ _id: groupId }, { genealogy: groupId }],
  }).lean();

  // get role's ids will be deleted
  const rolesWillBeDeleted = removeDuplicatedItem(
    groups.map(e => [...e.roleIds, ...e.roleAssignedIds]),
  );

  // remove roles
  await RolesModel.updateMany(
    { _id: { $in: rolesWillBeDeleted }, status: statusOriginal.ACTIVE },
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
      status: statusOriginal.ACTIVE,
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

export async function isParentOfGroup({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const groupChecking = await GroupsModel.findOne({
    _id: groupId,
    status: statusOriginal.ACTIVE,
  }).lean<Groups>();
  if (!groupChecking?.genealogy?.length) return false;

  // get list parent of group checking
  // genealogy store ids of parent
  const groupParent = await GroupsModel.find({
    _id: { $in: groupChecking.genealogy },
    status: statusOriginal.ACTIVE,
  }).lean();

  return Boolean(groupParent.length);
}

/**
 * 4 cases
 * - user is super user
 * - user in group parent
 * - user in group
 * - user not in group
 */
export async function getGroupDetail<T = Projection>({
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
  projection: Projection;
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

  // case super user: allow access all groups
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
        $project: projection,
      },
    ]).exec();

    // group not found
    // status code 404
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

  // case user in parent group: allow access group
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
        $project: projection,
      },
    ]).exec();

    // group not found
    // status code 404
    if (!groupOfOwner?.[0]) {
      throw new Response(null, res404);
    }
    return groupOfOwner[0] as T;
  }

  // case user in group: allow access group
  // get 1 record but use aggregate method because have many joinable collection
  const groupOfUser = await GroupsModel.aggregate([
    {
      $match: { _id: groupId, userIds: userId, status: statusOriginal.ACTIVE },
    },
    ...lookupChildrenGroups,
    lookupRoles,
    lookupRolesAssigned,
    lookupUsers,
    {
      $project: projection,
    },
  ]).exec();

  // group not found or user not in group
  // status code 403
  if (!groupOfUser?.[0]) {
    throw new Response(null, res403);
  }
  return groupOfUser[0] as T;
}
