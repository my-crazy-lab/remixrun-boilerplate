import { Button } from "@/components/ui/button";
import { useActionData, useLoaderData, useRouteError } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator, verifyAndSendCode } from "~/services/auth.server";
import { json, redirect } from "@remix-run/node";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { username, password } = Object.fromEntries(formData);

    const verificationToken = await verifyAndSendCode({ username, password });

    return redirect(`/verification-code/${verificationToken}`);
  } catch (error: any) {
    return json({ error: error.message });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function Screen() {
  const { t } = useTranslation();

  const error = useActionData<any>();

  useEffect(() => {
    if (error?.error) {
      toast({ description: error.error });
    }
  }, [error?.error]);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input name="username" required placeholder="User name" />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Input
                required
                name="password"
                type="password"
                placeholder="Password"
              />
            </div>

            <Button>Login</Button>
          </div>
        </Form>
      </div>
    </>
  );
}
