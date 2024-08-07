// HIGHER ORDER COMPONENT
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from '@remix-run/node';
import { ACTION_NAME, ERROR, res403, res404 } from '~/constants/common';
import i18next from '~/i18next.server';
import { newRecordCommonField } from '~/services/constants.server';
import { getUserId } from '~/services/helpers.server';
import ActionsHistoryModel from '~/services/model/actionHistory.server';
import { httpRequestDurationMicroseconds } from '~/services/prometheus-client.server';
import { getUserPermissionsIgnoreRoot } from '~/services/role-base-access-control.server';
import type { MustBeAny } from '~/types';

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

type SetInformationActionHistory = (args: {
  action: string;
  dataRelated?: MustBeAny;
}) => void;
export function hocAction<A>(
  callback: (
    args: ActionFunctionArgs,
    argsHoc: { setInformationActionHistory: SetInformationActionHistory },
  ) => A,
  permission?: string | Array<string>,
) {
  async function action(args: ActionFunctionArgs) {
    const startEpoch = Date.now();
    const url = new URL(args.request.url);
    const router = url.pathname;
    const method = args.request.method;

    try {
      const userId = await getUserId({ request: args.request });

      if (permission) {
        const userPermissions = await getUserPermissionsIgnoreRoot(userId);

        if (typeof permission === 'string') {
          if (!userPermissions.includes(permission)) {
            const responseTimeInMs = Date.now() - startEpoch;
            httpRequestDurationMicroseconds
              .labels(method, router, '403')
              .observe(responseTimeInMs);

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
            const responseTimeInMs = Date.now() - startEpoch;
            httpRequestDurationMicroseconds
              .labels(method, router, '403')
              .observe(responseTimeInMs);

            throw new Response(null, res403);
          }
        }
      }

      const newActionHistory = new ActionsHistoryModel({
        ...newRecordCommonField(),
      });
      const { get, set } = closureControllerDeeply<{
        action: string;
        dataRelated?: MustBeAny;
        actorId?: string;
      }>({ action: '' });

      const actionResult = await callback(args, {
        setInformationActionHistory: set,
      });

      const { action, dataRelated } = get();

      // case login: special
      // must have dataRelated
      if (action === ACTION_NAME.LOGIN) {
        newActionHistory.action = action;
        newActionHistory.actorId = dataRelated.userId;

        await newActionHistory.save();
      } else if (action) {
        const formData = await args.request.clone().formData();
        const requestFormData = Object.fromEntries(formData);

        newActionHistory.actorId = userId;
        newActionHistory.action = action;

        // case insert data
        newActionHistory.requestFormData = {
          ...(requestFormData ? requestFormData : {}),
          ...(dataRelated ? dataRelated : {}),
        };

        await newActionHistory.save();
      }

      const responseTimeInMs = Date.now() - startEpoch;
      httpRequestDurationMicroseconds
        .labels(method, router, '200')
        .observe(responseTimeInMs);

      return actionResult;
    } catch (error) {
      const t = await i18next.getFixedT(args.request, 'user-settings');
      if (error instanceof Error) {
        const responseTimeInMs = Date.now() - startEpoch;
        httpRequestDurationMicroseconds
          .labels(method, router, '500')
          .observe(responseTimeInMs);

        return json({ error: t(error.message) });
      }

      const responseTimeInMs = Date.now() - startEpoch;
      httpRequestDurationMicroseconds
        .labels(method, router, '500')
        .observe(responseTimeInMs);

      return json({ error: t(ERROR.UNKNOWN_ERROR), detail: error });
    }
  }

  return action;
}

export function hocLoader<A>(
  callback: (
    args: LoaderFunctionArgs,
    argsHoc: { permissionsPassed: Array<string> },
  ) => A,
  permission?: string | Array<string>,
) {
  async function loader(args: LoaderFunctionArgs) {
    const startEpoch = Date.now();
    const url = new URL(args.request.url);
    const router = url.pathname;
    const method = args.request.method;

    const userId = await getUserId({ request: args.request });
    const userPermissions = await getUserPermissionsIgnoreRoot(userId);

    if (
      typeof permission === 'string' &&
      !userPermissions.includes(permission)
    ) {
      const responseTimeInMs = Date.now() - startEpoch;
      httpRequestDurationMicroseconds
        .labels(method, router, '403')
        .observe(responseTimeInMs);

      throw new Response(null, res403);
    }

    if (Array.isArray(permission)) {
      const permissionsPassed: Array<string> = [];
      permission.forEach(p => {
        if (userPermissions.includes(p)) {
          permissionsPassed.push(p);
        }
      });
      if (!permissionsPassed.length) {
        const responseTimeInMs = Date.now() - startEpoch;
        httpRequestDurationMicroseconds
          .labels(method, router, '403')
          .observe(responseTimeInMs);

        throw new Response(null, res403);
      }

      const loaderResult = await callback(args, {
        permissionsPassed: permissionsPassed,
      });

      const responseTimeInMs = Date.now() - startEpoch;
      httpRequestDurationMicroseconds
        .labels(method, router, '200')
        .observe(responseTimeInMs);
      return loaderResult;
    }

    const loaderResult = await callback(args, {
      permissionsPassed: permission ? [permission] : [],
    });

    const responseTimeInMs = Date.now() - startEpoch;
    httpRequestDurationMicroseconds
      .labels(method, router, '200')
      .observe(responseTimeInMs);

    return loaderResult;
  }

  return loader;
}

export interface ErrorResponse {
  status: number;
  statusText: string;
}

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
