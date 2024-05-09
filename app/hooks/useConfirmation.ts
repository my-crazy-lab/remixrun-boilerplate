import React from 'react';
import {
  AlertDialogContext,
  type ConfirmationParams,
} from '~/context/dialog-confirmation';

export function useConfirm() {
  const dialog = React.useContext(AlertDialogContext);

  return React.useCallback(
    (params: ConfirmationParams<'confirm'>) => {
      return dialog({
        ...(typeof params === 'string' ? { title: params } : params),
        type: 'confirm',
      });
    },
    [dialog],
  );
}
export function usePrompt() {
  const dialog = React.useContext(AlertDialogContext);

  return (params: ConfirmationParams<'prompt'>) =>
    dialog({
      ...(typeof params === 'string' ? { title: params } : params),
      type: 'prompt',
    });
}
export function useAlert() {
  const dialog = React.useContext(AlertDialogContext);
  return (params: ConfirmationParams<'alert'>) =>
    dialog({
      ...(typeof params === 'string' ? { title: params } : params),
      type: 'alert',
    });
}
