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
import { type Groups, type Roles, type Users } from '~/types';
import {
  convertRolesToPermissions,
  momentTz,
  removeDuplicatedItem,
} from '~/utils/common';
import { type Projection } from '~/utils/db.server';

export async function verifySuperUser(userId: string) {
  const permissions = await getUserPermissions(userId);
  return Boolean(permissions.includes(PERMISSIONS.ROOT));
}

export async function verifyManager(userId: string) {
  const permissions = await getUserPermissions(userId);
  return Boolean(permissions.includes(PERMISSIONS.MANAGER));
}

export async function getUserPermissionsIgnoreRoot(userId: string) {
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
    const allPermissions = await getAllPermissionsIgnoreRoot();
    return allPermissions.map(p => p._id);
  }

  return permissions;
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

  const groupCreated = await GroupsModel.create({
    ...newRecordCommonField(),
    name,
    description,
    userIds,
    roleAssignedIds,
    genealogy,
    hierarchy: parentGroup.hierarchy + 1, // increase hierarchy
  });

  // update parent group
  await GroupsModel.updateOne(
    { _id: parentId },
    {
      $set: { updateAt: momentTz().toDate() },
      $push: { nearestChildren: groupCreated._id },
    },
  );

  return groupCreated;
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
  const updatedAt = momentTz().toDate();

  const previousPermissions = await getPermissionsCreatedByGroupId({ groupId });

  const newRolesAssigned = await RolesModel.find({
    _id: { $in: roleAssignedIds },
  }).lean<Roles[]>();

  const permissionsAfterUpdateRole =
    convertRolesToPermissions(newRolesAssigned);

  const permissionsRemoved = previousPermissions.filter(
    permission => !permissionsAfterUpdateRole.includes(permission),
  );

  await GroupsModel.updateOne(
    { _id: groupId },
    {
      $set: {
        updatedAt,
        name,
        description,
        userIds,
        roleAssignedIds,
      },
    },
  );

  // update roleIds
  const roleIdsOfGroupWillBeUpdated = await GroupsModel.aggregate([
    {
      $match: { _id: groupId },
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
      $unwind: {
        path: '$roles',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: { 'roles.permissions': { $in: permissionsRemoved } },
    },
  ]).exec();
  await RolesModel.updateMany(
    {
      _id: {
        $in: roleIdsOfGroupWillBeUpdated?.map(e => e?.roles?._id || '') || [],
      },
    },
    {
      $set: {
        updatedAt,
      },
      $pullAll: { permissions: permissionsRemoved },
    },
  );

  if (permissionsRemoved.length) {
    const rolesWillBeUpdated =
      await getRolesWillBeUpdatedAtAllHierarchiesAfterUpdateOrRemoveRoles({
        groupId,
        permissionsRemoved,
      });

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
}

export async function getUsersByGroupId(groupIds: string[]) {
  const groups = await GroupsModel.find({
    status: statusOriginal.ACTIVE,
    genealogy: { $in: groupIds },
  }).lean();

  let userIds: Array<string> = [];
  groups.forEach(group => {
    userIds = [...userIds, ...group.userIds];
  });

  // remove duplicate user id
  return [...new Set(userIds)];
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

export async function getGroupPermissions({
  groupId,
  isSuperUser,
}: {
  groupId: string;
  isSuperUser: boolean;
}) {
  const group = await GroupsModel.findOne({
    _id: groupId,
    status: statusOriginal.ACTIVE,
  }).lean();
  if (!group) return [];

  // with super user, show all permissions in create/update roles
  // just apply when super user is standing group's root
  if (isSuperUser && !group.genealogy?.length) {
    return getAllPermissionsIgnoreRoot();
  }

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
        from: 'groups',
        localField: 'nearestChildren',
        foreignField: '_id',
        as: 'children',
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

  return createdRole;
}

export function getAllPermissionsIgnoreRoot() {
  return PermissionsModel.find({ _id: { $ne: PERMISSIONS.ROOT } }).lean();
}
export function getAllPermissions() {
  return PermissionsModel.find({}).lean();
}

export async function getUsersInGroupsByUserId(userId: string) {
  const groupIdsOfUser = await GroupsModel.find({
    userIds: { $in: userId },
  }).lean();
  return getUsersByGroupId(groupIdsOfUser.map(e => e._id));
}

export async function updateUser({
  userId,
  email,
  username,
  cities,
}: Pick<Users, 'email' | 'username' | 'cities'> & {
  userId: string;
}) {
  await UsersModel.updateOne(
    { _id: userId, status: statusOriginal.ACTIVE },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        email,
        username,
        cities,
      },
    },
  );
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
  groupId,
  updateOrRemoveCallback,
}: {
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
  groupId,
  permissionsRemoved,
}: {
  groupId: string;
  permissionsRemoved: Array<string>;
}) {
  // get groups have roles will be updated
  const children = await GroupsModel.aggregate<
    Groups & { roles?: Roles[]; rolesAssigned?: Roles[] }
  >([
    {
      $match: {
        $or: [
          {
            genealogy: groupId,
          },
        ],
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
  let roleNameDeleted = '';
  const updatedAt = momentTz().toDate();

  const permissionsRemoved =
    await getPermissionsRemovedAfterUpdateOrRemoveRoles({
      groupId,
      updateOrRemoveCallback: async () => {
        // remove role by id
        const roleDeleted = await RolesModel.findOneAndDelete({
          _id: roleId,
        }).lean<Roles>();
        roleNameDeleted = roleDeleted?.name || '';

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

        // update children group assigned role removed
        await GroupsModel.updateMany(
          { roleAssignedIds: roleId, status: statusOriginal.ACTIVE },
          {
            $set: {
              updatedAt,
            },
            $pull: {
              roleAssignedIds: roleId,
            },
          },
        );
      },
    });

  if (permissionsRemoved.length) {
    const rolesWillBeUpdated =
      await getRolesWillBeUpdatedAtAllHierarchiesAfterUpdateOrRemoveRoles({
        groupId,
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

  return roleNameDeleted;
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

  if (permissionsRemoved.length) {
    const rolesWillBeUpdated =
      await getRolesWillBeUpdatedAtAllHierarchiesAfterUpdateOrRemoveRoles({
        groupId,
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
}

export async function deleteGroup({ groupId }: { groupId: string }) {
  const updatedAt = momentTz().toDate();

  // get group and children of it
  // declare together
  const groupsChildren = await GroupsModel.find({
    status: statusOriginal.ACTIVE,
    $or: [{ genealogy: groupId }],
  }).lean();
  const group = await GroupsModel.findOne({
    status: statusOriginal.ACTIVE,
    _id: groupId,
  }).lean<Groups>();

  // get role's ids will be deleted
  const rolesWillBeDeleted = removeDuplicatedItem([
    group?.roleIds || [], // don't remove roles of parent, just remove in children
    ...groupsChildren.map(e => [...e.roleIds, ...e.roleAssignedIds]),
  ]);

  // remove roles
  await RolesModel.deleteMany({ _id: { $in: rolesWillBeDeleted } });

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

  return group?.name || '';
}

export async function isParentOfGroup({
  parentId,
  groupId,
}: {
  parentId: string;
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
    userIds: parentId,
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
        localField: 'nearestChildren',
        foreignField: '_id',
        as: 'children',
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
        $project: {
          ...projection,
        },
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

export async function getAllChildrenGroupOfUser(userId: string) {
  const groups = await GroupsModel.aggregate([
    {
      $match: {
        userIds: userId,
      },
    },
    {
      $lookup: {
        from: 'groups',
        localField: '_id',
        foreignField: 'genealogy',
        as: 'children',
      },
    },
    {
      $unwind: {
        path: '$children',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]).exec();

  return groups.map(group => group.children)
}
