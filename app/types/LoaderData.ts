import { type Groups } from '.';

export interface GroupDetail {
  group: {
    _id: string;
    roles: Array<{
      _id: string;
      name: string;
      description: string;
    }>;
    users: Array<{
      _id: string;
      email: string;
      username: string;
    }>;
    children: Array<{
      _id: string;
      name?: string;
      description?: string;
      userIds?: Array<string>;
      nearestChildren: Array<Groups>;
    }>;
    name: string;
    description: string;
    nearestChildren: Array<Groups>;
  };
}
