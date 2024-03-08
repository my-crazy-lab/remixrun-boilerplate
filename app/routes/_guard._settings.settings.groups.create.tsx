import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ThickArrowLeftIcon } from "@radix-ui/react-icons";

export default function Screen() {
  return (
    <>
      <div className="flex-row flex font-bold text-xl items-center px-0 mb-4">
        <ThickArrowLeftIcon className="cursor-pointer mr-2 h-5 w-5" /> New group
      </div>
      <Card className="p-4">
        <form>
          <CardContent className="gap-4 pb-4 grid sm:w-2/3">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="group" className="text-left">
                  Group name
                </Label>
                <Input id="group" className="col-span-2" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-left">Users</Label>
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
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-left">Teams</Label>
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
