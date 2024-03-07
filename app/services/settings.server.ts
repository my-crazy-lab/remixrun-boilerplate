import { mongodb } from "~/utils/db.server";
import {
  FindOptionsClient,
  newRecordCommonField,
  statusOriginal,
} from "./constants.server";
import { hashPassword } from "./auth.server";

export async function getTotalUsers() {
  const total = await mongodb.collection("users").count({});

  return total;
}

export async function getUsers({ skip, limit, projection }: FindOptionsClient) {
  const usersCol = mongodb.collection("users");
  const users = await usersCol
    .find(
      {},
      {
        sort: {
          createdAt: -1,
        },
        projection: {
          ...projection,
        },
        skip,
        limit,
      },
    )
    .toArray();

  return users;
}

export async function createNewUser({
  username,
  password,
  email,
  cities,
  groupIds,
}: any) {
  const usersCol = mongodb.collection("users");
  const passwordHashed = await hashPassword(password);

  const newUser = await usersCol.insertOne({
    ...newRecordCommonField,
    username,
    email,
    cities,
    "services.password.bcrypt": passwordHashed,
  });

  const groupCol = mongodb.collection("groups");

  await groupCol.updateMany(
    {
      _id: { $in: groupIds },
    },
    {
      $push: {
        users: newUser.insertedId.toString(),
      },
    },
  );

  return { message: "Successful" };
}

export async function createGroup({ name, userIds, roleIds }: any) {
  const groupCol = mongodb.collection("groups");
  await groupCol.insertOne({
    ...newRecordCommonField,
    name,
    users: userIds,
    roles: roleIds,
  });

  return { message: "Successful" };
}

export async function removeGroup(groupId: string) {
  const groupCol = mongodb.collection("groups");
  await groupCol.updateOne(
    { _id: groupId },
    {
      $set: { status: statusOriginal.REMOVED },
    },
  );

  return { message: "Successful" };
}

export async function getGroups({
  limit,
  skip,
  projection,
}: FindOptionsClient) {
  const groupCol = mongodb.collection("groups");
  const groups = await groupCol
    .find(
      {},
      {
        limit,
        skip,
        sort: { createdAt: -1 },
        projection,
      },
    )
    .toArray();
  const total = await groupCol.count({});

  return { total, groups };
}
