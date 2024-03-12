import { ObjectId, mongodb } from '~/utils/db.server';
import { getUserId } from './helpers.server';
import {
  FindOptionsClient,
  newRecordCommonField,
  statusOriginal,
} from './constants.server';
import { momentTz } from '~/utils/helpers.server';
import { PERMISSIONS } from '~/constants/common';
import { MilkOff } from 'lucide-react';

export async function isRoot(userId: string) {
  const permissions: Array<string> = await getUserPermissions(userId);
  return Boolean(permissions.includes(PERMISSIONS.ROOT));
}

export async function verifyPermissions(
  { request }: any,
  permissions: Array<string>,
) {
  const userId = await getUserId({ request });
  const rolesCol = mongodb.collection('roles');
  const roles = await rolesCol
    .find({ permisisons: { $in: permissions } }, { projection: { _id: 1 } })
    .toArray();

  const groupFound = await mongodb.collection('groups').findOne({
    users: userId,
    roles: { $in: roles.map(role => role._id) },
  });

  if (groupFound) {
    return true;
  }

  return false;
}

export function requirePermissions(
  { request }: any,
  permissions: Array<string>,
) {
  const isAccepted = verifyPermissions({ request }, permissions);

  if (!isAccepted) {
    throw new Error("User don't have permission");
  }
}

export async function getUserPermissions(userId: string, moreDetail?: boolean) {
  const matchGroups = {
    $match: {
      userIds: userId,
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

  const unwindRole = {
    $unwind: {
      path: '$roles',
      preserveNullAndEmptyArrays: true,
    },
  };

  const aggregate = [matchGroups, lookupRole, unwindRole];

  const data: any = await mongodb
    .collection('groups')
    .aggregate(aggregate)
    .toArray();

  const setOfPermissions = data.reduce(
    (accumulator: any[], obj: any) =>
      new Set([...accumulator, ...(obj?.roles?.permissions || [])]),
    [],
  );

  const permissions: Array<string> = [...setOfPermissions];
  if (permissions.includes(PERMISSIONS.ROOT)) {
    const allPermissions = await getAllPermissions({
      _id: 1,
    });

    if (moreDetail) {
      return allPermissions;
    }

    return allPermissions.map(p => p._id);
  }
  if (moreDetail) {
    return data;
  }
  return permissions;
}

export async function createGroup({
  name,
  description,
  parent,
  userIds,
  roleIds,
}: any) {
  console.log(parent);
  const groupCol = mongodb.collection('groups');
  const parentGroup = await groupCol.findOne({ _id: parent });
  console.log(parent, parentGroup);
  if (!parentGroup) return;

  await groupCol.insertOne({
    ...newRecordCommonField(),
    name,
    description,
    userIds: userIds,
    roleIds: roleIds,
    parent,
    hierarchy: parentGroup.hierarchy + 1,
  });
}

export async function updateGroups({
  groupId,
  name,
  description,
  userIds,
  roleIds,
}: any) {
  await mongodb.collection('groups').updateOne(
    { _id: groupId },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        name,
        description,
        userIds,
        roleIds,
      },
    },
  );
}

export async function getRoleDetail(roleId: string) {
  const data = await mongodb
    .collection('roles')
    .aggregate([
      { $match: { _id: roleId } },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permissions',
          foreignField: '_id',
          as: 'actionPermissions',
        },
      },
    ])
    .toArray();

  return data;
}

export async function getRolesOfGroups(groupId: string) {
  const group = await mongodb
    .collection('groups')
    .aggregate([
      { $match: { _id: groupId } },
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
    ])
    .toArray();

  return group[0]?.roles;
}

export async function searchUser(searchText: string) {
  const pattern = new RegExp(searchText, 'i');
  const users = await mongodb
    .collection('users')
    .find({
      $or: [
        {
          email: { $regex: pattern },
        },
        {
          username: { $regex: pattern },
        },
      ],
    })
    .toArray();

  return users;
}

