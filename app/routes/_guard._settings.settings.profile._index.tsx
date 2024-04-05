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

export const handle = {
  breadcrumb: () => <BreadcrumbsLink to="/settings/profile" label="Profile" />,
};

const dataUser = {
  city: [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Bình Dương',
    'Đồng Nai',
    'Cần Thơ',
    'Hải Phòng',
    'Lâm Đồng',
    'Khánh Hòa',
    'Bangkok',
  ],
  username: 'myquyen.le',
  emails: 'xnguyen9a101@gmail.com',
};

export default function Screen() {
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
                <Input defaultValue={dataUser.emails}></Input>
                <Typography variant="h4" affects="small">
                  User Name
                </Typography>
                <Input defaultValue={dataUser.username}></Input>
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
            <CardContent>
              <div className="py-4 gap-4 grid">
                <Typography variant="h4" affects="small">
                  Department
                </Typography>
                <Typography variant="h4" affects="small">
                  City
                </Typography>
                <div className="gap-2 grid grid-cols-4">
                  {dataUser.city.map((ct, index) => {
                    return (
                      <Badge
                        className="text-center block rounded-md py-2 font-normal text-blue bg-blue-50"
                        key={index}>
                        {ct}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="h-1/2">
          <CardHeader>
            <CardTitle className="text-lg">Change Profile</CardTitle>
            <CardDescription>
              Change your profile picture from here
            </CardDescription>
          </CardHeader>
          <Separator />
          <div className="justify-ceter flex flex-col items-center">
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
