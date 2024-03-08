import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ThickArrowLeftIcon } from "@radix-ui/react-icons";

export default function Screen() {
  return (
    <div>
      <div className="flex-row flex font-bold text-xl items-center px-0 mb-4">
        <ThickArrowLeftIcon className="cursor-pointer mr-2 h-5 w-5" /> New user
      </div>
      <Card className="p-4">
        <form>
          <CardContent className="gap-4 pb-4 grid sm:w-2/3">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="username" className="text-left">
                Username
              </Label>
              <Input
                id="username"
                className="col-span-2"
                placeholder="Username"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="email" className="text-left">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-2"
                placeholder="Email"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="password" className="text-left">
                Password
              </Label>
              <Input
                autoComplete="off"
                id="password"
                type="password"
                className="col-span-2"
                placeholder="Password"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-left">Cities</Label>
              <div className="col-span-2">
                <MultiSelect
                  // selected={value}
                  // setSelected={onChange}
                  isDisplayAllOptions
                  options={[
                    {
                      value: "HCM",
                      label: "Ho Chi Minh",
                    },
                    {
                      value: "HN",
                      label: "Hanoi",
                    },
                    {
                      value: "DT",
                      label: "Dong Thap",
                    },
                  ]}
                  className="w-[360px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-left">Groups</Label>
              <div className="col-span-2">
                <MultiSelect
                  options={[
                    {
                      value: "HCM",
                      label: "Ho Chi Minh",
                    },
                    {
                      value: "HN",
                      label: "Hanoi",
                    },
                    {
                      value: "DT",
                      label: "Dong Thap",
                    },
                  ]}
                  className="w-[360px]"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-0">
            <Button type="submit">Save changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>

  );
}