export async function getGroupDetail({ userId, groupId, projection }: any) {
  //TODO parent can view children groups
  const group = await mongodb
    .collection('groups')
    .aggregate([
      { $match: { _id: groupId, userIds: userId } },
      {
        $lookup: {
          from: 'groups', // The same collection
          localField: '_id', // Field from the input documents
          foreignField: 'parent', // Field from the documents of the "groups" collection
          as: 'children', // Output array field
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
        $lookup: {
          from: 'users',
          localField: 'userIds',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $project: projection,
      },
    ])
    .toArray();

  return group?.[0];
}

export async function getGroupPermissions(groupId: string) {
  const matchGroups = {
    $match: {
      _id: groupId,
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

  const unwindRole = {
    $unwind: {
      path: '$roles',
      preserveNullAndEmptyArrays: true,
    },
  };

  const aggregate = [matchGroups, lookupRole, unwindRole];

  const data: any = await mongodb
    .collection('groups')
    .aggregate(aggregate)
    .toArray();

  const setOfPermissions = data.reduce(
    (accumulator: any[], obj: any) =>
      new Set([...accumulator, ...(obj?.roles?.permissions || [])]),
    [],
  );

  const permissions: Array<string> = [...setOfPermissions];
  if (permissions.includes(PERMISSIONS.ROOT)) {
    const allPermissions = await getAllPermissions({
      _id: 1,
    });

    return allPermissions;
  }
  return data;
}

export async function getGroupsOfUser({ projection, userId }: any) {
  const groupCol = mongodb.collection('groups');
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

  const groups = await groupCol
    .aggregate([
      {
        $match: {
          userIds: userId,
        },
      },
      lookupUser,
      lookupRole,
      { $project: projection },
    ])
    .toArray();
  return groups;
}

export async function createRole({
  groupId,
  name,
  permissions,
  description,
}: any) {
  const roleCol = mongodb.collection('roles');
  const { insertedId } = await roleCol.insertOne({
    ...newRecordCommonField(),
    name,
    slug: name.toLocaleLowerCase().split(' ').join('-'),
    permissions,
    description,
  });

  await mongodb
    .collection('groups')
    .updateOne({ _id: groupId }, { $push: { roleIds: insertedId } });
}

export async function updateRole({
  roleId,
  name,
  permissions,
  description,
}: any) {
  await mongodb.collection('roles').updateOne(
    { _id: roleId },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        name,
        slug: name.toLocaleLowerCase().split('').join('-'),
        permissions,
        description,
      },
    },
  );
}

export async function getAllPermissions({ projection }: any) {
  const data = await mongodb
    .collection('permissions')
    .find({}, { projection })
    .toArray();
  return data;
}

export async function deleteUser(userId: string) {
  await mongodb.collection('users').updateOne(
    { _id: userId },
    {
      $set: {
        status: statusOriginal.REMOVED,
        updatedAt: momentTz().toDate(),
      },
    },
  );
}

export async function deleteRole(roleId: string) {
  await mongodb.collection('roles').updateOne(
    { _id: roleId },
    {
      $set: {
        updatedAt: momentTz().toDate(),
        status: statusOriginal.REMOVED,
      },
    },
  );
}

export async function deleteGroup(groupId: string) {
  await mongodb.collection('groups').updateOne(
    {
      _id: groupId,
    },
    {
      $set: {
        updatedAt: momentTz().toDate(),
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
      as: 'role',
    },
  };

  const unwindRole = {
    $unwind: {
      path: '$role',
      preserveNullAndEmptyArrays: true,
    },
  };

  const aggregate = [{ $match: { _id: groupId } }, lookupRole, unwindRole];

  const data: any = await mongodb
    .collection('groups')
    .aggregate(aggregate)
    .toArray();

  const setOfPermissions = data.reduce(
    (accumulator: any[], obj: any) =>
      new Set([...accumulator, ...(obj?.role?.permissions || [])]),
    [],
  );

  return [...setOfPermissions];
}

// TODO
export async function getUsersHierarchy(groupId: string) {
  await mongodb.collection('groups');
}

/*
 OK get all permissions (for root)
 OK get all groups of user 
 OK get details of groups: users, roles, groups children, ...
 OK edit groups: add users, roles, change name, descriptions
 OK create child groups 
    get list roles of group -> list permissions   
    input username or user's email
 OK update roles  
    get permission from parent groups 
    update into roles collection
 OK create roles  
    get permissions chosen from parent groups
    save into roles collection
 OK list roles of groups -> view detail permisisons of roles 
 OK delete user 
 OK delete roles 
 OK delete group with another permission 
 get all users from parent and children of groups
 OK verify root
*/
