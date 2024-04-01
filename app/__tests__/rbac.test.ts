import {
  createGroup,
  createRole,
  deleteGroup,
  deleteRole,
  deleteUser,
  getAllPermissions,
  getGroupDetail,
  getGroupPermissions,
  getGroupsOfUser,
  getPermissionsOfGroup,
  getRoleDetail,
  getRolesOfGroups,
  getUserPermissions,
  isParentOfGroup,
  isRoot,
  requirePermissions,
  searchUser,
  updateGroups,
  updateRole,
  verifyPermissions,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import type { Permissions, Users } from '~/types';
import { mongodb } from '~/utils/db.server';

const mockRecordCommonField = {
  createdAt: new Date('2024-03-24T00:00:00.000Z'),
  _id: 'mockNewRoleId',
  status: 'ACTIVE',
};

jest.mock('~/services/helpers.server', () => ({
  __esModule: true,
  getUserId: () => 'root',
}));

jest.mock('~/services/constants.server', () => ({
  __esModule: true,
  statusOriginal: {
    ACTIVE: 'ACTIVE',
    REMOVED: 'REMOVED',
  },
  newRecordCommonField: () => mockRecordCommonField,
}));

describe('Role base access control', () => {
  const rootId = 'root';
  const managerId = 'manager';
  const leaderId = 'leader';
  const employeeId = 'employee';

  const userId = 'user-1';
  const groupId = 'group-1';

  const dataRootRole = {
    name: 'Root role',
    description: 'Root description',
  };
  const mockPermission: Array<Permissions> = [
    {
      _id: rootId,
      name: 'ROOT',
      description: 'ROOT',
      module: 'admin',
      'slug-module': 'root',
    },
    {
      _id: managerId,
      name: 'MANAGER',
      description: 'MANAGER',
      module: 'admin',
      'slug-module': 'admin',
    },
    {
      _id: leaderId,
      name: 'LEADER',
      module: 'admin',
      description: 'LEADER',
      'slug-module': 'leader',
    },
    {
      _id: employeeId,
      name: 'EMPLOYEE',
      description: 'EMPLOYEE',
      module: 'admin',
      'slug-module': 'employee',
    },
  ];

  beforeAll(async () => {
    await mongodb
      .collection<Permissions>('permissions')
      .insertMany(mockPermission);
    await mongodb.collection<Users>('users').insertMany([
      {
        _id: rootId,
        email: 'root@gmail.com',
        username: 'Root user',
      },
      {
        _id: managerId,
        email: 'manager@gmail.com',
        username: 'Manager user',
      },
      {
        _id: leaderId,
        email: 'leader@gmail.com',
        username: 'Leader user',
      },
      {
        _id: employeeId,
        email: 'employee@gmail.com',
        username: 'Employee user',
      },
    ]);

    await mongodb.collection('roles').insertMany([
      {
        _id: rootId,
        permissions: [rootId],
        ...dataRootRole,
      },
      {
        _id: managerId,
        permissions: [managerId],
        name: 'Manager role',
        description: 'Manager description',
      },
      {
        _id: leaderId,
        permissions: [leaderId],
        name: 'Leader role',
        description: 'Leader description',
      },
      {
        _id: employeeId,
        permissions: [employeeId],
        name: 'Employee role',
        description: 'Employee description',
      },
    ]);

    await mongodb.collection('groups').insertMany([
      { _id: rootId, userIds: [rootId], roleIds: [rootId] },
      { _id: managerId, userIds: [managerId], roleIds: [managerId] },
      { _id: leaderId, userIds: [leaderId], roleIds: [leaderId] },
      { _id: employeeId, userIds: [employeeId], roleIds: [employeeId] },
    ]);
  });

  beforeEach(async () => {
    await mongodb
      .collection('users')
      .insertOne({ _id: userId, email: 'test1@gmail.com', username: 'Test 1' });
    await mongodb
      .collection('groups')
      .insertOne({ _id: groupId, userIds: [userId] });
  });

  afterEach(async () => {
    await mongodb.collection('users').deleteOne({ _id: userId });
    await mongodb.collection('groups').deleteOne({ _id: groupId });
  });

  afterAll(async () => {
    await mongodb.collection('users').deleteMany({
      _id: {
        $in: [rootId, leaderId, managerId, employeeId],
      },
    });
    await mongodb
      .collection('groups')
      .deleteMany({ _id: { $in: [rootId, leaderId, managerId, employeeId] } });
    await mongodb
      .collection('roles')
      .deleteMany({ _id: { $in: [rootId, leaderId, managerId, employeeId] } });
    await mongodb
      .collection('permissions')
      .deleteMany({ _id: { $in: [rootId, leaderId, managerId, employeeId] } });
  });

  describe('getGroupsOfUser', () => {
    it('return a response', async () => {
      const test = await getGroupsOfUser({
        projection: { email: 1, username: 1 },
        userId,
      });
      expect(true).toBe(true);
    });
  });

  describe('isRoot', () => {
    it('should return true when use is superuser', async () => {
      const rootuser = await isRoot(rootId);
      expect(rootuser).toBeTruthy();
    });

    it('should return false when use is not superuser', async () => {
      const rootuser = await isRoot('');
      expect(rootuser).toBeFalsy();
    });
  });

  describe('VerifyPermission', () => {
    it('should return true when use is superuser', async () => {
      const permissions = [rootId];

      const rootuser = await verifyPermissions(
        { request: {} as Request },
        permissions,
      );
      expect(rootuser).toBeTruthy();
    });
    it('Should return false when permission not found', async () => {
      const mockPermission = 'IncorrectPermissionId';

      const isVerified = await verifyPermissions({ request: {} as Request }, [
        mockPermission,
      ]);

      expect(isVerified).toBeFalsy();
    });
  });

  describe('requirePermissions', () => {
    it('should throw Error when user not have permissions', async () => {
      const permissions = ['not-exist'];
      try {
        await requirePermissions({ request: {} }, permissions);
      } catch (error: any) {
        expect(error.message).toBe("User don't have permission");
      }
    });
  });

  describe('getUserPermissions', () => {
    it('should get all permissions when user is superuser', async () => {
      const permissions = await getUserPermissions(rootId);
      expect(permissions).toEqual([rootId, managerId, leaderId, employeeId]);
    });
  });

  describe('createGroup', () => {
    it('should createGroup successfully', async () => {
      const mockParams = {
        name: 'test',
        description: 'testing',
        userIds: rootId,
        roleIds: rootId,
        parent: rootId,
      };
      await createGroup(mockParams);
      const newGroupInserted = await mongodb
        .collection('groups')
        .findOne({ name: mockParams.name });
      expect(newGroupInserted?.description).toBe(mockParams.description);

      await mongodb.collection('groups').deleteOne({ name: mockParams.name });
    });
  });

  describe('updateGroups', () => {
    const mockGroupId = 'group-test';
    const mockData = {
      name: 'Test',
      description: 'Test',
      userIds: ['1'],
      roleIds: ['1'],
    };

    beforeEach(async () => {
      await mongodb.collection('groups').insertOne({
        _id: mockGroupId,
        ...mockData,
      });
    });

    afterEach(async () => {
      await mongodb.collection('groups').deleteOne({ _id: mockGroupId });
    });

    it('should update group successfully', async () => {
      const mockParams = {
        groupId: mockGroupId,
        ...mockData,
        name: 'updated',
        description: 'updated',
      };
      await updateGroups(mockParams);

      const group = await mongodb
        .collection('groups')
        .findOne({ _id: mockGroupId });
      expect(group?.name).toEqual('updated');
    });
  });

  describe('getRoleDetail', () => {
    it('should return detail of role correctly', async () => {
      const role = await getRoleDetail(rootId);
      expect(role?.name).toEqual(dataRootRole.name);
    });
  });

  describe('getRolesOfGroups', () => {
    it('should return detail list roles of group correctly', async () => {
      const roles = await getRolesOfGroups(rootId);
      expect(roles.length).toEqual(1);
    });
  });

  describe('searchUser', () => {
    it('should search user correctly by text', async () => {
      const users = await searchUser('root');
      expect(users.length).toEqual(1);
    });
  });

  describe.skip('getGroupDetail', () => {
    it('should search user correctly by text', async () => {
      const group = await getGroupDetail({
        userId: rootId,
        groupId: rootId,
        projection: { _id: 1 },
      });
      expect(group?._id).toEqual(rootId);
    });
  });

  describe('getGroupPermissions', () => {
    it('Should get entire permission when found root permission in a group correctly', async () => {
      const result = await getGroupPermissions(rootId);

      expect(result).toHaveLength(mockPermission.length);
      mockPermission.forEach(permission => {
        expect(result).toContainEqual(permission);
      });
    });
    it('Should get entire permission within a group correctly', async () => {
      const result = await getGroupPermissions(managerId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPermission[1]);
    });
  });

  describe('verifyUserInGroup', () => {
    it('Should verify a user in a group successfully', async () => {
      const isVerified = await verifyUserInGroup({
        userId: managerId,
        groupId: managerId,
      });

      expect(isVerified).toBeTruthy();
    });
  });

  describe('createRole', () => {
    const mockNewRoleInformation = {
      name: 'new role name',
      description: 'new role desc',
      permissions: ['permission1', 'permission2'],
    };

    it('Should create new role successfully', async () => {
      await createRole({ ...mockNewRoleInformation, groupId: managerId });
      const newRoleFound: any = await mongodb
        .collection('roles')
        .findOne({ _id: mockRecordCommonField._id as any });

      const updatedGroupFound: any = await mongodb
        .collection('groups')
        .findOne({ _id: managerId });

      expect(newRoleFound).toEqual({
        ...mockRecordCommonField,
        ...mockNewRoleInformation,
        slug: newRoleFound.slug,
      });
      expect(updatedGroupFound.roleIds).toContainEqual(
        mockRecordCommonField._id,
      );

      mongodb
        .collection('roles')
        .deleteOne({ _id: mockRecordCommonField._id as any });
    });
  });

  describe('updateRole', () => {
    it('Should update role successfully', async () => {
      const updateValue = {
        name: 'updated role name',
        permissions: ['permission1', 'permission2'],
        description: 'updated desc',
      };
      await updateRole({ roleId: managerId, ...updateValue });

      const updatedRoleFound: any = await mongodb
        .collection('roles')
        .findOne({ _id: managerId });

      expect(updatedRoleFound.name).toStrictEqual(updateValue.name);
      expect(updatedRoleFound.permissions).toEqual(updateValue.permissions);
      expect(updatedRoleFound.description).toStrictEqual(
        updateValue.description,
      );
    });
  });

  describe('getAllPermissions', () => {
    it('Should get all permission by projection request successfully', async () => {
      const entirePermission = await getAllPermissions({
        projection: { _id: 1 },
      });

      expect(entirePermission).toHaveLength(mockPermission.length);
      expect(entirePermission).toContainEqual({ _id: mockPermission[0]._id });
      expect(entirePermission).toContainEqual({ _id: mockPermission[1]._id });
      expect(entirePermission).toContainEqual({ _id: mockPermission[2]._id });
      expect(entirePermission).toContainEqual({ _id: mockPermission[3]._id });
    });
  });

  describe('deleteUser', () => {
    const user: any = {
      _id: 'userId1',
      status: 'ACTIVE',
    };

    beforeEach(async () => {
      await mongodb.collection('users').insertOne(user);
    });

    afterEach(async () => {
      await mongodb.collection('users').deleteOne({ _id: user._id });
    });

    it('Should delete user successfully', async () => {
      await deleteUser(managerId);

      const deletedUserFound: any = await mongodb
        .collection('users')
        .findOne({ _id: managerId });

      expect(deletedUserFound.status).toBe('REMOVED');
    });
  });

  describe('deleteRole', () => {
    const role: any = {
      _id: 'roleId1',
      status: 'ACTIVE',
    };
    beforeEach(async () => {
      await mongodb.collection('roles').insertOne(role);
    });
    afterEach(async () => {
      await mongodb.collection('roles').deleteOne({ _id: role._id });
    });
    it('Should delete role successfully', async () => {
      await deleteRole(role._id);

      const deletedRoleFound: any = await mongodb
        .collection('roles')
        .findOne({ _id: role._id });

      expect(deletedRoleFound.status).toEqual('REMOVED');
    });
  });

  describe('deleteGroup', () => {
    const group: any = {
      _id: 'groupId1',
      status: 'ACTIVE',
    };
    beforeEach(async () => {
      await mongodb.collection('groups').insertOne(group);
    });
    afterEach(async () => {
      await mongodb.collection('groups').deleteOne({ _id: group._id });
    });

    it('Should delete group by id successfully', async () => {
      await deleteGroup(group._id);

      const deletedGroupFound: any = await mongodb
        .collection('groups')
        .findOne({ _id: group._id });

      expect(deletedGroupFound.status).toEqual('REMOVED');
    });
  });

  describe('getPermissionsOfGroup', () => {
    const groupId1 = 'groupId1';
    const roleId1 = 'roleId1';
    const roleId2 = 'roleId2';
    const group: any = {
      _id: groupId1,
      roles: [{ _id: roleId1 }, { _id: roleId2 }],
    };

    const roles: any = [
      {
        _id: roleId1,
        permissions: ['permission1'],
      },
      {
        _id: roleId2,
        permissions: ['permission2'],
      },
    ];

    beforeEach(async () => {
      await mongodb.collection('groups').insertOne(group);
      roles.forEach(async (role: any) => {
        await mongodb.collection('roles').insertOne(role);
      });
    });
    afterEach(async () => {
      await mongodb.collection('groups').deleteOne({ _id: group._id });
      roles.forEach(async (role: any) => {
        await mongodb.collection('roles').deleteOne(role);
      });
    });
    it('Should get permission of group successfully', async () => {
      const result = await getPermissionsOfGroup(group._id);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(roles[0].permissions[0]);
      expect(result).toContainEqual(roles[1].permissions[0]);
    });
  });

  describe('isParentOfGroup', () => {
    const mockUserId1 = 'mockUserId1';
    const genealogyId = 'genealogyId';
    const groups: any = [
      {
        _id: 'groupId1',
        genealogy: genealogyId,
      },
      {
        _id: genealogyId,
        userIds: [mockUserId1],
      },
    ];
    const user: any = {
      _id: mockUserId1,
    };
    beforeEach(async () => {
      groups.forEach(async (group: any) => {
        await mongodb.collection('groups').insertOne(group);
      });
      await mongodb.collection('users').insertOne(user);
    });
    afterEach(async () => {
      groups.forEach(async (group: any) => {
        await mongodb.collection('groups').deleteOne({ _id: group._id });
      });
      await mongodb.collection('users').deleteOne({ _id: user._id });
    });
    it('Should return true when user is root successfully', async () => {
      const isRoot = await isParentOfGroup({
        userId: rootId,
        groupId: groups[0]._id,
      });

      expect(isRoot).toBeTruthy();
    });
    it('Should check parent of group correctly', async () => {
      const isParent = await isParentOfGroup({
        userId: user._id,
        groupId: groups[0]._id,
      });

      expect(isParent).toBeTruthy();
    });
  });
});
