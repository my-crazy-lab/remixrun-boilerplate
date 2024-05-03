import moment, {
  type DurationInputArg1,
  type DurationInputArg2,
} from 'moment-timezone';
import { type Permissions, type Roles } from '~/types';
import { type ActionPermissions } from '~/types/bridge';

moment.tz.setDefault('Asia/Jakarta');
moment.locale('en');

export const momentTz = moment;

export const getFutureTime = (
  date: Date,
  ...args: [amount?: DurationInputArg1, unit?: DurationInputArg2]
) => momentTz(date).add(...args);
export const getFutureTimeFromToday = (
  ...args: [amount?: DurationInputArg1, unit?: DurationInputArg2]
) => momentTz().add(...args);

export function groupPermissionsByModule(permissions: Permissions[]) {
  return Object.values(
    permissions.reduce(
      (
        acc: {
          [key: string]: ActionPermissions;
        },
        { module, ...rest },
      ) => {
        if (!acc[module]) {
          acc[module] = { module, actions: [] };
        }
        acc[module].actions.push(rest);
        return acc;
      },
      {},
    ),
  );
}

export function convertRolesToPermissions(roles: Roles[]) {
  const initialValue: Roles['permissions'] = [];
  const setOfPermissions = new Set(
    roles.reduce(
      (acc, role) => [...acc, ...(role?.permissions || initialValue)],
      initialValue,
    ),
  );
  return [...setOfPermissions];
}

export function removeDuplicatedItem(array: Array<Array<string>>) {
  const initialValue: Array<string> = [];
  const setOfValue = new Set(
    array.reduce((acc, item) => [...acc, ...(item || [])], initialValue),
  );
  return [...setOfValue];
}
