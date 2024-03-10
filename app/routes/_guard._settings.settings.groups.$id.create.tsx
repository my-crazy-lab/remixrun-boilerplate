import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ThickArrowLeftIcon } from "@radix-ui/react-icons";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useNavigate, useParams, useSubmit } from "@remix-run/react";
import { Controller, useForm } from "react-hook-form";
import { PERMISSIONS } from "~/constants/common";
import { hocAction } from "~/hoc/remix";
import { createGroup } from "~/services/role-base-access-control.server";

export const action = hocAction(async ({ params }, { formData }) => {
  try {
    console.log(formData);
    const { name, description, userIds, roleIds } = formData;
    await createGroup({
      name,
      description,
      userIds: JSON.parse(userIds),
      roleIds: JSON.parse(roleIds),
      parent: params.id,
    });

    return redirect(`/settings/groups/${params.id}`);
  } catch (err: any) {
    console.log(err);
    return json({ err });
  }
}, PERMISSIONS.WRTTE_GROUP);

export default function Screen() {
  const params = useParams();

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      name: "",
      description: "",
      userIds: [],
      roleIds: [],
    },
  });
  const submit = useSubmit();

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("userIds", JSON.stringify(data.userIds));
    formData.append("roleIds", JSON.stringify(data.roleIds));

    submit(formData, { method: "post" });
  };

  return (
    <>
      <div className="flex-row flex font-bold text-xl items-center px-0 mb-4">
        <Link to={`/settings/groups/${params.id}`}>
          <ThickArrowLeftIcon className="cursor-pointer mr-2 h-5 w-5" /> New
          group
        </Link>
      </div>
      <Card className="p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="gap-4 pb-4 grid sm:w-2/3">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="group" className="text-left">
                  Group name
                </Label>
                <Input
                  {...register("name" as const, {
                    required: true,
                  })}
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-left">Users</Label>
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="userIds"
                    render={({ field: { onChange, value } }) => (
                      <MultiSelect
                        isDisplayAllOptions
                        options={[
                          {
                            value: "next.js",
                            label: "Next.js",
                          },
                          {
                            value: "sveltekit",
                            label: "SvelteKit",
                          },
                          {
                            value: "nuxt.js",
                            label: "Nuxt.js",
                          },
                          {
                            value: "remix",
                            label: "Remix",
                          },
                        ]}
                        selected={value}
                        setSelected={onChange}
                        className="w-[360px]"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-left">Roles</Label>
                <div className="col-span-2">
                  <MultiSelect
                    isDisplayAllOptions
                    options={[
                      {
                        value: "next.js",
                        label: "Next.js",
                      },
                      {
                        value: "sveltekit",
                        label: "SvelteKit",
                      },
                      {
                        value: "nuxt.js",
                        label: "Nuxt.js",
                      },
                      {
                        value: "remix",
                        label: "Remix",
                      },
                    ]}
                    className="w-[360px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-0">
            <Button type="submit">Save changes</Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
