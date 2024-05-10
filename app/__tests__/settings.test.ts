import ActionsHistoryModel from '~/services/model/actionHistory.server';
import GroupsModel from '~/services/model/groups.server';
import UsersModel from '~/services/model/users.server';
import {
  changeUserAvatar,
  createNewUser,
  getActionsHistoryManagedByManagerId,
  getTotalActionsHistoryManageByManagerId,
  getTotalUsersManagedByManagerId,
  getUserProfile,
  getUsersManagedByManagerId,
  setUserLanguage,
} from '~/services/settings.server';
import type { ActionsHistory, Groups, Users } from '~/types';

describe('Setting page', () => {
  const managerId = 'manager';
  const mockUserId = 'user-1';
  const mockUserId_2 = 'user-2';

  const mockActionId = 'action-history';
  const mockActionId_2 = 'action-history-2';

  const mockGroupId = 'group-1';
  const mockGroupId_2 = 'group-2';

  const mockUsers: Array<Users> = [
    {
      _id: mockUserId,
      username: mockUserId,
      status: 'ACTIVE',
      email: 'user-1@gmail.com',
      isoCode: 'VN',
      createdAt: new Date(),
      cities: ['Hồ Chí Minh', 'Hà Nội'],
      language: 'vi',
    },
    {
      _id: mockUserId_2,
      username: mockUserId_2,
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
      genealogy: [], // group parent
    },
    {
      _id: mockGroupId_2,
      name: 'Group 2',
      userIds: [mockUserId_2, mockUserId],
      createdAt: new Date(),
      description: 'group description',
      roleAssignedIds: [],
      hierarchy: 2,
      status: 'ACTIVE',
      genealogy: [mockGroupId], // include group parent id
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

  describe('getTotalActionsHistory', () => {
    it('should return total action history correctly', async () => {
      const result = await getTotalActionsHistoryManageByManagerId({
        searchText: '',
        managerId: mockUserId,
      });
      expect(result).toEqual(mockActionsHistory.length);
    });

    it('should return total action history correctly with search text', async () => {
      const mockSearchText =
        mockUsers.find(user => user._id === mockUserId)?.username || '';

      const result = await getTotalActionsHistoryManageByManagerId({
        searchText: mockSearchText,
        managerId: mockUserId,
      });

      expect(result).toEqual(1);
    });
  });

  describe('getActionsHistory', () => {
    it('should return data action history correctly with skip and limit', async () => {
      const skip = 1;
      const limit = 10;
      const actionsHistory = await getActionsHistoryManagedByManagerId({
        searchText: '',
        skip,
        limit,
        projection: {
          username: '$user.username',
          action: 1,
          data: 1,
          createdAt: 1,
        },
        managerId: mockUserId,
      });

      expect(actionsHistory).toHaveLength(1);
      expect(actionsHistory[0]._id).toEqual(mockActionId_2);
    });
    it('should not return data action history correctly with searchText', async () => {
      const randomText = 'randomText';
      const skip = 1;
      const limit = 10;
      const actionsHistory = await getActionsHistoryManagedByManagerId({
        searchText: randomText,
        skip,
        limit,
        projection: {
          username: '$user.username',
          action: 1,
          data: 1,
          createdAt: 1,
        },
        managerId: mockUserId,
      });

      expect(actionsHistory).toHaveLength(0);
    });
  });

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

  describe('setUserLanguage & changeAvatarUrl', () => {
    it('Should set user language successfully', async () => {
      const mockParams = {
        userId: mockUserId,
        language: 'en',
      };
      await setUserLanguage(mockParams);

      const updatedUser = await UsersModel.findOne({ _id: mockUserId });
      expect(updatedUser?.language).toEqual(mockParams.language);
    });

    it('should handle change avatar Url', async () => {
      const avatarUrl = 'imageUrl';

      await changeUserAvatar({ avatarUrl, userId: mockUserId });

      const updatedUser = await UsersModel.findOne({ _id: mockUserId });
      expect(updatedUser?.avatarUrl).toEqual(avatarUrl);
    });
  });

  describe('getTotalUsersManagedByManagerId', () => {
    it('should return 0 when manager has no users managed', async () => {
      const total = await getTotalUsersManagedByManagerId(managerId);
      expect(total).toEqual(0);
    });

    it('should return total user managed by manager id', async () => {
      const total = await getTotalUsersManagedByManagerId(mockUserId);
      expect(total).toEqual(mockUsers.length);
    });
  });

  describe('getUsersManagedByManagerId', () => {
    it('should return Users Managed By Manager Id', async () => {
      const skip = 1;
      const limit = 10;
      const users = await getUsersManagedByManagerId({
        skip,
        limit,
        projection: {
          username: 1,
          createdAt: 1,
        },
        managerId: mockUserId,
      });
      users.map(user => expect(user.username).toEqual(mockUserId_2));
      expect(users.length).toEqual(1);
    });
  });
});
