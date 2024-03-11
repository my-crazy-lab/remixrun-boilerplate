import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import _ from "lodash";
import { Slash } from "lucide-react";

const actionPermissions = [
  {
    module: "asker",
    actions: [

      {
        _id: "send:askers/outstanding-debt",
        name: "Send notification outstanding payment debt",
        description:
          "Send notification to asker about outstanding payment debt",
        module: "asker",
        children: [
          {
            _id: "read:askers/outstanding-debt",
          },
        ],
      },
      {
        _id: "read:askers/done-first-task",
        name: "Search asker done 1st task",
        description: "Find asker done the very first task",
        module: "asker",
      },
      {
        _id: "send:askers/survey",
        name: "Send survey asker",
        description: "Send survey to askers",
        module: "asker",
        children: [
          {
            _id: "read:askers/survey",
          },
        ],
      },
      {
        _id: "read:asker/support-history",
        name: "Read asker support history",
        description: "Read support history of an asker",
        module: "asker",
      },
      {
        _id: "write:asker/favourite-tasker",
        name: "Update favourite tasker",
        description: "Update favourite tasker of an asker",
        module: "asker",
      },
      {
        _id: "read:asker/reward",
        name: "Read asker reward",
        description: "Read asker of an asker",
        module: "asker",
      },
      {
        _id: "read:asker/promotion-history",
        name: "Read asker promotion history",
        description: "Read asker promotion history",
        module: "asker",
      },
      {
        _id: " read:asker/promotion-history",
        name: "Read asker promotion history",
        description: "Read asker promotion history",
        module: "asker",
      },
      {
        _id: "write:notification/send-asker",
        name: "Send notification to askers ",
        description: "Send notification to askers using a template",
        module: "asker",
        children: [
          {
            _id: "read:notification/list",
          },
        ],
      },
      {
        _id: "read:asker/complaint",
        name: "Can read Asker complaint",
        description: "Can read Asker complaint",
        module: "asker",
      },
    ],
  },
  {
    module: "tasker",
    actions: [
      {
        _id: "read:tasker/search",
        name: "Search tasker",
        description: "Search tasker",
        module: "tasker",
      },
      {
        _id: "read:tasker/info",
        name: "Read tasker information",
        description: "Read basic information (phone, name, ...) of an tsker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/search",
          },
        ],
      },
      {
        _id: "write:tasker/status",
        name: "Update status",
        description: "Update status of a tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "write:tasker/edit",
        name: "Edit tasker",
        description: "Edit tasker information (name, phone, avatar,...)",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },


      {
        _id: "read:tasker/calendar",
        name: "Read tasker calendar",
        description: "Read tasker calendar",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/locked-history",
        name: "Read tasker locked history",
        description: "Read locked history of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/locked-cancel-task",
        name: "Read tasker locked-cancel-task",
        description: "Read locked history because cancel task of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/cancel-task-history",
        name: "Read tasker cancel task history",
        description: "Read cancel task history of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "write:tasker/premium",
        name: "Write tasker premium",
        description: "Write tasker premium",
        module: "tasker",
      },
    ],
  },
  {
    module: "task",
    actions: [

      {
        _id: "write:task/set-duration",
        name: "Update working duration",
        description: "Update working duration",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "read:task/note",
        name: "Read task note",
        description: "Read notes of a task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/note",
        name: "Write task note",
        description: "Write notes of a task",
        module: "task",
        children: [
          {
            _id: "read:task/note",
          },
        ],
      },
      {
        _id: "read:task/viewed-tasker",
        name: "Read viewed tasker",
        description: "Read taskers who viewed this task ",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },

    ],
  },
];

export default function RolesDetail() {
  return (
    <>
      <div className="text-2xl px-0 pb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" href={`/settings/groups`}>Groups</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" href={`/settings/groups/`}>Group root</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem >
              <BreadcrumbPage className="text-lg">Role name here</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-base mt-2">
          Description here
        </p>
      </div>
      <ScrollArea>
        {_.map(actionPermissions, (actionPermission: any) => (
          <Accordion type="single" collapsible>
            <AccordionItem value={actionPermission.module}>
              <AccordionTrigger>
                {actionPermission?.module?.toUpperCase()} features
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {_.map(actionPermission.actions, (action) => (
                    <div key={action._id} className="my-2">
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-sm text-gray-500"
                        >
                          {action.name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </ScrollArea>
    </>
  );
}
