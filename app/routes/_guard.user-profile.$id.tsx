import { BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import { Grid } from '@/components/btaskee/Grid';
import Typography from '@/components/btaskee/Typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DefaultImage from '@/images/default-image.svg';
import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import ROUTE_NAME from '~/constants/route';
import { getUserProfile } from '~/services/settings.server';
import type { ReturnValueIgnorePromise, Users } from '~/types';

export const handle = {
  breadcrumb: (data: { userProfile: Users }) => {
    const { userProfile } = data;

    return (
      <BreadcrumbsLink
        to={`${ROUTE_NAME.PROFILE_SETTING}/${userProfile._id}`}
        label="PROFILE"
      />
    );
  },
};

interface LoaderData {
  userProfile: ReturnValueIgnorePromise<typeof getUserProfile>;
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = params.id || '';
  const userProfile = await getUserProfile(userId);

  return json({ userProfile });
};

export default function Screen() {
  const { t } = useTranslation(['user-settings']);
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-secondary">
        <Typography variant="h3">{t('USER_PROFILE')}</Typography>
      </div>
      <div className="gap-10 grid grid-cols-2">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('PERSONAL_DETAILS')}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="py-4 flex flex-col gap-5">
              <Grid>
                <Typography variant="h3" affects="small">
                  {t('EMAIL')}
                </Typography>
                <Typography variant="h4" affects="small">
                  {loaderData.userProfile?.email}
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="h3" affects="small">
                  {t('USERNAME')}
                </Typography>
                <Typography variant="h4" affects="small">
                  {loaderData.userProfile?.username}
                </Typography>
              </Grid>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('AUTHORIZATION')}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="mt-4 gap-4 grid">
              <Typography variant="h4" affects="small">
                {t('CITIES')}
              </Typography>
              <div className="gap-2 grid grid-cols-4">
                {loaderData.userProfile?.cities?.map((city, index) => {
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
        <Card className="h-[370px]">
          <CardHeader>
            <CardTitle className="text-lg">{t('AVATAR')}</CardTitle>
          </CardHeader>
          <Separator />
          <div className="justify-center flex flex-col items-center">
            <div className="w-40 h-40 text-center mt-10">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={loaderData.userProfile?.avatarUrl}
                  className="object-cover"
                />
                <AvatarFallback className="bg-secondary">
                  <img
                    src={DefaultImage}
                    alt="Default avatar user"
                    className="w-16 h-16"
                  />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
