export interface Permissions {}

export interface Teams {}

export interface Roles {}

export interface Groups {}

export type NonEmptyArray<T> = [T, ...T[]];

export type AddArguments<
  F extends (...args: any[]) => any,
  Args extends any[],
> = (...args: [...Parameters<F>, ...Args]) => ReturnType<F>;
