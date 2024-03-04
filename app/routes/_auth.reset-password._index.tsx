import { Button } from "@/components/ui/button";
import { useActionData, useLoaderData, useRouteError } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {
  authenticator,
  resetPassword,
  verifyAndSendCode,
} from "~/services/auth.server";
import { json, redirect } from "@remix-run/node";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { email } = Object.fromEntries(formData);

    await resetPassword({ email });

    return json({ isSent: true });
  } catch (error: any) {
    return json({ error: error.message });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function Screen() {
  const { t } = useTranslation();

  const actionData = useActionData<any>();

  useEffect(() => {
    if (actionData?.error) {
      toast({ description: actionData.error });
    }
  }, [actionData?.error]);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Send email</h1>
        <p className="text-sm text-muted-foreground">
          No worries, we will send you reset instructions.
        </p>
      </div>
      <div className="grid gap-6">
        {actionData?.isSent ? (
          "Check your mail"
        ) : (
          <Form method="post">
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only">Email</Label>
                <Input
                  required
                  name="email"
                  type="email"
                  placeholder="name@btaskee.com"
                />
              </div>
              <Button>Send</Button>
            </div>
          </Form>
        )}
      </div>
    </>
  );
}
