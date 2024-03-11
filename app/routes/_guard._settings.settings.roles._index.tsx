import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrashIcon } from '@radix-ui/react-icons';

export default function Screen() {
  const rolesData = [
    {
      _id: 'super-user',
      name: 'Super user',
      actionPermissions: [
        'write:asker/offer',
        'read:marketing/promotion-source',
        'write:marketing/promotion-source',
        'read:asker/task-history',
        'read:asker/schedules',
        'read:asker/subscription',
        'read:asker/favourite-tasker',
        'read:asker/transaction',
        'read:task/cancel-history',
        'read:task/tasker-blacklist',
        'write:task/tasker-blacklist',
        'read:task/changes-history',
        'write:task/create-schedule',
        'write:task/create-subscription',
        'write:task/support-asker-tasker',
      ],
      teams: [],
    },
    {
      _id: 'giai-dap-va-tu-van',
      name: 'giai dap va tu van',
      actionPermissions: [
        'read:askers/search',
        'read:asker/detail',
        'write:asker/blacklist',
        'read:asker/user-note',
        'write:asker/user-note',
        'read:asker/task-note',
        'read:asker/task-history',
        'read:asker/favourite-tasker',
        'read:asker/blacklist-tasker',
        'write:asker/blacklist-tasker',
        'read:askers/search-blacklist',
        'read:askers/outstanding-debt',
        'read:tasker/search',
        'read:tasker/info',
      ],
    },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Role management</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your role!
          </p>
        </div>
        <Button>+ New role</Button>
      </div>
      <Separator />
      {rolesData.map((role, index) => {
        return (
          <Button variant="outline" key={index} className="mr-4 mt-4">
            {role.name} <TrashIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
