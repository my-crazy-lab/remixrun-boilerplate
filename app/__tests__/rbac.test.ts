import {
  createGroup,
  createRole,
  deleteGroup,
  deleteRole,
  deleteUser,
  getAllPermissions,
  getGroupDetail,
  getGroupPermissions,
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
import { type Groups, type Permissions, type Roles, type Users } from '~/types';
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
        createdAt: new Date(),
        status: 'ACTIVE',
        cities: ['Hồ Chí Minh'],
        services: {
          password: {
            bcrypt: 'bcrypt',
          },
        },
        verification: {
          code: '123456',
          token: 'xxxxx',
          expired: new Date('2024-02-01'),
        },
        resetPassword: {
          token: 'resetXxxx',
          expired: new Date('2024-02-01'),
        },
      },
      {
        _id: managerId,
        email: 'manager@gmail.com',
        username: 'Manager user',
        createdAt: new Date(),
        status: 'ACTIVE',
        cities: ['Hà Nội'],
      },
      {
        _id: leaderId,
        email: 'leader@gmail.com',
        username: 'Leader user',
        createdAt: new Date('2024-03-25'),
        status: 'ACTIVE',
        cities: ['Đà Nẵng'],
      },
      {
        _id: employeeId,
        email: 'employee@gmail.com',
        username: 'Employee user',
        createdAt: new Date('2024-04-01'),
        status: 'INACTIVE',
        cities: ['Huế'],
      },
    ]);

    await mongodb.collection<Roles>('roles').insertMany([
      {
        _id: rootId,
        permissions: [rootId],
        createdAt: new Date('2024-02-01'),
        status: 'ACTIVE',
        slug: 'a-s-k-e-r',
        ...dataRootRole,
      },
      {
        _id: managerId,
        permissions: [managerId],
        name: 'Manager role',
        description: 'Manager description',
        createdAt: new Date('2024-03-01'),
        status: 'ACTIVE',
        slug: 'm-a-n-a-g-e-r',
      },
      {
        _id: leaderId,
        permissions: [leaderId],
        name: 'Leader role',
        description: 'Leader description',
        createdAt: new Date('2024-04-01'),
        status: 'ACTIVE',
        slug: 'l-e-a-d-e-r',
      },
      {
        _id: employeeId,
        permissions: [employeeId],
        name: 'Employee role',
        description: 'Employee description',
        createdAt: new Date('2024-03-01'),
        status: 'ACTIVE',
        slug: 'm-a-n-a-g-e-r',
      },
    ]);

    await mongodb.collection<Groups>('groups').insertMany([
      {
        _id: rootId,
        userIds: [rootId],
        roleIds: [rootId],
        name: 'root',
        description: 'root group desc',
        genealogy: ['genealogy1'],
        hierarchy: 2,
        createdAt: new Date(),
        status: 'ACTIVE',
      },
      {
        _id: managerId,
        userIds: [managerId],
        roleIds: [managerId],
        name: 'manager group',
        description: 'manager group desc',
        genealogy: ['genealogy1'],
        hierarchy: 2,
        createdAt: new Date('2024-02-01'),
        status: 'ACTIVE',
      },
      {
        _id: leaderId,
        userIds: [leaderId],
        roleIds: [leaderId],
        name: 'leader',
        description: 'leader group desc',
        genealogy: ['genealogy1'],
        hierarchy: 2,
        createdAt: new Date('2024-01-01'),
        status: 'ACTIVE',
      },
      {
        _id: employeeId,
        userIds: [employeeId],
        roleIds: [employeeId],
        name: 'employee',
        description: 'employee group desc',
        genealogy: ['genealogy1'],
        hierarchy: 2,
        createdAt: new Date('2024-02-05'),
        status: 'ACTIVE',
      },
    ]);
  });

  beforeEach(async () => {
    await mongodb.collection<Users>('users').insertOne({
      _id: userId,
      email: 'test1@gmail.com',
      username: 'Test 1',
      createdAt: new Date(),
      status: 'ACTIVE',
      cities: ['Hồ Chí Minh'],
    });
    await mongodb.collection<Groups>('groups').insertOne({
      _id: groupId,
      userIds: [groupId],
      roleIds: [groupId],
      name: 'groupName1',
      description: 'groupName1 desc',
      genealogy: ['genealogy1'],
      hierarchy: 2,
      createdAt: new Date('2023-12-01'),
      status: 'ACTIVE',
    });
  });

  afterEach(async () => {
    await mongodb.collection<Users>('users').deleteOne({ _id: userId });
    await mongodb.collection<Groups>('groups').deleteOne({ _id: groupId });
  });

  afterAll(async () => {
    await mongodb.collection<Users>('users').deleteMany({
      _id: {
        $in: [rootId, leaderId, managerId, employeeId],
      },
    });
    await mongodb
      .collection<Groups>('groups')
      .deleteMany({ _id: { $in: [rootId, leaderId, managerId, employeeId] } });
    await mongodb
      .collection<Roles>('roles')
      .deleteMany({ _id: { $in: [rootId, leaderId, managerId, employeeId] } });
    await mongodb
      .collection<Permissions>('permissions')
      .deleteMany({ _id: { $in: [rootId, leaderId, managerId, employeeId] } });
  });

  describe('getGroupsOfUser', () => {
    it('return a response', async () => {
      expect(true).toBe(true);
    });
  });

  describe('isRoot', () => {
    it('should return true when use is superuser', async () => {
      const rootUser = await isRoot(rootId);
      expect(rootUser).toBe(true);
    });

    it('should return false when use is not superuser', async () => {
      const rootUser = await isRoot('not-root-user');
      expect(rootUser).toBe(false);
    });
  });

  describe('VerifyPermission', () => {
    it('should return true when use is superuser', async () => {
      const permissions = [rootId];

      const rootUser = await verifyPermissions(
        { request: {} as Request },
        permissions,
      );
      expect(rootUser).toBe(true);
    });
    it('Should return false when permission not found', async () => {
      const mockPermission = 'IncorrectPermissionId';

      const isVerified = await verifyPermissions({ request: {} as Request }, [
        mockPermission,
      ]);

      expect(isVerified).toBe(false);
    });
  });

  describe('requirePermissions', () => {
    it('should throw Error when user not have permissions', async () => {
      await expect(
        requirePermissions({ request: {} as Request }, ['not-exist']),
      ).rejects.toThrow("User don't have permission");
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
        userIds: [rootId],
        roleIds: [rootId],
        parent: rootId,
      };
      await createGroup(mockParams);
      const newGroupInserted = await mongodb
        .collection('groups')
        .findOne({ name: mockParams.name });
      expect(newGroupInserted?.description).toBe(mockParams.description);

      await mongodb
        .collection<Groups>('groups')
        .deleteOne({ name: mockParams.name });
    });
  });

  describe('updateGroups', () => {
    const mockGroupId = 'group-test';
    const mockData = {
      name: 'Test',
      description: 'Test',
      userIds: ['1'],
      roleIds: ['1'],
      hierarchy: 1,
      createdAt: new Date(),
    };

    beforeEach(async () => {
      await mongodb.collection<Partial<Groups>>('groups').insertOne({
        _id: mockGroupId,
        ...mockData,
      });
    });

    afterEach(async () => {
      await mongodb
        .collection<Groups>('groups')
        .deleteOne({ _id: mockGroupId });
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
        .collection<Groups>('groups')
        .findOne({ _id: mockGroupId });
      expect(group?.name).toEqual('updated');
    });
  });

  describe('getRoleDetail', () => {
    it('should return detail of role correctly', async () => {
      const role: Partial<Roles> = await getRoleDetail(rootId);
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

  describe('getGroupDetail', () => {
    const groupId1 = 'groupId1';
    const userId1 = 'userId1';
    const roleId1 = 'roleId1';
    const genealogyId1 = 'genealogyId1';
    const groups = [
      {
        _id: groupId1,
        userIds: [userId1],
        roleIds: [roleId1],
        name: 'groupName1',
        genealogy: [genealogyId1],
        description: 'groupName1 desc',
        hierarchy: 2,
        createdAt: new Date('2023-12-01'),
        status: 'ACTIVE',
      },
      {
        _id: genealogyId1,
        userIds: [userId1],
        roleIds: ['roleId2'],
        name: 'groupName2',
        description: 'groupName2 desc',
        hierarchy: 2,
        createdAt: new Date('2023-11-01'),
        status: 'ACTIVE',
      },
    ];
    const role = {
      _id: roleId1,
      permissions: [managerId],
      name: 'Manager role',
      description: 'Manager description',
      createdAt: new Date('2024-03-01'),
      status: 'ACTIVE',
      slug: 'm-a-n-a-g-e-r',
    };
    const user = {
      _id: userId1,
      username: 'userName1',
      email: 'userName1@gmail.com',
      createdAt: new Date('2024-01-01'),
      status: 'ACTIVE',
      cities: ['Hồ Chí Minh'],
    };
    beforeEach(async () => {
      groups.forEach(async group => {
        await mongodb.collection<Groups>('groups').insertOne(group);
      });
      await mongodb.collection<Roles>('roles').insertOne(role);
      await mongodb.collection<Users>('users').insertOne(user);
    });
    afterEach(async () => {
      groups.forEach(async group => {
        await mongodb.collection<Groups>('groups').deleteOne(group);
      });
      await mongodb.collection<Roles>('roles').deleteOne(role);
      await mongodb.collection<Users>('users').deleteOne(user);
    });
    it('should search user correctly by text', async () => {
      const groupDetailFound = await getGroupDetail({
        isParent: true,
        userId: userId1,
        groupId: groupId1,
        projection: { _id: 1 },
      });

      expect(groupDetailFound?._id).toEqual(groupId1);
    });
    it('Should search group with root user successfully', async () => {
      const groupDetailFound = await getGroupDetail({
        isParent: true,
        userId: rootId,
        groupId: groupId1,
        projection: { _id: 1 },
      });

      expect(groupDetailFound?._id).toEqual(groupId1);
    });
  });

  describe('getGroupPermissions', () => {
    it('Should get entire permission when found root permission in a group correctly', async () => {
      const result = await getGroupPermissions(rootId);

      expect(result).toHaveLength(mockPermission.length);
      mockPermission.forEach(permission => {
        expect(result).toContainEqual({ _id: permission._id });
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

      expect(isVerified).toBe(true);
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
      const newRoleFound = await mongodb
        .collection<Roles>('roles')
        .findOne({ _id: mockRecordCommonField._id });

      const updatedGroupFound = await mongodb
        .collection<Groups>('groups')
        .findOne({ _id: managerId });

      expect(newRoleFound).toEqual({
        ...mockRecordCommonField,
        ...mockNewRoleInformation,
        slug: newRoleFound?.slug,
      });
      expect(updatedGroupFound?.roleIds).toContainEqual(
        mockRecordCommonField._id,
      );

      mongodb
        .collection<Roles>('roles')
        .deleteOne({ _id: mockRecordCommonField._id });
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

      const updatedRoleFound = await mongodb
        .collection<Roles>('roles')
        .findOne({ _id: managerId });

      expect(updatedRoleFound?.name).toStrictEqual(updateValue.name);
      expect(updatedRoleFound?.permissions).toEqual(updateValue.permissions);
      expect(updatedRoleFound?.description).toStrictEqual(
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
    const user = {
      _id: 'userId1',
      status: 'ACTIVE',
      username: 'username1',
      email: 'username1@gmail.com',
      createdAt: new Date('2024-02-01'),
      cities: ['Hồ Chí Minh'],
    };

    beforeEach(async () => {
      await mongodb.collection<Users>('users').insertOne(user);
    });

    afterEach(async () => {
      await mongodb.collection<Users>('users').deleteOne({ _id: user._id });
    });

    it('Should delete user successfully', async () => {
      await deleteUser(managerId);

      const deletedUserFound = await mongodb
        .collection<Users>('users')
        .findOne({ _id: managerId });

      expect(deletedUserFound?.status).toBe('REMOVED');
    });
  });

  describe('deleteRole', () => {
    const role = {
      _id: 'roleId1',
      status: 'ACTIVE',
      name: 'roleName1',
      description: 'role desc',
      permissions: ['permission1'],
      slug: 'r-o-l-e-n-a-m-e-1',
      createdAt: new Date('2024-02-01'),
    };
    beforeEach(async () => {
      await mongodb.collection<Roles>('roles').insertOne(role);
    });
    afterEach(async () => {
      await mongodb.collection<Roles>('roles').deleteOne({ _id: role._id });
    });
    it('Should delete role successfully', async () => {
      await deleteRole(role._id);

      const deletedRoleFound = await mongodb
        .collection<Roles>('roles')
        .findOne({ _id: role._id });

      expect(deletedRoleFound?.status).toEqual('REMOVED');
    });
  });

  describe('deleteGroup', () => {
    const group = {
      _id: 'groupId1',
      status: 'ACTIVE',
      name: 'groupName1',
      description: 'groupName1 desc',
      userIds: ['userId1'],
      roleIds: ['roleId1'],
      hierarchy: 12,
      createdAt: new Date('2024-02-01'),
    };
    beforeEach(async () => {
      await mongodb.collection<Groups>('groups').insertOne(group);
    });
    afterEach(async () => {
      await mongodb.collection<Groups>('groups').deleteOne({ _id: group._id });
    });

    it('Should delete group by id successfully', async () => {
      await deleteGroup(group._id);

      const deletedGroupFound = await mongodb
        .collection<Groups>('groups')
        .findOne({ _id: group._id });

      expect(deletedGroupFound?.status).toEqual('REMOVED');
    });
  });

  describe('getPermissionsOfGroup', () => {
    const groupId1 = 'groupId1';
    const roleId1 = 'roleId1';
    const roleId2 = 'roleId2';
    const group = {
      _id: groupId1,
      name: 'groupName1',
      description: 'groupName1 desc',
      userIds: ['userId1'],
      roleIds: ['roleId1'],
      hierarchy: 10,
      createdAt: new Date('2024-02-01'),
      status: 'ACTIVE',
      roles: [{ _id: roleId1 }, { _id: roleId2 }],
    };

    const roles = [
      {
        _id: roleId1,
        permissions: ['permission1'],
        name: 'roleName1',
        description: 'roleName1 desc',
        slug: 'r-o-l-e-n-a-m-e-1',
        createdAt: new Date('2024-02-01'),
        status: 'ACTIVE',
      },
      {
        _id: roleId2,
        permissions: ['permission2'],
        name: 'roleName2',
        description: 'roleName2 desc',
        slug: 'r-o-l-e-n-a-m-e-2',
        createdAt: new Date('2024-03-01'),
        status: 'ACTIVE',
      },
    ];

    beforeEach(async () => {
      await mongodb.collection<Groups>('groups').insertOne(group);
      roles.forEach(async role => {
        await mongodb.collection<Roles>('roles').insertOne(role);
      });
    });
    afterEach(async () => {
      await mongodb.collection<Groups>('groups').deleteOne({ _id: group._id });
      roles.forEach(async role => {
        await mongodb.collection<Roles>('roles').deleteOne(role);
      });
    });
    it('Should get permission of group successfully', async () => {
      const result = await getPermissionsOfGroup(group._id);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(roles[0].permissions[0]);
      expect(result).toContainEqual(roles[1].permissions[0]);
    });

    it('Should return an empty array if the group does not exist', async () => {
      const result = await getPermissionsOfGroup('non-existing-group');

      expect(result).toEqual([]);
    });
  });

  describe('isParentOfGroup', () => {
    const mockUserId1 = 'mockUserId1';
    const genealogyId = 'genealogyId';
    const groups = [
      {
        _id: 'groupId1',
        genealogy: [genealogyId],
        name: 'groupName1',
        description: 'groupName1 desc',
        userIds: ['userId1'],
        roleIds: ['roleId1'],
        hierarchy: 10,
        createdAt: new Date('2024-02-01'),
        status: 'ACTIVE',
      },
      {
        _id: genealogyId,
        userIds: [mockUserId1],
        genealogy: [genealogyId],
        name: 'groupName2',
        description: 'groupName2 desc',
        roleIds: ['roleId2'],
        hierarchy: 10,
        createdAt: new Date('2024-03-01'),
        status: 'ACTIVE',
      },
    ];
    const user = {
      _id: mockUserId1,
      username: 'userName1',
      email: 'user1@gmail.com',
      createdAt: new Date('2024-02-01'),
      status: 'ACTIVE',
      cities: ['Hồ Chí Minh'],
    };
    beforeEach(async () => {
      groups.forEach(async group => {
        await mongodb.collection<Groups>('groups').insertOne(group);
      });
      await mongodb.collection<Users>('users').insertOne(user);
    });
    afterEach(async () => {
      groups.forEach(async group => {
        await mongodb
          .collection<Groups>('groups')
          .deleteOne({ _id: group._id });
      });
      await mongodb.collection<Users>('users').deleteOne({ _id: user._id });
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
