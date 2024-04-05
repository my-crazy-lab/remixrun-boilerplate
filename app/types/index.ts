import type { TActionPermissionModule } from '~/constants/common';
import type { Document } from 'mongodb';

export interface Users {
  _id: string;
  username: string;
  email: string;
  createdAt: Date;
  status: string;
  cities: Array<string>;
  services?: {
    password: {
      bcrypt: string;
    };
  };
  verification?: {
    code: string;
    token: string;
    expired: Date;
  };
  resetPassword?: {
    token: string;
    expired: Date;
  };
}

export interface Permissions {
  _id: string;
  name: string;
  description: string;
  module: string;
  'slug-module': string;
}

export interface Roles {
  _id: string;
  name: string;
  description: string;
  permissions: Array<string>;
  slug: string;
  createdAt: Date;
  updatedAt?: Date;
  status: string;
}

export interface Groups {
  _id: string;
  name: string;
  description: string;
  userIds: Array<string>;
  roleIds: Array<string>;
  genealogy?: Array<string>;
  hierarchy: number;
  createdAt: Date;
  updatedAt?: Date;
  status: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MustBeAny = any;

export type NonEmptyArray<T> = [T, ...T[]];

export type AddArguments<
  F extends (...args: MustBeAny[]) => MustBeAny,
  Args extends MustBeAny[],
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

export interface CollectionIdString extends Document {
  _id: string;
}

export type ReturnValueIgnorePromise<
  T extends (...args: MustBeAny) => MustBeAny,
> = ReturnType<T> extends Promise<infer A> ? A : never;

export type CommonFunction<T, R = MustBeAny> = (arg: T) => R;
