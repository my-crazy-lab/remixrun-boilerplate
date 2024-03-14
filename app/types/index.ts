import { TActionPermissionModule } from '~/constants/common';

export interface Permissions {
  _id: string;
  name: string;
  feature: string;
  description: string;
  module: string;
  createdAt: Date;
  updatedAt?: Date;
  status?: string;
}

export interface Roles {
  _id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt?: Date;
  status?: string;
  inherited?: boolean;
}

export interface Groups {
  _id: string;
  name: string;
  description: string;
  userIds: Array<string>;
  roleIds: Array<string>;
  parent: string;
  hierarchy: number;
  createdAt: Date;
  updatedAt?: Date;
  status?: string;
}

/*
  Flow: root create Groups with hierarchy = 2, parent=root
              auto add permission "groups-control" 
              add user + roles into Groups
              when have new feature -> new permissions -> update into roles of Groups 
        manager create Groups with hierarchy = 3, parent=Groups's id of manager 
                add user + roles, because don't have "groups-control" cannot create any hierarchy form there 
                any manager have permission "groups-control" so when add this permission into any group, this group can control and create groups children 
                
  View: H1 any groups created by H1 is always H2
        H2 any groups created by H2 is always H3 
        H1 can see list groups H2 they control 
        H2 can see list groups H2 they're in, and list groups H3 they control
        When create group, must to create from a group higher hierarchy and have permission group-control 
        when add role into groups, just choose role of parent group and have permission group-control  
        when create roles, just choose permission form roles of parent groups and have permission group-control
        Create User -> just have permission group-control 
        -- 
        UI Profile / Groups / History 
          Groups show list group we're in, and groups children of it, don't have create group at here 
          click to go to group detail
          Just users in parent can edit information of children groups, add/delete user, edit roles 
          In Groups without groups-control: Read users, read roles, read more detail 
          In Groups with group-control: 
            create child group: can create users + roles for children group from this groups's roles 
            
          

  Hierarchy 1: root 
    see all permission when set in any roles 
    can create Groups for Hierarchy 2
  Hierarchy 2: manager 
    can create Groups for Hierarchy 3
  Hierarchy 3: list users in Groups

  * */

export type NonEmptyArray<T> = [T, ...T[]];

export type AddArguments<
  F extends (...args: any[]) => any,
  Args extends any[],
> = (...args: [...Parameters<F>, ...Args]) => ReturnType<F>;

export interface IActionPermission {
  module: TActionPermissionModule;
  actions: Array<{
    _id: string;
    name: string;
    description: string;
    module: TActionPermissionModule;
    children?: Array<{ _id: string }>;
  }>;
}
