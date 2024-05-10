import {
  type ActionFunction,
  type LoaderFunction,
  type TypedResponse,
} from '@remix-run/node';

export type OptionType = {
  label: string;
  value: string;
};

export interface AuthenticatorSessionData
  extends Pick<
    Users,
    'isoCode' | 'cities' | 'email' | 'username' | 'language' | 'avatarUrl'
  > {
  userId: string;
  isSuperUser: boolean;
  isManager: boolean;
}

export interface ActionsHistory {
  _id: string;
  actorId: string;
  action: string;
  requestFormData: MustBeAny;
  createdAt: Date;
}

export interface Users {
  _id: string;
  username: string;
  email: string;
  isoCode: string;
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
  language: string;
  avatarUrl?: string;
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
  roleIds?: Array<string>;
  roleAssignedIds: Array<string>;
  nearestChildren?: Array<string>;
  genealogy?: Array<string>;
  hierarchy: number;
  createdAt: Date;
  updatedAt?: Date;
  status: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MustBeAny = any;

export type NonEmptyArray<T> = [T, ...T[]];

export type ReturnValueIgnorePromise<
  T extends (...args: MustBeAny) => MustBeAny,
> = ReturnType<T> extends Promise<infer A> ? A : never;

export type CommonFunction<T = MustBeAny, R = MustBeAny> = (arg: T) => R;

export type ActionTypeWithError<T extends ActionFunction> = T extends (
  args: infer ActionArguments,
) => Promise<
  | Promise<infer CallbackReturn>
  | TypedResponse<{
      error: string;
    }>
>
  ? CallbackReturn extends TypedResponse<infer JsonArguments>
    ? (
        args: ActionArguments,
      ) => Promise<
        TypedResponse<
          [JsonArguments] extends [never]
            ? { error?: string }
            : JsonArguments & { error?: string }
        >
      >
    : never
  : never;

export type LoaderTypeWithError<T extends LoaderFunction> = T extends (
  args: infer Args,
) => Promise<
  | Promise<TypedResponse<infer CallbackReturn>>
  | TypedResponse<{
      error: string;
    }>
>
  ? (
      args: Args,
    ) => Promise<
      TypedResponse<
        [CallbackReturn] extends [never]
          ? { error?: string }
          : CallbackReturn extends infer JsonReturn
            ? JsonReturn & { error?: string }
            : never
      >
    >
  : never;
