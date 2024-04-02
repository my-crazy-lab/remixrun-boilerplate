export const PERMISSIONS = {
  ROOT: 'root',
  WRITE_USER: 'write/user-management',
  READD_USER: 'read/user-management',
  WRITE_ROLE: 'write/role-management',
  READ_ROLE: 'read/role-management',
  WRITE_GROUP: 'write/group-management',
  READ_GROUP: 'read/group-management',
};

export enum IActionPermissionModule {
  task = 'task',
  tasker = 'tasker',
  special = 'special',
}

export type TActionPermissionModule = keyof typeof IActionPermissionModule;

export const ERROR = {
  EMAIL_INCORRECT: 'EMAIL_INCORRECT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  LINK_EXPIRED: 'LINK_EXPIRED',
  PASSWORD_NOT_MATCH: 'PASSWORD_NOT_MATCH',
  PARENT_GROUP_NOT_FOUND: 'PARENT_GROUP_NOT_FOUND',
};
