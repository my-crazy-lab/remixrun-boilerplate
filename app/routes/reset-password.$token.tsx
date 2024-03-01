import { Button } from "@/components/ui/button";
import { useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { changePassword, isResetPassExpired } from "~/services/auth.server";
import { json, redirect } from "@remix-run/node";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { newPassword, reEnterPassword } = Object.fromEntries(formData);

    if (newPassword !== reEnterPassword) {
      throw new Error("Password not match !");
    }
    await changePassword({ newPassword, token: params.token });

    return redirect("/sign-in");
  } catch (error: any) {
    console.log(error);
    return json({ error: error.message });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const isExpired = await isResetPassExpired({ token: params.token });
  if (isExpired) return redirect("/reset-password");

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
    <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          bTaskee
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">
              You are a step away from accessing your account!
            </p>
          </div>
          <div className="grid gap-6">
            <Form method="post">
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label className="sr-only">New Password</Label>
                  <Input
                    required
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only">Re-enter New Password</Label>
                  <Input
                    required
                    type="password"
                    name="reEnterPassword"
                    placeholder="Re-enter New Password"
                  />
                </div>

                <Button>Reset</Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
