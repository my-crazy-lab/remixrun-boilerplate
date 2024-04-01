import { AvatarUpload } from '@/components/btaskee/AvatarUpload';
import Typography from '@/components/btaskee/Typography';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';

export default function UserProfile() {
  const form = useForm();

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
    isoCode: 'VN',
    services: '',
    username: 'myquyen.le',
    emails: 'xnguyen9a101@gmail.com',
    ipAddress: '127.0.0.1',
    profile: {
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    teams: ['customer-service', 'tasker', 'marketing'],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col p-4 rounded-lg bg-secondary">
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <div className="gap-10 grid grid-cols-2">
        <div className='flex flex-col gap-5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Personal Details</CardTitle>
              <CardDescription>To change your personal detail, edit and save from here</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className='py-4'>
              <div className='flex flex-col gap-5'>
                <Typography variant='h4' affects='small'>City</Typography>
                <Input defaultValue={dataUser.emails}></Input>
                <Typography variant='h4' affects='small'>City</Typography>
                <Input defaultValue={dataUser.emails}></Input>
                <Typography variant='h4' affects='small'>City</Typography>
                <Input defaultValue={dataUser.emails}></Input>
                <Typography variant='h4' affects='small'>City</Typography>
                <Input defaultValue={dataUser.emails}></Input>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Authorization</CardTitle>
              <CardDescription>To change your personal detail, edit and save from here</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
              <div className='py-4 gap-4 grid'>
                <Typography variant='h4' affects='small'>Department</Typography>
                <div className="gap-2 grid grid-cols-3">
                  {dataUser.teams.map((team, index) => {
                    return (
                      <Badge
                        className="text-center block rounded-md"
                        variant="secondary"
                        key={index}
                      >
                        {team}
                      </Badge>
                    );
                  })}
                </div>
                <Typography variant='h4' affects='small'>City</Typography>
                <div className="gap-2 grid grid-cols-4">
                  {dataUser.city.map((ct, index) => {
                    return (
                      <Badge
                        className="text-center block rounded-md"
                        variant="secondary"
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
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Personal Details</CardTitle>
            <CardDescription>To change your personal detail, edit and save from here</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AvatarUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />            <Typography variant='p' affects='muted'>Allowed JPG or PNG. Max size of 100Kb</Typography>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
