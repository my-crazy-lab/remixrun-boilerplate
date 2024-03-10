import { Button } from "@/components/ui/button";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { PERMISSIONS } from "~/constants/common";
import useGlobalStore from "~/hooks/useGlobalStore";
import { getUserId } from "~/services/helpers.server";
import { getGroupDetail } from "~/services/role-base-access-control.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await getUserId({ request });
  const group = await getGroupDetail({
    projection: {
      roles: 1,
      users: 1,
      "children.name": 1,
      "children.description": 1,
      parent: 1,
      hierarchy: 1,
      name: 1,
      description: 1,
    },
    userId,
    groupId: params.id,
  });

  if (!group) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json({ group });
};

export default function Screen() {
  const params = useParams();

  const loaderData = useLoaderData<any>();
  const globalData = useGlobalStore((state) => state);

  console.log(loaderData);

  return (
    <>
      {globalData.permissions.includes(PERMISSIONS.WRTTE_GROUP) ? (
        <Link to={`/settings/groups/${params.id}/create`}>
          <Button variant="outline">Add group</Button>
        </Link>
      ) : null}
      {globalData.permissions.includes(PERMISSIONS.READ_ROLE) ? (
        <Link to={`/settings/groups/${params.id}/roles`}>
          <Button variant="outline">Role management</Button>
        </Link>
      ) : null}
    </>
  );
}
