import { type Permissions } from '~/types';

export interface GetRolesOfGroupsProjection {
  roles: {
    name: string;
    _id: string;
  }[];
}

export interface ActionPermissions {
  module: string;
  actions: Array<Omit<Permissions, 'module'>>;
}
