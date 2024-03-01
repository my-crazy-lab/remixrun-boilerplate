// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcrypt";

import { mongodb } from "~/utils/db.server";
import { dotenv } from "./dotenv.server";
import { getFutureTimeFromToday, momentTz } from "~/utils/helpers.server";
import { sendEmail } from "./mail.server";
import { v4 as uuidv4 } from "uuid";

interface User {
  username: string;
  password: string;
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<any>(sessionStorage, {
  throwOnError: true,
});

export function hashPassword(password: string) {
  return bcrypt.hashSync(
    `${dotenv.PLAIN_TEXT}${password}`,
    Number(dotenv.SALT_ROUND),
  );
}
function compareHash({ password, hash }: { password: string; hash: string }) {
  return bcrypt.compare(dotenv.PLAIN_TEXT + password, hash);
}

export async function verifyAndSendCode({ password, username }: User) {
  const usersCol = mongodb.collection("accounts");

  const user = await usersCol.findOne({ username });

  if (!user) {
    throw new Error("User not found !");
  }
  const verified = await compareHash({
    password,
    hash: user?.services?.password?.bcrypt,
  });

  if (!verified) throw new Error("Not correct account");

  const verificationCode = await sendVerificationCode({ email: user.email });
  return verificationCode;
}

export async function sendVerificationCode({ email }: { email: string }) {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const token = uuidv4();

  const accountsCol = mongodb.collection("accounts");
  await accountsCol.updateOne(
    {
      email,
    },
    {
      $set: {
        verification: {
          code: verificationCode,
          expired: getFutureTimeFromToday(10, "minutes").toDate(),
          token,
        },
      },
    },
  );

  await sendEmail({
    to: email,
    from: dotenv.MAIL_FROM,
    subject: "Your verification code",
    text: `${verificationCode} is your verification code.`,
  });
  return token;
}

export async function isVerificationCodeExpired({ token }: { token: string }) {
  const account = await mongodb.collection("accounts").findOne({
    "verification.token": token,
    "verification.expired": { $gt: momentTz().toDate() },
  });

  return !account?._id;
}

export async function isResetPassExpired({ token }: { token: string }) {
  const account = await mongodb.collection("accounts").findOne({
    "resetPassword.token": token,
    "resetPassword.expired": { $gt: momentTz().toDate() },
  });

  return !account?._id;
}

export async function verifyCode({ code }: { code: string }) {
  const isExpired = await mongodb.collection("accounts").findOne({
    "verification.expired": { $gt: momentTz().toDate() },
  });
  if (!isExpired?._id) {
    throw new Error("Verification code expired !");
  }

  const account = await mongodb.collection("accounts").findOneAndUpdate(
    {
      "verification.code": code,
    },
    {
      $set: {
        "verification.expired": momentTz().toDate(),
      },
    },
  );
  if (!account?._id) {
    throw new Error("Code incorrect!");
  }
  return { userId: account._id };
}

export async function resetPassword({ email }: { email: string }) {
  const resetToken = uuidv4();

  const account = await mongodb.collection("accounts").findOneAndUpdate(
    {
      email,
    },
    {
      $set: {
        resetPassword: {
          expired: getFutureTimeFromToday(15, "minutes").toDate(),
          token: resetToken,
        },
      },
    },
  );
  if (!account?._id) {
    throw new Error("Email incorrect !");
  }

  await sendEmail({
    to: email,
    from: dotenv.MAIL_FROM,
    subject: "Your link to reset password",
    text: `${dotenv.DOMAIN_BTASKEE_BE}/reset-password/${resetToken} is link to reset your password`,
  });
}

export async function changePassword({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) {
  if (!newPassword || !token) throw new Error("Not accept");

  const hashedPassword = await hashPassword(newPassword);

  const account = await mongodb.collection("accounts").findOneAndUpdate(
    {
      "resetPassword.expired": { $gt: momentTz().toDate() },
      "resetPassword.token": token,
    },
    {
      $set: {
        "services.password.bcrypt": hashedPassword,
        "resetPassword.expired": momentTz().toDate(),
      },
    },
  );

  if (!account?._id) {
    throw new Error("This link expired !");
  }
}

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const code = form.get("code")?.toString();
    if (!code) {
      throw new Error("Login failure");
    }

    const user = await verifyCode({
      code,
    });
    console.log("login done");
    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass",
);
