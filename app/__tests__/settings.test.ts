import { createNewUser, getActionsHistory, getTotalActionsHistory, getTotalUsers, getUserProfile, getUsers } from "~/services/settings.server";
import type { ActionsHistory, Users } from "~/types";
import { mongodb } from "~/utils/db.server";

describe('Setting page', () => {
  const mockUserId = 'user-1';
  const mockUserId_2 = 'user-2';

  const mockActionId = 'action-history';
  const mockActionId_2 = 'action-history-2';

  const mockUsers: Array<Users> = [
    {
      _id: mockUserId,
      email: 'test1@gmail.com',
      username: 'Test 1',
      createdAt: new Date(),
      status: 'ACTIVE',
      cities: ['Hồ Chí Minh'],
    },
    {
      _id: mockUserId_2,
      email: 'test2@gmail.com',
      username: 'Test 2',
      createdAt: new Date(),
      status: 'ACTIVE',
      cities: ['Hồ Chí Minh', 'HN'],
    },
  ]

  const mockActionsHistory: Array<ActionsHistory> = [
    {
      _id: mockActionId,
      data: {
        "name": "mkt",
        "description": "child rooot",
        "userIds": "[\"65eac266901400e13f73cebf\",\"R5pRgZqKyhTKRX2N22\"]",
        "roleIds": "[\"root\"]"
      },
      userId: mockUserId,
      action: "create",
      createdAt: new Date()
    },
    {
      _id: mockActionId_2,
      data: {
        "name": "mkt",
        "description": "child rooot",
        "userIds": "[\"65eac266901400e13f73cebf\",\"R5pRgZqKyhTKRX2N22\"]",
        "roleIds": "[\"root\"]"
      },
      userId: mockUserId,
      action: "create",
      createdAt: new Date()
    }
  ]

  beforeAll(async () => {
    await mongodb
      .collection<Users>('users')
      .insertMany(mockUsers);
    await mongodb
      .collection<ActionsHistory>('actionsHistory')
      .insertMany(mockActionsHistory);
  })

  afterAll(async () => {
    await mongodb.collection<Users>('users').deleteMany({
      _id: {
        $in: [mockUserId, mockUserId_2],
      },
    });
    await mongodb.collection<ActionsHistory>('actionsHistory').deleteMany({
      _id: {
        $in: [mockActionId, mockActionId_2],
      },
    });
  });

  describe('getTotalActionHistory', () => {
    it('should return total action history correctly', async () => {
      const total = await getTotalActionsHistory({ searchText: '' });
      expect(total).toEqual(mockActionsHistory.length)
    })

    it('should return total action history correctly with search text', async () => {
      const total = await getTotalActionsHistory({ searchText: 'searchText' });
      expect(total).toEqual(0)
    })
  })

  describe('getActionsHistory', () => {
    it('should return data action history correctly', async () => {
      const actionsHistory = await getActionsHistory({
        searchText: '',
        skip: 0,
        limit: 4,
        projection: {
          username: '$user.username',
          action: 1,
          data: 1,
          createdAt: 1,
        },
      });

      expect(actionsHistory).toHaveLength(mockActionsHistory.length);
      mockActionsHistory.forEach((action, index) => {
        expect(actionsHistory[index]._id).toEqual(action._id);
      })
    })

    it('should return data action history correctly with search text', async () => {
      const actionsHistory = await getActionsHistory({
        searchText: 'abc',
        skip: 0,
        limit: 4,
        projection: {
          username: '$user.username',
          action: 1,
          data: 1,
          createdAt: 1,
        },
      });

      expect(actionsHistory).toHaveLength(0);
    })
  })

  describe('getTotalUsers', () => {
    it('should return total data user correctly', async () => {
      const total = await getTotalUsers();

      expect(total).toEqual(mockUsers.length)
    })
  })

  describe('getUsers', () => {
    it('should return data users correctly', async () => {
      const users = await getUsers({});

      expect(users).toHaveLength(mockUsers.length);
      expect(users).toEqual(mockUsers);
    })
  })

  describe('getUserProfile', () => {
    it('should return data user correctly', async () => {
      mockUsers.forEach(async user => {
        const userProfile = await getUserProfile(user._id);
        expect(userProfile).toEqual(user);
      })
    })
  })

  describe('createNewUser', () => {
    it('should create new user successfully', async () => {
      const mockParams = {
        username: 'rootUser',
        password: '123',
        email: 'root@gmail.com',
        cities: ['HCM', 'HN'],
      };

      await createNewUser(mockParams);
      const newUser = await mongodb
        .collection('users')
        .findOne({ username: mockParams.username });

      expect(newUser?.username).toBe(mockParams.username);

      await mongodb
        .collection<Users>('users')
        .deleteOne({ username: mockParams.username });
    });
  });
})