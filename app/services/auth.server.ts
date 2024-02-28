// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcrypt";

import { mongodb } from "~/utils/db.server";
import { dotenv } from "./dotenv.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
interface User {
  email: string;
  password: string;
}
export const authenticator = new Authenticator<any>(sessionStorage, {
  throwOnError: true,
});

export function hashPassword(password: string) {
  return bcrypt.hash(dotenv.PLAIN_TEXT + password, dotenv.SALT_ROUND);
}
async function compareHash({
  password,
  hash,
}: {
  password: string;
  hash: string;
}) {
  const result = await bcrypt.compare(dotenv.PLAIN_TEXT + password, hash);
  return result;
}
export async function verifyUser({ password, email }: User) {
  const usersCol = await mongodb.collection("accounts");
  const user = await usersCol.findOne({
    emails: {
      $elemMatch: {
        address: email,
      },
    },
  });

  if (!user) {
    return false;
  }
  const verified = await compareHash({
    password,
    hash: user?.services?.password?.bcrypt,
  });
  return verified;
}

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    if (!email || !password) {
      throw new Error("Login failure");
    }

    const verified = await verifyUser({
      email,
      password,
    });

    if (!verified) throw new Error("Login failure");
    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return { email };
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass",
);
