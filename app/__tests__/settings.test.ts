import ActionsHistoryModel from '~/services/model/actionHistory.server';
import GroupsModel from '~/services/model/groups.server';
import UsersModel from '~/services/model/users.server';
import { createNewUser, getUserProfile } from '~/services/settings.server';
import type { ActionsHistory, Groups, Users } from '~/types';

describe('Setting page', () => {
  const mockUserId = 'user-1';
  const mockUserId_2 = 'user-2';

  const mockActionId = 'action-history';
  const mockActionId_2 = 'action-history-2';

  const mockGroupId = 'group-1';
  const mockGroupId_2 = 'group-2';

  const mockUsers: Array<Users> = [
    {
      _id: mockUserId,
      username: 'Test 1',
      status: 'ACTIVE',
      email: 'user-1@gmail.com',
      isoCode: 'VN',
      createdAt: new Date(),
      cities: ['Hồ Chí Minh', 'Hà Nội'],
      language: 'vi',
    },
    {
      _id: mockUserId_2,
      username: 'Test 2',
      status: 'ACTIVE',
      email: 'user-2@gmail.com',
      isoCode: 'VN',
      createdAt: new Date(),
      cities: ['Hồ Chí Minh', 'Hà Nội'],
      language: 'vi',
    },
  ];

  const mockActionsHistory: Array<ActionsHistory> = [
    {
      _id: mockActionId,
      actorId: mockUserId,
      action: 'create',
      requestFormData: {},
      createdAt: new Date(),
    },
    {
      _id: mockActionId_2,
      actorId: mockUserId_2,
      action: 'create',
      requestFormData: {},
      createdAt: new Date(),
    },
  ];

  const mockGroups: Array<Groups> = [
    {
      _id: mockGroupId,
      name: 'Group 1',
      userIds: [mockUserId],
      createdAt: new Date(),
      description: 'group description',
      roleAssignedIds: [],
      hierarchy: 2,
      status: 'ACTIVE',
      genealogy: [mockGroupId_2],
    },
    {
      _id: mockGroupId_2,
      name: 'Group 2',
      userIds: [mockUserId_2],
      createdAt: new Date(),
      description: 'group description',
      roleAssignedIds: [],
      hierarchy: 2,
      status: 'ACTIVE',
      genealogy: ['group-3'],
    },
  ];

  beforeAll(async () => {
    await UsersModel.insertMany(mockUsers);
    await ActionsHistoryModel.insertMany(mockActionsHistory);
    await GroupsModel.insertMany(mockGroups);
  });

  afterAll(async () => {
    await UsersModel.deleteMany({
      _id: {
        $in: [mockUserId, mockUserId_2],
      },
    });
    await ActionsHistoryModel.deleteMany({
      _id: {
        $in: [mockActionId, mockActionId_2],
      },
    });
    await GroupsModel.deleteMany({
      _id: {
        $in: [mockGroupId, mockGroupId_2],
      },
    });
  });

  // describe('getTotalActionsHistory', () => {
  //   it('should return total action history correctly', async () => {
  //     const result = await getTotalActionsHistory({
  //       searchText: '',
  //       userId: mockUserId,
  //     });
  //     expect(result).toEqual(
  //       mockActionsHistory.filter(action => action.actorId !== mockUserId)
  //         .length,
  //     );
  //   });

  //   it('should return total action history correctly with search text', async () => {
  //     const mockSearchText =
  //       mockUsers.find(user => user._id === mockUserId_2)?.username || '';

  //     const result = await getTotalActionsHistory({
  //       searchText: mockSearchText,
  //       userId: mockUserId,
  //     });

  //     expect(result).toEqual(
  //       mockActionsHistory.filter(action => action.actorId !== mockUserId)
  //         .length,
  //     );
  //   });
  // });

  // describe('getActionsHistory', () => {
  //   it('should return data action history correctly with skip and limit', async () => {
  //     const skip = 1;
  //     const limit = 10;
  //     const actionsHistory = await getActionsHistory({
  //       searchText: '',
  //       skip,
  //       limit,
  //       projection: {
  //         username: '$user.username',
  //         action: 1,
  //         data: 1,
  //         createdAt: 1,
  //       },
  //       userId: mockUserId,
  //     });
  //     expect(actionsHistory).toHaveLength(
  //       mockActionsHistory.filter(action => action.actorId !== mockUserId)
  //         .length,
  //     );
  //     expect(actionsHistory[0]).toEqual(
  //       actionsHistory.find(action => action._id === mockActionId_2),
  //     );
  //   });
  // });

  describe('getUserProfile', () => {
    it('should return data user correctly', async () => {
      const result = await getUserProfile(mockUserId);

      expect(result?._id).toEqual(
        mockUsers.find(user => user._id === mockUserId)?._id,
      );
    });
  });

  describe('createNewUser', () => {
    test('should create new user successfully', async () => {
      const mockUsername = 'thienduy.cao';
      const mockParams = {
        username: mockUsername,
        email: 'thienduy.cao@btaskee.com',
        cities: ['Hồ Chí Minh', 'Hà Nội'],
        isoCode: 'VN',
        groupIds: [mockGroupId],
      };

      const result = await createNewUser(mockParams);
      const groups = await GroupsModel.find({
        _id: { $in: mockParams.groupIds },
      });

      expect(result.username).toEqual(mockParams.username);
      expect(result.email).toEqual(mockParams.email);
      expect(result.cities).toEqual(mockParams.cities);

      groups.forEach(group => {
        expect(group.userIds).toContain(result._id);
      });

      await UsersModel.deleteOne({
        username: mockUsername,
      });
    });
  });
});
