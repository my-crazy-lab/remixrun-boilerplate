import GroupsModel from '~/services/model/groups.server';
import PermissionsModel from '~/services/model/permissions.server';
import RolesModel from '~/services/model/roles.servers';
import UsersModel from '~/services/model/users.server';
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
  getRoleDetail,
  getUserPermissions,
  isParentOfGroup,
  searchUser,
  updateGroups,
  updateRole,
  verifyUserInGroup,
} from '~/services/role-base-access-control.server';
import {
  type Groups,
  type MustBeAny,
  type Permissions,
  type Roles,
} from '~/types';

function mockResponseThrowError() {
  const errorText = 'response return error message';

  const spy = jest
    .spyOn(global, 'Response')
    .mockImplementation(() => new Error(errorText) as MustBeAny);

  function restore() {
    spy.mockRestore();
  }
  return { restore, errorText };
}

const mockRecordCommonField = {
  createdAt: new Date('2024-03-24T00:00:00.000Z'),
  _id: 'new-role-id',
  status: 'ACTIVE',
};

jest.mock('~/services/helpers.server', () => ({
  __esModule: true,
  getUserId: () => 'root',
}));

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
    await PermissionsModel.insertMany(mockPermission);
    await UsersModel.insertMany([
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
        isoCode: 'VN',
      },
      {
        _id: managerId,
        email: 'manager@gmail.com',
        username: 'Manager user',
        createdAt: new Date(),
        status: 'ACTIVE',
        cities: ['Hà Nội'],
        isoCode: 'VN',
      },
      {
        _id: leaderId,
        email: 'leader@gmail.com',
        username: 'Leader user',
        createdAt: new Date('2024-03-25'),
        status: 'ACTIVE',
        cities: ['Đà Nẵng'],
        isoCode: 'VN',
      },
      {
        _id: employeeId,
        email: 'employee@gmail.com',
        username: 'Employee user',
        createdAt: new Date('2024-04-01'),
        status: 'INACTIVE',
        cities: ['Huế'],
        isoCode: 'VN',
      },
    ]);

    await RolesModel.insertMany([
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

    await GroupsModel.insertMany([
      {
        _id: rootId,
        userIds: [rootId],
        roleIds: [rootId],
        roleAssignedIds: [rootId],
        name: 'root',
        description: 'root group desc',
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
    await UsersModel.create({
      _id: userId,
      email: 'test1@gmail.com',
      username: 'Test 1',
      createdAt: new Date(),
      status: 'ACTIVE',
      cities: ['Hồ Chí Minh'],
      isoCode: 'VN',
    });
    await GroupsModel.create({
      _id: groupId,
      userIds: [groupId],
      roleIds: [groupId],
      name: 'groupName1',
      description: 'groupName1 desc',
      genealogy: ['genealogy1'],
      hierarchy: 2,
      createdAt: new Date('2023-12-01'),
      status: 'ACTIVE',
      isoCode: 'VN',
    });
  });

  afterEach(async () => {
    await UsersModel.deleteOne({ _id: userId });
    await GroupsModel.deleteOne({ _id: groupId });
  });

  afterAll(async () => {
    await UsersModel.deleteMany({
      _id: {
        $in: [rootId, leaderId, managerId, employeeId],
      },
    });
    await GroupsModel.deleteMany({
      _id: { $in: [rootId, leaderId, managerId, employeeId] },
    });
    await RolesModel.deleteMany({
      _id: { $in: [rootId, leaderId, managerId, employeeId] },
    });
    await PermissionsModel.deleteMany({
      _id: { $in: [rootId, leaderId, managerId, employeeId] },
    });
  });

  describe('getGroupsOfUser', () => {
    const userId = 'testUser';
    const groupId = 'testGroup';
    const roleId = 'testRole';

    beforeEach(async () => {
      await GroupsModel.create({
        _id: groupId,
        userIds: [userId],
        roleIds: [roleId],
        name: 'Test Group',
        description: 'Test Group Description',
        genealogy: ['genealogy1'],
        hierarchy: 2,
        createdAt: new Date(),
        status: 'ACTIVE',
      });
    });

    afterEach(async () => {
      await GroupsModel.deleteOne({ _id: groupId });
    });

    it('should return groups of a user', async () => {
      const projection = { _id: 1, name: 1 };
      const groups = await getGroupsOfUser({ projection, userId });
      expect(groups).toHaveLength(1);
      expect(groups[0]._id).toEqual(groupId);
      expect(groups[0].name).toEqual('Test Group');
    });

    it('should return empty array if user is not part of any group', async () => {
      const projection = { _id: 1, name: 1 };
      const groups = await getGroupsOfUser({
        projection,
        userId: 'nonexistentUser',
      });
      expect(groups).toHaveLength(0);
    });
  });

  describe('getUserPermissions', () => {
    it('should get all permissions when user is superuser', async () => {
      const permissions = await getUserPermissions(rootId);
      expect(permissions).toEqual([rootId, managerId, leaderId, employeeId]);
    });
  });

  describe('createGroup', () => {
    afterEach(async () => {
      await GroupsModel.deleteOne({ _id: mockRecordCommonField._id });
    });

    it('should createGroup successfully', async () => {
      const mockParams = {
        name: 'test',
        description: 'testing',
        parentId: rootId,
        userIds: [rootId],
        roleAssignedIds: [rootId],
      };

      await createGroup(mockParams);
      const newGroupInserted = await GroupsModel.findOne({
        name: mockParams.name,
      });
      expect(newGroupInserted?.description).toBe(mockParams.description);

      await GroupsModel.deleteOne({ name: mockParams.name });
    });
    it('should throw error if parent group not found', async () => {
      const groupData: Pick<
        Groups,
        'name' | 'description' | 'userIds' | 'roleAssignedIds'
      > & { parentId: string } = {
        name: 'Test Group',
        description: 'This is a test group',
        parentId: 'nonexistentParentId',
        userIds: ['userId1', 'userId2'],
        roleAssignedIds: ['roleId1', 'roleId2'],
      };

      await expect(createGroup(groupData)).rejects.toThrow(
        'PARENT_GROUP_NOT_FOUND',
      );
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
      status: 'ACTIVE',
    };

    beforeEach(async () => {
      await GroupsModel.create({
        _id: mockGroupId,
        ...mockData,
      });
    });

    afterEach(async () => {
      await GroupsModel.deleteOne({ _id: mockGroupId });
    });

    it('should update group successfully', async () => {
      const mockParams = {
        groupId: mockGroupId,
        ...mockData,
        name: 'updated',
        description: 'updated',
        roleAssignedIds: [rootId], // Add the roleAssignedIds property
      };
      await updateGroups(mockParams);

      const group = await GroupsModel.findOne({ _id: mockGroupId });
      expect(group?.name).toEqual('updated');
    });
  });

  describe('getRoleDetail', () => {
    it('should return detail of role correctly', async () => {
      const role: Partial<Roles> = await getRoleDetail(rootId);
      expect(role?.name).toEqual(dataRootRole.name);
    });
    it('should throw and error if role does not exist', async () => {
      const { errorText, restore } = mockResponseThrowError();
      await expect(getRoleDetail('non-exist-role')).rejects.toThrow(errorText);
      restore();
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
      isoCode: 'VN',
    };
    beforeEach(async () => {
      groups.forEach(async group => {
        await GroupsModel.create(group);
      });
      await RolesModel.create(role);
      await UsersModel.create(user);
    });
    afterEach(async () => {
      groups.forEach(async group => {
        await GroupsModel.deleteOne(group);
      });
      await RolesModel.deleteOne(role);
      await UsersModel.deleteOne(user);
    });
    it('should return group detail if user is root', async () => {
      const groupDetail = await getGroupDetail({
        isSuperUser: true,
        userId: userId1,
        groupId: groupId1,
        projection: { _id: 1 },
        isParent: true,
      });

      expect(groupDetail).toBeDefined();
      expect(groupDetail._id).toEqual(groupId1);
    });
    it('should return group detail if user is parent of group', async () => {
      const groupDetail = await getGroupDetail({
        isSuperUser: false,
        userId: userId1,
        groupId: groupId1,
        projection: { _id: 1 },
        isParent: false,
      });

      expect(groupDetail).toBeDefined();
      expect(groupDetail._id).toEqual(groupId1);
    });
    it('should throw an error if group does not exist and user is root', async () => {
      const { errorText, restore } = mockResponseThrowError();
      await expect(
        getGroupDetail({
          isSuperUser: false,
          userId,
          groupId: 'nonexistentGroupId',
          projection: { _id: 1 },
          isParent: false,
        }),
      ).rejects.toThrow(errorText);
      restore();
    });
    it('should throw an error if group does not exist and user is parent of group', async () => {
      const { errorText, restore } = mockResponseThrowError();
      await expect(
        getGroupDetail({
          isSuperUser: true,
          userId,
          groupId: 'nonexistentGroupId',
          projection: { _id: 1 },
          isParent: true,
        }),
      ).rejects.toThrow(errorText);
      restore();
    });
  });

  describe('getGroupPermissions', () => {
    it('Should get entire permission when found root permission in a group correctly', async () => {
      const result = await getGroupPermissions({
        groupId: rootId,
        isSuperUser: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(mockPermission[0]._id);
    });
    it('Should get entire permission within a group correctly', async () => {
      const result = await getGroupPermissions({
        groupId: rootId,
        isSuperUser: true,
      });

      expect(result).toHaveLength(
        mockPermission.filter(permission => permission._id !== rootId).length,
      );
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

    afterEach(async () => {
      await RolesModel.deleteOne({ _id: mockRecordCommonField._id });
    });

    it('Should create new role successfully', async () => {
      await createRole({ ...mockNewRoleInformation, groupId: managerId });

      const updatedGroupFound = await GroupsModel.findOne({ _id: managerId });

      expect(updatedGroupFound?.roleIds).toContainEqual(
        mockRecordCommonField._id,
      );
    });
  });

  describe('updateRole', () => {
    it('Should update role successfully', async () => {
      const updateValue = {
        name: 'updated role name',
        permissions: ['permission1', 'permission2'],
        description: 'updated desc',
        groupId: managerId,
      };
      await updateRole({ roleId: managerId, ...updateValue });

      const updatedRoleFound = await RolesModel.findOne({ _id: managerId });

      expect(updatedRoleFound?.name).toStrictEqual(updateValue.name);
      expect(updatedRoleFound?.permissions).toEqual(updateValue.permissions);
      expect(updatedRoleFound?.description).toStrictEqual(
        updateValue.description,
      );
    });
  });

  describe('getAllPermissions', () => {
    it('Should get all permission by projection request successfully', async () => {
      const entirePermission = await getAllPermissions();

      expect(entirePermission).toHaveLength(mockPermission.length);
      entirePermission.forEach((permission, index) => {
        expect(permission._id).toEqual(mockPermission[index]._id);
      });
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
      isoCode: 'VN',
    };

    beforeEach(async () => {
      await UsersModel.create(user);
    });

    afterEach(async () => {
      await UsersModel.deleteOne({ _id: user._id });
    });

    it('Should delete user successfully', async () => {
      await deleteUser(managerId);

      const deletedUserFound = await UsersModel.findOne({ _id: managerId });

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

    const group = {
      _id: 'groupId1',
      status: 'ACTIVE',
      name: 'groupName1',
      description: 'groupName1 desc',
      userIds: ['userId1'],
      roleIds: [role._id],
      hierarchy: 12,
      createdAt: new Date('2024-02-01'),
    };

    beforeEach(async () => {
      await RolesModel.create(role);
      await GroupsModel.create(group);
    });

    afterEach(async () => {
      await RolesModel.deleteOne({ _id: role._id });
      await GroupsModel.deleteOne({ _id: group._id });
    });

    it('Should delete role successfully', async () => {
      const deletedRoleFound = await deleteRole({
        roleId: role._id,
        groupId: group._id,
      });

      expect(deletedRoleFound).toEqual(role.name);
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
      await GroupsModel.create(group);
    });

    afterEach(async () => {
      await GroupsModel.deleteOne({ _id: group._id });
    });

    it('Should delete group by id successfully', async () => {
      await deleteGroup({ groupId: group._id });

      const deletedGroupFound = await GroupsModel.findOne({ _id: group._id });

      expect(deletedGroupFound?.status).toEqual('REMOVED');
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
      isoCode: 'VN',
    };

    beforeEach(async () => {
      groups.forEach(async group => {
        await GroupsModel.create(group);
      });
      await UsersModel.create(user);
    });

    afterEach(async () => {
      groups.forEach(async group => {
        await GroupsModel.deleteOne({ _id: group._id });
      });
      await UsersModel.deleteOne({ _id: user._id });
    });

    it('Should check parent of group correctly', async () => {
      const isParent = await isParentOfGroup({
        parentId: user._id,
        groupId: groups[0]._id,
      });

      expect(isParent).toBe(true);
    });
  });
});
