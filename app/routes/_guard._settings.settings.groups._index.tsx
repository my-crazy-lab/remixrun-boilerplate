import Typography from '@/components/btaskee/Typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import TabGroupIcon from '@/images/tab-group.svg';
import UsersIcon from '@/images/user-group.svg';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getUserId } from '~/services/helpers.server';
import { getGroupsOfUser } from '~/services/role-base-access-control.server';
interface LoaderData {
  groups: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
}

// don't need permission Read
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
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center justify-between space-y-2 bg-secondary p-4 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Groups
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your groups!
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {loaderData.groups.map((group, index: number) => {
          return (
            <Link key={index} to={`/settings/groups/${group._id}`}>
              <Card>
                <CardHeader>
                  <Typography variant='h4' affects='removePMargin'> {group.name}</Typography>
                  <Typography variant='p' affects='muted'>{group.description}</Typography>
                </CardHeader>
                <CardContent className='flex flex-row gap-4'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-primary-50 p-3 rounded-md'>
                      <img src={TabGroupIcon} alt='tab-group-icon' />
                    </div>

                    <div>
                      <Typography variant='p'>Children Group</Typography>
                      <Typography className='text-primary' variant='h3'>2</Typography>
                    </div>

                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='bg-secondary p-3 rounded-md'>
                      <img src={UsersIcon} alt='user-group-icon' />
                    </div>
                    <div>
                      <Typography variant='p'>Users</Typography>
                      <Typography className='text-secondary-foreground' variant='h3'>2</Typography>
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
