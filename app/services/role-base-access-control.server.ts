import { toast } from '@/components/ui/use-toast';
import { type Document } from 'mongodb';
import { PERMISSIONS } from '~/constants/common';
import { res404 } from '~/hoc/remix';
import {
  newRecordCommonField,
  statusOriginal,
} from '~/services/constants.server';
import { getUserId } from '~/services/helpers.server';
import { type Groups, type Permissions, type Roles, type Users } from '~/types';
import { type GetRolesOfGroupsProjection } from '~/types/bridge';
import { convertRolesToPermissions, momentTz } from '~/utils/common';
import { mongodb } from '~/utils/db.server';

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
  const rolesCol = mongodb.collection<Roles>('roles');
  const roles = await rolesCol
    .find({ permissions: { $in: permissions } }, { projection: { _id: 1 } })
    .toArray();

  const groupFound = await mongodb.collection<Groups>('groups').findOne({
    userIds: userId,
    roleIds: { $in: roles.map(role => role._id) },
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
    toast({
      variant: 'error',
      title: 'ERROR',
      description: 'USER_DONT_HAVE_PERMISSION',
    });
  }
}

export async function getUserPermissions(userId: string) {
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

  const groups = await mongodb
    .collection<Groups>('groups')
    .aggregate(aggregate)
    .toArray();

  const permissions = convertRolesToPermissions(
    groups.map(group => group.roles),
  );

  if (permissions.includes(PERMISSIONS.ROOT)) {
    const allPermissions = await getAllPermissions({
      _id: 1,
    });

    return allPermissions.map(p => p._id);
  }

  return permissions;
}

export async function createGroup({
  name,
  description,
  parent,
  userIds,
  roleIds,
}: Pick<Groups, 'name' | 'description' | 'userIds' | 'roleIds'> & {
  parent: string;
}) {
  const groupCol = mongodb.collection<Groups>('groups');

  const parentGroup = await groupCol.findOne({ _id: parent });
  if (!parentGroup) {
    throw new Error('PARENT_GROUP_NOT_FOUND')
  }

  await groupCol.insertOne({
    ...newRecordCommonField(),
    name,
    description,
    userIds: userIds,
    roleIds: roleIds,
    genealogy: [...(parentGroup.genealogy || []), parent],
    hierarchy: parentGroup.hierarchy + 1, // increase hierarchy
  });
}

export async function updateGroups({
  groupId,
  name,
  description,
  userIds,
  roleIds,
}: Pick<Groups, 'name' | 'description' | 'userIds' | 'roleIds'> & {
  groupId: string;
}) {
  await mongodb.collection<Groups>('groups').updateOne(
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
  const roles = await mongodb
    .collection('roles')
    .aggregate<Roles & { actionPermissions: Permissions[] }>([
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

  if (!roles.length) throw new Response(null, res404);

  return roles[0];
}

export async function getRolesOfGroups(groupId: string) {
  const groups = await mongodb
    .collection('groups')
    .aggregate<GetRolesOfGroupsProjection>([
      {
        $match: { $or: [{ genealogy: { $in: [groupId] } }, { _id: groupId }] },
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
    ])
    .toArray();

  return groups[0]?.roles || [];
}

export async function searchUser(searchText: string) {
  const pattern = new RegExp(searchText, 'i');
  const users = await mongodb
    .collection<Users>('users')
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

/**
 * @description get groups detail with 2 cases: parent or not
 * @param isParent have another logic to get data if user is parent of group
 */
export async function getGroupDetail<T = Document>({
  isParent,
  userId,
  groupId,
  projection,
}: {
  isParent: boolean;
  userId: string;
  groupId: string;
  projection: Document;
}) {
  if (isParent) {
    const root = await isRoot(userId);
    const matchParent = root
      ? {}
      : {
        'parents.userIds': userId,
      };

    const group = await mongodb
      .collection('groups')
      .aggregate([
        {
          $match: { _id: groupId },
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
          $lookup: {
            from: 'groups',
            localField: '_id',
            foreignField: 'genealogy',
            as: 'children',
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
        { $match: matchParent },
        {
          $project: {
            ...projection,
          },
        },
      ])
      .toArray();

    if (!group?.[0]) {
      throw new Response(null, res404);
    }
    return group?.[0] as T;
  }

  const group = await mongodb
    .collection('groups')
    .aggregate([
      {
        $match: { _id: groupId, userIds: userId },
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
        $project: {
          ...projection,
        },
      },
    ])
    .toArray();

  if (!group?.[0]) {
    throw new Response(null, res404);
  }
  return group[0] as T;
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

  type GroupUnwindRole = Groups & { roles: Roles };
  const data = await mongodb
    .collection('groups')
    .aggregate<GroupUnwindRole>(aggregate)
    .toArray();

  const initial: Roles['permissions'] = [];
  const permissions = data.reduce((accumulator, obj) => {
    const setOfPermissions = new Set([
      ...accumulator,
      ...(obj?.roles?.permissions || []),
    ]);
    return [...setOfPermissions];
  }, initial);

  // root account can access all permissions
  if (permissions.includes(PERMISSIONS.ROOT)) {
    const allPermissions = await getAllPermissions({
      _id: 1,
    });

    return allPermissions;
  }
  return mongodb
    .collection<Permissions>('permissions')
    .find({ _id: { $in: permissions } })
    .toArray();
}

export async function verifyUserInGroup({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const group = await mongodb
    .collection<Groups>('groups')
    .findOne({ _id: groupId, userIds: userId });
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

  const groups = await mongodb
    .collection<Groups>('groups')
    .aggregate<T>([
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
  const { insertedId } = await mongodb.collection<Roles>('roles').insertOne({
    ...newRecordCommonField(),
    name,
    slug: name.toLocaleLowerCase().split(' ').join('-'),
    permissions,
    description,
  });

  await mongodb
    .collection<Groups>('groups')
    .updateOne({ _id: groupId }, { $push: { roleIds: insertedId } });
}

export async function updateRole({
  roleId,
  name,
  permissions,
  description,
}: Pick<Roles, 'name' | 'permissions' | 'description'> & { roleId: string }) {
  await mongodb.collection<Roles>('roles').updateOne(
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

export async function getAllPermissions(projection: Document) {
  const data = await mongodb
    .collection<Permissions>('permissions')
    .find({}, { projection })
    .toArray();
  return data;
}

export async function deleteUser(userId: string) {
  await mongodb.collection<Users>('users').updateOne(
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
  await mongodb.collection<Roles>('roles').updateOne(
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
  await mongodb.collection<Groups>('groups').updateOne(
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

  type GroupUnwindRole = Groups & { role: Roles };
  const data = await mongodb
    .collection('groups')
    .aggregate<GroupUnwindRole>(aggregate)
    .toArray();

  const initial: Roles['permissions'] = [];
  return data.reduce((accumulator, obj) => {
    const setOfPermissions = new Set([
      ...accumulator,
      ...(obj?.role?.permissions || []),
    ]);
    return [...setOfPermissions];
  }, initial);
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
  // because root group don't have genealogy (hierarchy 1)
  const root = await isRoot(userId);
  if (root) return true;

  const group = await mongodb
    .collection('groups')
    .aggregate([
      {
        $match: { _id: groupId },
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
    ])
    .toArray();

  return Boolean(group.length);
}
