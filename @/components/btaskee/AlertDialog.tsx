import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialogCancelProps } from '@radix-ui/react-alert-dialog';
import { PropsWithChildren } from 'react';

interface CommonAlertDialogProps {
  triggerText: string;
  title: string;
  description: string;
  onCancel?: AlertDialogCancelProps['onClick'];
  cancelText?: string;
}

export const CommonAlertDialog = ({
  triggerText,
  title,
  description,
  children,
  onCancel,
  cancelText = 'Cancel',
}: PropsWithChildren<CommonAlertDialogProps>) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="px-2 py-1 border-none w-full font-normal justify-start h-8"
          variant="outline">
          {triggerText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction>{children}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
