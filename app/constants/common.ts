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
