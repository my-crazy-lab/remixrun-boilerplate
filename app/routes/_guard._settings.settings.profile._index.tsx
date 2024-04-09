import { AvatarUpload } from '@/components/btaskee/AvatarUpload';
import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import Typography from '@/components/btaskee/Typography';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getUserId } from '~/services/helpers.server';
import { getUserProfile } from '~/services/settings.server';
import { type ReturnValueIgnorePromise } from '~/types';

export const handle = {
  breadcrumb: () => <BreadcrumbsLink to="/settings/profile" label="Profile" />,
};

interface LoaderData {
  userProfile: ReturnValueIgnorePromise<typeof getUserProfile>;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId({ request });
  const userProfile = await getUserProfile(userId);

  return json({ userProfile });
};

export default function Screen() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div className="space-y-6">
      <div className="flex flex-col p-4 rounded-lg bg-secondary">
        <Typography variant="h3">Profile</Typography>
        <Breadcrumbs />
      </div>
      <div className="gap-10 grid grid-cols-2">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Details</CardTitle>
              <CardDescription>
                To change your personal detail, edit and save from here
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="py-4">
              <div className="flex flex-col gap-5">
                <Typography variant="h4" affects="small">
                  Email
                </Typography>
                <Input defaultValue={loaderData.userProfile?.email}></Input>
                <Typography variant="h4" affects="small">
                  User Name
                </Typography>
                <Input defaultValue={loaderData.userProfile?.username}></Input>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Authorization</CardTitle>
              <CardDescription>
                To change your personal detail, edit and save from here
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="mt-4 gap-4 grid">
              <Typography variant="h4" affects="small">
                City
              </Typography>
              <div className="gap-2 grid grid-cols-4">
                {loaderData.userProfile?.cities.map((city, index) => {
                  return (
                    <Badge
                      className="text-center block rounded-md py-2 font-normal text-blue bg-blue-50"
                      key={index}>
                      {city}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="h-[448px]">
          <CardHeader>
            <CardTitle className="text-lg">Change Profile</CardTitle>
            <CardDescription>
              Change your profile picture from here
            </CardDescription>
          </CardHeader>
          <Separator />
          <div className="justify-center flex flex-col items-center">
            <AvatarUpload />
            <Typography variant="p" affects="muted" className="pt-4">
              Allowed JPG or PNG. Max size of 100Kb.
            </Typography>
          </div>
        </Card>
      </div>
    </div>
  );
}
