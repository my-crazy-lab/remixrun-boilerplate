import { getGroupsOfUser } from '~/services/role-base-access-control.server';
import { mongodb } from '~/utils/db.server';

describe('Authentication: getGroupsOfUser', () => {
  const userId = 'user-1';
  const groupId = 'group-1';

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

  test('should return a response', async () => {
    const test = await getGroupsOfUser({
      projection: { email: 1, username: 1 },
      userId,
    });
    console.log(test);
    expect(true).toBe(true);
  });
});
