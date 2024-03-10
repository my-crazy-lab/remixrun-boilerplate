import { ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import { getUserId, saveActionHistory } from "~/services/helpers.server";
import { getUserPermissions } from "~/services/role-base-access-control.server";

export function hocAction(callback: any, permission: string) {
  async function action(args: ActionFunctionArgs) {
    const userId = await getUserId({ request: args.request });
    const userPermissions = await getUserPermissions(userId);

    if (!userPermissions.includes(permission)) {
      throw new Response(null, {
        status: 404,
        statusText: "Not allowed",
      });
    }

    const formData = await args.request.formData();
    const data = Object.fromEntries(formData);

    await saveActionHistory(args, data);
    return callback(args, { formData: data });
  }

  return action;
}
