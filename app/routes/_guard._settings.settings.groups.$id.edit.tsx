import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Slash } from 'lucide-react';

export default function Screen() {
  return (
    <>
      <div className="text-2xl flex-row flex justify-between items-center px-0 pb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" to="/settings/groups">
                Groups
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" to="/settings/groups">Group name</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem >
              <BreadcrumbPage className="text-lg">Update group</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button type="submit">Save changes</Button>
      </div>
      <form>
        <CardContent className="gap-4 pb-4 grid p-0">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-left">
                Group name
              </Label>
              <Input id="group" className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left">Users</Label>
              <div className="col-span-3">
                <MultiSelect
                  isDisplayAllOptions
                  options={[
                    {
                      value: 'next.js',
                      label: 'Next.js',
                    },
                    {
                      value: 'sveltekit',
                      label: 'SvelteKit',
                    },
                    {
                      value: 'nuxt.js',
                      label: 'Nuxt.js',
                    },
                    {
                      value: 'remix',
                      label: 'Remix',
                    },
                  ]}
                  className="w-[360px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left">Roles</Label>
              <div className="col-span-3">
                <MultiSelect
                  isDisplayAllOptions
                  options={[
                    {
                      value: 'next.js',
                      label: 'Next.js',
                    },
                    {
                      value: 'sveltekit',
                      label: 'SvelteKit',
                    },
                    {
                      value: 'nuxt.js',
                      label: 'Nuxt.js',
                    },
                    {
                      value: 'remix',
                      label: 'Remix',
                    },
                  ]}
                  className="w-[360px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </form>
    </>
  );
}
