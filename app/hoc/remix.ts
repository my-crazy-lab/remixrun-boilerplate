// HIGHER ORDER COMPONENT
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from '@remix-run/node';
import { ERROR } from '~/constants/common';
import { newRecordCommonField } from '~/services/constants.server';
import { getUserId } from '~/services/helpers.server';
import ActionsHistoryModel from '~/services/model/actionHistory.server';
import { getUserPermissions } from '~/services/role-base-access-control.server';
import { type CommonFunction, type MustBeAny } from '~/types';

/**
 *
 * @param _defaultValue
 * @warning can make memory leak
 * @returns
 */
export function closureControllerDeeply<T>(defaultValue: T) {
  let action = defaultValue;

  function get() {
    return action;
  }
  function set(_action: T) {
    action = _action;
  }

  return { get, set };
}

export function hocAction(
  callback: (
    args: ActionFunctionArgs,
    { setInformationActionHistory }: MustBeAny,
  ) => MustBeAny,
  permission?: string | Array<string>,
) {
  async function action(args: ActionFunctionArgs) {
    try {
      const userId = await getUserId({ request: args.request });

      if (permission) {
        const userPermissions = await getUserPermissions(userId);

        if (typeof permission === 'string') {
          if (!userPermissions.includes(permission)) {
            throw new Response(null, res403);
          }
        } else {
          let flag = false;

          // verify array permissions with user's permission
          permission.forEach(p => {
            if (userPermissions.includes(p)) {
              flag = true;
            }
          });
          if (!flag) {
            throw new Response(null, res403);
          }
        }
      }

      const formData = await args.request.clone().formData();
      const requestFormData = Object.fromEntries(formData);

      const newActionHistory = new ActionsHistoryModel({
        ...newRecordCommonField(),
      });
      if (userId) newActionHistory.actorId = userId;

      const { get, set } = closureControllerDeeply<{
        action: string;
        dataRelated?: MustBeAny;
        actorId?: string;
        ignoreFormData?: boolean;
      }>({ action: '' });
      const actionResult = await callback(args, {
        setInformationActionHistory: set,
      });

      const {
        action,
        dataRelated,
        actorId: actorIdPassed,
        ignoreFormData,
      } = get();

      // Just save action history when had action name
      if (action) {
        newActionHistory.action = action;
        if (actorIdPassed) newActionHistory.actorId = actorIdPassed;

        // case insert data
        if (dataRelated) {
          newActionHistory.requestFormData = {
            ...(ignoreFormData ? {} : requestFormData),
            ...dataRelated,
          };
        } else {
          newActionHistory.requestFormData = requestFormData;
        }

        await newActionHistory.save();
      }

      return actionResult;
    } catch (error) {
      if (error instanceof Error) {
        return json({ error: error.message });
      }
      return json({ error: ERROR.UNKNOWN_ERROR });
    }
  }

  return action;
}

export function hocLoader(
  callback: CommonFunction<LoaderFunctionArgs>,
  permission: string,
) {
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
  statusText: 'INTERNAL_SERVER_ERROR',
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
