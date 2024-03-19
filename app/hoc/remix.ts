// HIGHER ORDER COMPONENT

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { getUserId, saveActionHistory } from '~/services/helpers.server';
import { getUserPermissions } from '~/services/role-base-access-control.server';

export function hocAction(
  callback: (args: ActionFunctionArgs, { formData }: any) => any,
  permission: string,
) {
  async function action(args: ActionFunctionArgs) {
    const userId = await getUserId({ request: args.request });
    const userPermissions = await getUserPermissions(userId);

    if (!userPermissions.includes(permission)) {
      throw new Response(null, res403);
    }

    const formData = await args.request.formData();
    const data = Object.fromEntries(formData);

    await saveActionHistory(args, data);
    return callback(args, { formData: data });
  }

  return action;
}

export function hocLoader(callback: any, permission: string) {
  async function loader(args: LoaderFunctionArgs) {
    const userId = await getUserId({ request: args.request });
    const userPermissions = await getUserPermissions(userId);
    if (!userPermissions.includes(permission)) {
      throw new Response(null, res403);
    }

    return callback(args);
  }

  return loader;
}

export const res500 = {
  status: 500,
  statusText: 'SERVER_ERROR',
};
export const res404 = {
  status: 404,
  statusText: 'PAGE_NOT_FOUND',
};
export const res403 = {
  status: 403,
  statusText: 'NOT_PERMISSION_TO_ACCESS',
};
export const res403GroupParent = {
  status: 403,
  statusText: 'NOT_PARENT_OF_GROUP',
};

export async function hoc404<TResult>(callback: () => Promise<TResult>) {
  const result = await callback();
  if ((Array.isArray(result) && !result.length) || !result) {
    throw new Response(null, res404);
  }

  return result;
}

export async function hoc403<TResult>(callback: () => Promise<TResult>) {
  const result = await callback();
  if ((Array.isArray(result) && !result.length) || !result) {
    throw new Response(null, res403);
  }

  return result;
}
