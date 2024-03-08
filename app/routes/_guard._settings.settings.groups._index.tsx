import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

const dataGroups = [
  {
    "_id": "bZLhevo2qKduQdjcG",
    "name": "Admin",
    "description": "Lorem Ipsum text is generated from sections of a work by Cicero, a Roman philosopher, but the text itself has",
    "users": [
      {
        "_id": "R5pRgZqKyhTKRX2Ng"
      }
    ],
    "roles": [
      {
        "_id": "super-user"
      }
    ]
  },
  {
    "_id": "F8PiavHetxb4pNzos",
    "name": "Tasker Recruitment",
    "description": "Lorem Ipsum text is generated from sections of a work by Cicero, a Roman philosopher, but the text itself has",
    "users": [
      {
        "_id": ""
      },
      {
        "_id": ""
      }
    ],
    "roles": [
      {
        "_id": "tasker"
      }
    ]
  },
  {
    "_id": "etkkyCdobSm783E3y",
    "name": "Group 1",
    "description": "Lorem Ipsum text is generated from sections of a work by Cicero, a Roman philosopher, but the text itself has no meaningful content. It starts with and continues with nonsensical Latin-like words. nonsensical Latin-like words. nonsensical Latin-like words. ",
    "users": [
      {
        "_id": "KfhstepwgsNR2Z69M"
      }
    ],
    "roles": [
      {
        "_id": "role-1"
      },
      {
        "_id": "role-2"
      }
    ]
  },
  {
    "_id": "v82pw5dWGE6dzrQwz",
    "name": "Accounting",
    "description": "Lorem Ipsum text is generated from sections of a work by Cicero, a Roman philosopher, but the text itself has",
    "users": [
      {
        "_id": "TFnqfX3G3Z3SQDR7w"
      }
    ],
    "roles": [
      {
        "_id": "role-1"
      },
      {
        "_id": "role-2"
      }
    ],
    "teams": [
      "Tasker",
      "CS",
      "Marketing"
    ]
  },
  {
    "_id": "NGjzPAYry5dxCR55t",
    "name": "employee update",
    "description": "Lorem Ipsum text is generated from sections of a work by Cicero, a Roman philosopher, but the text itself has no meaningful content. It starts with and continues with nonsensical Latin-like words.",
    "users": [
      {
        "_id": "TFnqfX3G3Z3SQDR7w"
      },
      {
        "_id": "KfhstepwgsNR2Z69M"
      }
    ],
    "roles": [
      {
        "_id": "role-1"
      },
      {
        "_id": "role-2"
      }
    ],
    "teams": [
      "Tasker"
    ]
  },

];


export default function GroupPage() {
  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Groups
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your users!
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Add group</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>New group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group name
                </Label>
                <Input id="group" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Users</Label>
                <div className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Roles</Label>
                <div className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Teams</Label>
                <div className="col-span-3">
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
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {dataGroups.map((data) => {
          return (
            <Card>
              <CardHeader className="font-semibold text-lg flex flex-row justify-between items-center">
                {data.name}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                      <DotsHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Duplicate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="text-gray">
                {data.description}
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
