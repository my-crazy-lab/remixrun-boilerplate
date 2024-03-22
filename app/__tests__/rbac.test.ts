import {
  getGroupsOfUser,
  isRoot,
  verifyPermissions,
} from '~/services/role-base-access-control.server';
import {
  describe,
  expect,
  test,
  beforeEach,
  afterEach,
  afterAll,
  it,
  beforeAll,
} from '@jest/globals';
import { mongodb } from '~/utils/db.server';

describe('Role base access control', () => {
  const rootId = 'root';
  const managerId = 'manager';
  const leaderId = 'leader';
  const employeeId = 'employee';

  const userId = 'user-1';
  const groupId = 'group-1';

  beforeAll(async () => {
    await mongodb.collection('permissions').insertMany([
      {
        _id: rootId,
        name: 'ROOT',
        description: 'ROOT',
        module: 'admin',
      },
      {
        _id: managerId,
        name: 'MANAGER',
        description: 'MANAGER',
        module: 'admin',
      },
      {
        _id: leaderId,
        name: 'LEADER',
        module: 'admin',
        descriiiption: 'LEADER',
      },
      {
        _id: employeeId,
        name: 'EMPLOYEE',
        description: 'EMPLOYEE',
        module: 'admin',
      },
    ]);

    await mongodb.collection('users').insertMany([
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
        name: 'Root role',
        description: 'Root description',
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
    /*
    await mongodb.collection('permissions').insertMany([
      {
        _id: 'write/marketing-report',
        name: 'marketing report: export',
        description: 'Marketing report: write',
        module: 'marketing',
      },
      {
        _id: 'read/marketing-report',
        name: 'marketing report: read',
        description: 'Marketing report: read',
        module: 'marketing',
      },
    ]);
    */
  });

  afterEach(async () => {
    await mongodb.collection('users').deleteOne({ _id: userId });
    await mongodb.collection('groups').deleteOne({ _id: groupId });
  });

  afterAll(async () => {
    await mongodb
      .collection('users')
      .deleteMany({ _id: [rootId, leaderId, managerId, employeeId] });
    await mongodb
      .collection('groups')
      .deleteMany({ _id: [rootId, leaderId, managerId, employeeId] });
    await mongodb
      .collection('roles')
      .deleteMany({ _id: [rootId, leaderId, managerId, employeeId] });
    await mongodb
      .collection('permissions')
      .deleteMany({ _id: [rootId, leaderId, managerId, employeeId] });
  });

  describe('getGroupsOfUser', () => {
    it('return a response', async () => {
      const test = await getGroupsOfUser({
        projection: { email: 1, username: 1 },
        userId,
      });
      console.log(test);
      expect(true).toBe(false);
    });
  });

  describe('isroot', () => {
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
      const request = new Request({});
      const permissions = [""];

      const rootuser = await verifyPermissions({request},permissions);
      expect(rootuser).toBeTruthy();
    });

    it('should return false when use is not superuser', async () => {
      const rootuser = await verifyPermissions('');
      expect(rootuser).tobeFalsy();
    });
  });
});
