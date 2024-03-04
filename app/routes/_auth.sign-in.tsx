import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Link,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useEffect } from "react";
import { verifyAndSendCode } from "~/services/auth.server";

import { useForm, useFieldArray } from "react-hook-form";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { username, password, myKey } = Object.fromEntries(formData);
    console.log(myKey, "test");

    const verificationToken = await verifyAndSendCode({ username, password });
    return redirect(`/verification-code/${verificationToken}`);
  } catch (error: any) {
    return error;
  }
}

type FormValues = {
  cart: {
    name: string;
    price: number;
    quantity: number;
  }[];
};
export default function Screen() {
  const { t } = useTranslation();

  const error = useActionData<any>();

  useEffect(() => {
    if (error?.message) {
      toast({ description: error.message });
    }
  }, [error?.message]);

  const navigation = useNavigation();

  const submit = useSubmit();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      cart: [{ name: "test", quantity: 1, price: 23 }],
    },
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    name: "cart",
    control,
  });
  const onSubmit = (data: FormValues) => {
    console.log(data);

    const formData = new FormData();
    formData.append("myKey", "myValue");
    submit(formData, { method: "post" });
  };
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field: any, index: number) => {
              return (
                <div key={field.id}>
                  <section className={"section"} key={field.id}>
                    <Input
                      placeholder="name"
                      {...register(`cart.${index}.name` as const, {
                        required: true,
                      })}
                      className={errors?.cart?.[index]?.name ? "error" : ""}
                    />
                    <Input
                      placeholder="quantity"
                      type="number"
                      {...register(`cart.${index}.quantity` as const, {
                        valueAsNumber: true,
                        required: true,
                      })}
                      className={errors?.cart?.[index]?.quantity ? "error" : ""}
                    />
                    <Input
                      placeholder="value"
                      type="number"
                      {...register(`cart.${index}.price` as const, {
                        valueAsNumber: true,
                        required: true,
                      })}
                      className={errors?.cart?.[index]?.price ? "error" : ""}
                    />
                    <Button type="button" onClick={() => remove(index)}>
                      DELETE
                    </Button>
                  </section>
                </div>
              );
            })}

            <Button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  quantity: 0,
                  price: 0,
                })
              }
            >
              APPEND
            </Button>
            <Button type="submit">Submit</Button>
          </form>
        </div>
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
            <Link
              className="text-end underline italic mb-8"
              to={"/reset-password"}
            >
              Forgot password?
            </Link>
            <Button
              disabled={
                navigation.formAction === "/sign-in" &&
                navigation.state !== "idle"
              }
            >
              Login
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
