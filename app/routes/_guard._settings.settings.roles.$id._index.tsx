import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import _ from "lodash";
import { ArrowBigLeftDashIcon } from "lucide-react";

const actionPermissions = [
  {
    module: "asker",
    actions: [
      {
        _id: "read:asker/outstanding-debt",
        name: "Read asker outstanding debt",
        description: "Read outstanding payment debt of an asker",
        module: "asker",
        children: [
          {
            _id: "read:asker/detail",
          },
        ],
      },
      {
        _id: "read:askers/search-blacklist",
        name: "Search blacklist asker",
        description: "Find asker in our blacklist",
        module: "asker",
      },
      {
        _id: "read:askers/inactive",
        name: "Search inactive asker",
        description: "Find inactive asker",
        module: "asker",
      },
      {
        _id: "read:askers/bpay-debt",
        name: "Read bPay debt of askers",
        description: "Search/Read inactive askers ",
        module: "asker",
      },
      {
        _id: "send:askers/bpay-debt",
        name: "Send email bPay debt",
        description: "Send email bPay debt to askers",
        module: "asker",
        children: [
          {
            _id: "read:askers/bpay-debt",
          },
        ],
      },
      {
        _id: "read:askers/feedback",
        name: "Read asker feedback",
        description: "Read asker feedback",
        module: "asker",
      },
      {
        _id: "read:askers/outstanding-debt",
        name: "Read asker outstanding payment debt",
        description: "Read asker outstanding payment debt",
        module: "asker",
      },
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
        _id: "write:askers/survey",
        name: "Create survey asker",
        description: "Create new asker survey template",
        module: "asker",
        children: [
          {
            _id: "read:askers/survey",
          },
        ],
      },
      {
        _id: "read:askers/survey",
        name: "Read survey asker",
        description: "Read asker survey information, ",
        module: "asker",
      },
      {
        _id: "write:asker/change-to-tasker",
        name: "Change asker to tasker",
        description: "",
        module: "asker",
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
        _id: "write:asker/delete",
        name: "Delete asker account",
        description: "Delete asker account",
        module: "asker",
        children: [
          {
            _id: "read:asker/detail",
          },
        ],
      },
      {
        _id: "write:asker/status",
        name: "Write asker user status",
        description: "Write asker user status",
        module: "asker",
      },
      {
        _id: "write:asker/change-disabled-to-active",
        name: "Change disabled to active",
        description: "Change asker user status from disabled to active",
        module: "asker",
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
        _id: "read:tasker/notes",
        name: "Read tasker note",
        description: "Read tasker notes",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "write:tasker/notes",
        name: "Write tasker note",
        description: "Write tasker notes",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/notes",
          },
        ],
      },
      {
        _id: "read:tasker/services",
        name: "Read tasker services",
        description: "Read services of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "write:tasker/services",
        name: "Update tasker services",
        description: "Update tasker services",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/services",
          },
        ],
      },
      {
        _id: "read:tasker/task-history",
        name: "Read task history",
        description: "Read task history of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/todo-task",
        name: "Read to do tasks",
        description: "Read to do tasks of an tasker",
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
        _id: "read:tasker/finance-transaction",
        name: "Read tasker finance and transaction",
        description: "Read finance and transaction of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/quick-posted-task",
        name: "Read tasker quick-posted-task",
        description: "Read quick-posted-task of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/viewed-task",
        name: "Read tasker quick-posted-task",
        description: "Read viewed-task of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/city",
        name: "Read tasker city",
        description: "Read working places of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "write:tasker/city",
        name: "Update tasker city",
        description: "Update working places of an tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/city",
          },
        ],
      },
      {
        _id: "read:tasker-report/search",
        name: "Read tasker report",
        description: "Read tasker report",
        module: "tasker",
      },
      {
        _id: "read:tasker-low-rating/search",
        name: "Read tasker low-rating",
        description: "Read tasker low-rating",
        module: "tasker",
      },
      {
        _id: "read:tasker-register/search",
        name: "Read tasker register",
        description: "Read tasker register",
        module: "tasker",
      },
      {
        _id: "write:tasker/deposit-new-tasker",
        name: "Deposit for new tasker",
        description: "Deposit for new tasker",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/finance-transaction",
          },
        ],
      },
      {
        _id: "write:tasker/deposit",
        name: "Top up money",
        description: "Add money to Tasker account",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/deposit",
          },
        ],
      },
      {
        _id: "write:tasker/withdraw",
        name: "Withdraw money",
        description: "Withdraw money from tasker account",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/withdraw",
          },
        ],
      },
      {
        _id: "read:taskers/read-by-status",
        name: "Read taskers by status",
        description: "Read taskers by status",
        module: "tasker",
      },
      {
        _id: "read:taskers/inactive",
        name: "Read taskers inactive",
        description: "Has not done any task for a period of time",
        module: "tasker",
      },
      {
        _id: "read:taskers/low-balance",
        name: "Read taskers have low balance",
        description: "Read taskers have low balance",
        module: "tasker",
      },
      {
        _id: "write:tasker/bank-account",
        name: "Update tasker bank account",
        description: "Update tasker bank account",
        module: "tasker",
      },
      {
        _id: "read:taskers/working-time",
        name: "Read taskers working time",
        description: "Read taskers working time and speed of accept tasks",
        module: "tasker",
      },
      {
        _id: "read:taskers/read-by-task-done",
        name: "Read taskers by task done",
        description: "Read taskers by number of dont task",
        module: "tasker",
      },
      {
        _id: "read:taskers/read-by-birthday",
        name: "Read taskers have birthday in a month",
        description: "Read taskers have birthday in a month",
        module: "tasker",
      },
      {
        _id: "read:taskers/receive-monthly-reward",
        name: "Read taskers receive monthly reward",
        description: "Read taskers receive monthly reward",
        module: "tasker",
      },
      {
        _id: "read:taskers/no-monthly-reward",
        name: "Read taskers no receive monthly reward",
        description: "Read taskers no receive monthly reward",
        module: "tasker",
      },
      {
        _id: "write:notification/send-tasker",
        name: "Send notification to taskers ",
        description: "Send notification to taskers using a template",
        children: [
          {
            _id: "read:notification/list",
          },
        ],
        module: "tasker",
      },
      {
        _id: "read:company/list",
        name: "Read company",
        description: "Read company",
        module: "tasker",
      },
      {
        _id: "write:company/create",
        name: "Create a new company",
        description: "Create a new company",
        module: "tasker",
      },
      {
        _id: "write:company/update",
        name: "Update company",
        description: "Update company information, members, ...",
        module: "tasker",
      },
      {
        _id: "read:tasker/open-app-history",
        name: "Read tasker open app history",
        description: "Read tasker open app history",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:tasker/referral-history",
        name: "Read tasker referral new user",
        description: "Read tasker referral new user",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "read:taskers/onboarding",
        name: "Read taskers onboarding",
        description: "Read taskers onboarding",
        module: "tasker",
      },
      {
        _id: "read:taskers/top-up",
        name: "Read taskers top up",
        description: "Read taskers top up",
        module: "tasker",
      },
      {
        _id: "write:tasker/delete",
        name: "Delete tasker account",
        description: "Delete tasker account",
        module: "tasker",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:tasker/violate",
        name: "Write tasker into list violate",
        description: "Write tasker into list violate",
        module: "tasker",
      },
      {
        _id: "read:tasker/daily-report",
        name: "Read Tasker daily report",
        description: "Read Tasker daily report",
        module: "tasker",
      },
      {
        _id: "read:tasker/operation-report",
        name: "Read Tasker Operation Report",
        description: "Read Tasker Operation Report",
        module: "tasker",
      },
      {
        _id: "read:tasker/favourited-asker",
        name: "Read Favourited Asker of Tasker",
        description: "Read Favourited Asker of Tasker",
        module: "tasker",
      },
      {
        _id: "read:tasker/qa-list",
        name: "Read report tasker QA list",
        description: "Read report tasker QA list",
        module: "tasker",
      },
      {
        _id: "read:tasker/leakage",
        name: "Read Tasker leakage list",
        description: "Read Tasker leakage list",
        module: "tasker",
      },
      {
        _id: "read:tasker/tasker-referal",
        name: "Read page Tasker Referal",
        description: "Read page Tasker Referal",
        module: "tasker",
      },
      {
        _id: "write:tasker/tasker-referal",
        name: "Write page Tasker Referal",
        description: "Write page Tasker Referal",
        module: "tasker",
      },
      {
        _id: "write:tasker/premium",
        name: "Write tasker premium",
        description: "Write tasker premium",
        module: "tasker",
      },
      {
        _id: "read:tasker/violate",
        name: "Read tasker violate",
        description: "Read tasker violate",
        module: "tasker",
      },
      {
        _id: "read:tasker/groups-management-report",
        name: "Read page Tasker groups management report",
        description: "Read page Tasker groups management report",
        module: "tasker",
      },
      {
        _id: "write:task/air-conditioner-detail",
        name: "Update detail task Air Conditioner",
        description: "Update detail task Air Conditioner",
        module: "tasker",
      },
      {
        _id: "read:tasker/premium",
        name: "Read list tasker premium",
        description: "Read list tasker premium",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/search",
          },
          {
            _id: "read:tasker/info",
          },
        ],
      },
      {
        _id: "write:task/create-refund-request",
        name: "Create Refund Request",
        description: "Create Refund Request for task CANCELED or EXPIRED",
        module: "tasker",
      },
      {
        _id: "read:report/tasker-active-in-district",
        name: "Read page Tasker Active in district",
        description: "Read page Tasker Active in district",
        module: "tasker",
      },
      {
        _id: "read:tasker/things-to-know",
        name: "Read things to know",
        description: "Read things to know",
        module: "tasker",
      },
      {
        _id: "write:tasker/things-to-know",
        name: "Write things to know",
        description: "Write things to know",
        module: "tasker",
        children: [
          {
            _id: "read:tasker/things-to-know",
          },
        ],
      },
    ],
  },
  {
    module: "task",
    actions: [
      {
        _id: "read:task/search",
        name: "Search task",
        description: "Search a task",
        module: "task",
      },
      {
        _id: "read:task/general-info",
        name: "Read task information",
        description: "Read general infomation of a task",
        module: "task",
        children: [
          {
            _id: "read:task/search",
          },
        ],
      },
      {
        _id: "write:task/required-tools",
        name: "Update require/not-require tools",
        description: "Update require/not-require tools for the task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/send-notification",
        name: "Send task notification",
        description: "Send notification about the task by level",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/set-cancel-task",
        name: "Cancel task",
        description: "Cancel a task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/set-expired-task",
        name: "Expired task",
        description: "Set a task is EXPIRED",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/set-date",
        name: "Update working date",
        description: "Update working date",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
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
      {
        _id: "read:task/accepted-tasker",
        name: "Read accepted tasker",
        description: "Read taskers who aceepted this task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/accept-tasker",
        name: "Update accepted tasker",
        description: "Add/Remove taskers from accepted tasker list",
        module: "task",
        children: [
          {
            _id: "read:task/accepted-tasker",
          },
        ],
      },
      {
        _id: "read:task/conversation",
        name: "Read conversation",
        description: "Read conversation",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "read:task/suport-asker-tasker",
        name: "Read task support",
        description: "Read history support asker/tasker ",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "read:task/recommend-tasker",
        name: "Read recommend tasker",
        description: "Get recommend taskers for the task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "read:task/cancel-history",
        name: "Read task canceled history",
        description: "Read task canceled history",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "read:task/tasker-blacklist",
        name: "Read blacklist tasker",
        description: "Read tasker blacklist of a task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/tasker-blacklist",
        name: "Update blacklist tasker",
        description: "Add/Remove tasker blacklist of a task",
        module: "task",
        children: [
          {
            _id: "read:task/tasker-blacklist",
          },
        ],
      },
      {
        _id: "read:task/changes-history",
        name: "Read changes history",
        description: "Read changes history",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/create-schedule",
        name: "Create schedule",
        description: "Create schedule based on a task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/create-subscription",
        name: "Create subscription",
        description: "Create subscription based on a task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/support-asker-tasker",
        name: "Support Task",
        description: "Support tasker/asker by support amount of money (bPay) ",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/promotion",
        name: "Create promotion",
        description: "Create promotion for a task",
        module: "task",
        children: [
          {
            _id: "read:task/promotion",
          },
        ],
      },
      {
        _id: "read:task/promotion",
        name: "Read promotion",
        description: "Read promotion code created by a task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "read:task-special-list/search",
        name: "Search task special list",
        description: "Search/Read task special list",
        module: "task",
      },
      {
        _id: "write:task-special-list/search",
        name: "Update task special list",
        description: "Change cs_status to CANCEL or DONE",
        module: "task",
        children: [
          {
            _id: "read:task-special-list/search",
          },
        ],
      },
      {
        _id: "read:task-report/search",
        name: "Search task-report",
        description: "Search/Read tasks report (in 2 weeks)",
        module: "task",
      },
      {
        _id: "read:task-canceled/search",
        name: "Search task-canceled",
        description: "Search/Read tasks canceled ",
        module: "task",
      },
      {
        _id: "write:task/set-address",
        name: "Update task place",
        description: "Update task place of a task",
        module: "task",
      },
      {
        _id: "write:task/set-payment-method",
        name: "Update payment method",
        description: "Update payment method of a task",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/rating",
        name: "Rating a task",
        description: "Rating a task",
        module: "task",
      },
      {
        _id: "write:task/write-task-change-asker",
        name: "Change asker of a task",
        description: "Change asker of a task",
        module: "task",
      },
      {
        _id: "write:task/fine-asker",
        name: "Fine asker",
        description: "Fine asker",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "write:task/fine-tasker",
        name: "Fine tasker",
        description: "Fine tasker",
        module: "task",
        children: [
          {
            _id: "read:task/general-info",
          },
        ],
      },
      {
        _id: "read:task/compensation-list",
        name: "Read compensation history",
        description: "Read compensation history",
        module: "task",
        children: [],
      },
      {
        _id: "read:task/penalty-list",
        name: "Read penalty history",
        description: "Read penalty history",
        module: "task",
        children: [],
      },
      {
        _id: "read:task/refund",
        name: "Read refund request",
        description: "Read refund request",
        module: "task",
      },
      {
        _id: "write:task/refund",
        name: "Refund task",
        description: "Refund task",
        module: "task",
        children: [
          {
            _id: "read:task/refund",
          },
        ],
      },
      {
        _id: "write:task/change-to-posted",
        name: "write Task Change To Posted",
        description: "write Task Change To Posted",
        module: "task",
      },
      {
        _id: "send:task/send-receipt-email",
        name: "Send email receipt of task to customer",
        description: "Send email receipt of task to customer",
        module: "task",
      },
    ],
  },
];

const teams = ['account', 'cs', 'manager']

export default function RolesDetail() {
  return (
    <>
      <CardHeader className="font-bold text-xl flex-row flex justify-between items-center px-0">
        <div className="flex items-center"><ArrowBigLeftDashIcon className="cursor-pointer mr-2 h-4" /> Role detail</div>
        <Button>Edit</Button>
      </CardHeader>
      <Card className="p-4">
        <h3 className="font-semibold">Teams</h3>
        <div className="flex gap-2 mt-2 cursor-pointer">
          {teams.map((team: any, index: number) => <Badge key={index} className="rounded-md">{team}</Badge>)}
        </div>
        <h3 className="font-semibold mt-4">Role name</h3>
        <p className="">Role name</p>
        <ScrollArea className="h-72 mt-4 rounded-md border">
          <div className="p-4">
            {_.map(actionPermissions, (actionPermission: any) => (
              <Accordion type="single" collapsible>
                <AccordionItem value={actionPermission.module}>
                  <AccordionTrigger>
                    {actionPermission?.module?.toUpperCase()} features
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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
          </div>
        </ScrollArea>
      </Card>
    </>

  );
}
