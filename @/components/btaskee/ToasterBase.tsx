import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Grid } from './Grid';

export function Toaster() {
  const { toasts } = useToast();
  const { t } = useTranslation(['common'])

  function renderContentBasedOnVariant(variant: any, description: any) {
    switch (variant) {
      case 'success':
        return (
          <div className='flex gap-4 items-center'>
            <CheckCircle2Icon className='text-secondary-foreground' />
            <Grid className='gap-1'>
              {<ToastTitle>{t('SUCCESS')}</ToastTitle>}
              <ToastDescription>{t(description)}</ToastDescription>
            </Grid>
          </div>
        )
      case 'information':
        return (
          <div className='flex gap-4 items-center'>
            <InfoIcon className='text-blue' />
            <Grid className='gap-1'>
              {<ToastTitle>{t('INFORMATION')}</ToastTitle>}
              <ToastDescription>{t(description)}</ToastDescription>
            </Grid>
          </div>
        )
      case 'warning':
        return (
          <div className='flex gap-4 items-center'>
            <AlertTriangleIcon className='text-yellow' />
            <Grid className='gap-1'>
              {<ToastTitle>{t('WARNING')}</ToastTitle>}
              <ToastDescription>{t(description)}</ToastDescription>
            </Grid>
          </div>
        )
      default:
        return (
          <div className='flex gap-4 items-center'>
            <XCircle className='text-red' />
            <Grid className='gap-1'>
              {<ToastTitle>{t('ERROR')}</ToastTitle>}
              <ToastDescription>{t(description)}</ToastDescription>
            </Grid>
          </div>
        )
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            {renderContentBasedOnVariant(variant, description)}
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}