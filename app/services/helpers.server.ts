import { ObjectId, mongodb } from "~/utils/db.server";
import { getSession } from "./session.server";
import { momentTz } from "~/utils/helpers.server";

export async function saveActionHistory({ request }: any, data: any) {
  const action = new URL(request.url).pathname;
  const userId = await getUserId({ request });

  const actionsHistoryCol = mongodb.collection("actionsHistory");

  await actionsHistoryCol.insertOne({
    _id: new ObjectId().toString(),
    data,
    userId,
    action,
    createdAt: momentTz().toDate(),
  });
}

export async function getUserId({ request }: any) {
  const authSession = await getSession(request.headers.get("cookie"));
  return authSession.get("user").userId;
}
