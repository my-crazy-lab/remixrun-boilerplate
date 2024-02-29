import { Button } from "@/components/ui/button";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {
  authenticator,
  isVerificationCodeExpired,
} from "~/services/auth.server";
import { json, redirect } from "@remix-run/node";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { commitSession, getSession } from "~/services/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
    return await authenticator.authenticate("user-pass", request, {
      successRedirect: "/",
      failureRedirect: `/verification-code/${params.token}`,
      throwOnError: true,
    });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const isExpired = await isVerificationCodeExpired({ token: params.token });
  if (isExpired) return redirect("/sign-in");

  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  const session = await getSession(request.headers.get("cookie"));
  const error = session.get(authenticator.sessionErrorKey);

  return json(
    { error },
    {
      headers: {
        "Set-Cookie": await commitSession(session), // You must commit the session whenever you read a flash
      },
    },
  );
}

export default function Screen() {
  const { t } = useTranslation();
  const error = useActionData<any>();
const data  = useLoaderData<any>();

console.log(data)

  useEffect(() => {
    if (error?.error) {
      toast({ description: error.error });
    }
  }, [error?.error]);

  return (
    <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          bTaskee
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than ever
              before.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
            <p className="text-sm text-muted-foreground">
              Open your gmail and verify your code.
            </p>
          </div>
          <div className="grid gap-6">
            <Form method="post">
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="verificationCode">
                    Verification code
                  </Label>
                  <Input name="code" required placeholder="Verification code" />
                </div>
                <Button>Verify</Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
