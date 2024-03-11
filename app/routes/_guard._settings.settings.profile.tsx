import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Screen() {
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
      <div className="flex items-center justify-between">
        <div className="grid">
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            This is how others will see you on the site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Change password</Button>
          <Button>Edit profile</Button>
        </div>
      </div>
      <Separator />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{dataUser.emails}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <strong>Tên người dùng</strong>
            <p>{dataUser.username}</p>
            <strong>Ngôn ngữ</strong>
            <p>{dataUser.profile.language}</p>
            <strong>Múi giờ</strong>
            <p>{dataUser.profile.timezone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thẩm quyền</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <strong>Phòng ban</strong>
            <div className="gap-2 grid grid-cols-3">
              {dataUser.teams.map((team, index) => {
                return (
                  <Badge
                    className="text-center block"
                    variant="outline"
                    key={index}>
                    {team}
                  </Badge>
                );
              })}
            </div>
            <strong>Thành phố</strong>
            <div className="gap-2 grid grid-cols-4">
              {dataUser.city.map((ct, index) => {
                return (
                  <Badge
                    className="text-center block"
                    variant="outline"
                    key={index}>
                    {ct}
                  </Badge>
                );
              })}
            </div>
            <strong>Thuộc nhóm</strong>
            <div className="gap-2 grid grid-cols-4">
              {dataUser.city.map((ct, index) => {
                return (
                  <Badge
                    className="text-center block"
                    variant="outline"
                    key={index}>
                    {ct}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
