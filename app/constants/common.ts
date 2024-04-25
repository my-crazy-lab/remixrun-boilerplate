export const PERMISSIONS = {
  ROOT: 'root',
  MANAGER: 'manager',
  WRITE_USER: 'write/user-management',
  WRITE_ROLE: 'write/role-management',
  READ_ROLE: 'read/role-management',
  WRITE_GROUP: 'write/group-management',
  READ_GROUP: 'read/group-management',
  READ_ACTION_HISTORY: 'read/action-history',
};

export const ACTION_NAME = {
  CREATE_GROUP: 'Create group',
  UPDATE_GROUP: 'Update group',
  CREATE_ROLE: 'Create role',
  UPDATE_ROLE: 'Update role',
  CREATE_USER: 'Create user',
};

export enum IActionPermissionModule {
  task = 'task',
  tasker = 'tasker',
  special = 'special',
}

export type TActionPermissionModule = keyof typeof IActionPermissionModule;

export const PIE_CHART_COLOR = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF6666',
  '#66CCCC',
  '#FF9999',
  '#99CC66',
  '#FF6600',
  '#996699',
  '#9999FF',
  '#66FF99',
  '#66FFCC',
  '#FFCC66',
  '#666699',
  '#6666CC',
  '#996666',
  '#996633',
];

export const ERROR = {
  EMAIL_INCORRECT: 'EMAIL_INCORRECT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  LINK_EXPIRED: 'LINK_EXPIRED',
  PASSWORD_NOT_MATCH: 'PASSWORD_NOT_MATCH',
  PARENT_GROUP_NOT_FOUND: 'PARENT_GROUP_NOT_FOUND',
};
