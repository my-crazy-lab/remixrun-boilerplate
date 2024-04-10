import { Breadcrumbs } from '@/components/btaskee/Breadcrumbs';
import Typography from '@/components/btaskee/Typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import TabGroupIcon from '@/images/tab-group.svg';
import UsersIcon from '@/images/user-group.svg';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { getUserId } from '~/services/helpers.server';
import { getGroupsOfUser } from '~/services/role-base-access-control.server';

interface LoaderData {
  groups: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
}

// Don't need permission Read
// Users added to groups obviously know how many groups they have
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId({ request });
  const groups = await getGroupsOfUser<LoaderData['groups']>({
    userId,
    projection: {
      name: 1,
      description: 1,
    },
  });

  return json({ groups });
};

export default function Screen() {
  const { t } = useTranslation(['user-settings']);
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div className="h-full flex-1 flex-col space-y-8 flex">
      <div className="grid space-y-2 bg-secondary p-4 rounded-xl">
        <Typography variant="h3">{t('GROUPS')}</Typography>
        <Breadcrumbs />
      </div>
      <div className="grid grid-cols-3 gap-8">
        {loaderData.groups?.map((group, index: number) => {
          return (
            <Link key={index} to={`/settings/groups/${group._id}`}>
              <Card className="bg-gray-100">
                <CardHeader className="p-4">
                  <Typography variant="h4" affects="removePMargin">
                    {group.name}
                  </Typography>
                  <Typography
                    className="text-gray-500"
                    variant="p"
                    affects="removePMargin">
                    {group.description}
                  </Typography>
                </CardHeader>
                <CardContent className="flex flex-row gap-4 p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-50 p-3 rounded-md">
                      <img src={TabGroupIcon} alt="tab-group-icon" />
                    </div>
                    <div>
                      <Typography className="text-gray-400" variant="p">
                        {t('CHILDREN_GROUP')}
                      </Typography>
                      <Typography className="text-primary" variant="h4">
                        2
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-secondary p-3 rounded-md">
                      <img src={UsersIcon} alt="user-group-icon" />
                    </div>
                    <div>
                      <Typography className="text-gray-400" variant="p">
                        {t('USERS')}
                      </Typography>
                      <Typography
                        className="text-secondary-foreground"
                        variant="h3">
                        2
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
