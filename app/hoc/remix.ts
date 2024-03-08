import { ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import { saveActionHistory } from "~/services/middleware/action-history.server";

export function hocAction(callback: any) {
  async function action(args: ActionFunctionArgs) {
    const formData = await args.request.formData();
    const data = Object.fromEntries(formData);

    await saveActionHistory(args, data);
    return callback({ formData: data });
  }

  return action;
}
