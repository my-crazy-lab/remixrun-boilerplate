import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import {
  type AlertAction,
  AlertDialogContext,
} from '~/context/dialog-confirmation';
import { type MustBeAny } from '~/types';

interface AlertDialogState {
  open: boolean;
  title: string;
  body: string | React.ReactNode;
  type: 'alert' | 'confirm' | 'prompt';
  cancelButton: string;
  actionButton: string;
  defaultValue?: string;
  inputProps?: React.PropsWithoutRef<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  >;
}

function alertDialogReducer(
  state: AlertDialogState,
  action: AlertAction,
): AlertDialogState {
  switch (action.type) {
    case 'close':
      return { ...state, open: false };
    case 'alert':
    case 'confirm':
    case 'prompt':
      return {
        ...state,
        open: true,
        ...action,
        cancelButton:
          action.cancelButton ||
          (action.type === 'alert' ? 'Continue' : 'Cancel'),
        actionButton:
          ('actionButton' in action && action.actionButton) || 'Continue',
      };
    default:
      return state;
  }
}

export function AlertDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(alertDialogReducer, {
    open: false,
    title: '',
    body: '',
    type: 'alert',
    cancelButton: 'Cancel',
    actionButton: 'Continue',
  });

  const resolveRef = React.useRef<(tf: MustBeAny) => void>();

  function close() {
    dispatch({ type: 'close' });
    resolveRef.current?.(false);
  }

  function confirm(value?: string) {
    dispatch({ type: 'close' });
    resolveRef.current?.(value ?? true);
  }

  const dialog = React.useCallback(async <T extends AlertAction>(params: T) => {
    dispatch(params);

    return new Promise<
      T['type'] extends 'alert' | 'confirm' ? boolean : null | string
    >(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  return (
    <AlertDialogContext.Provider value={dialog}>
      {children}
      <AlertDialog
        open={state.open}
        onOpenChange={(open: boolean) => {
          if (!open) close();
          return;
        }}>
        <AlertDialogContent asChild>
          <form
            onSubmit={event => {
              event.preventDefault();
              confirm(event.currentTarget.prompt?.value);
            }}>
            <AlertDialogHeader>
              <AlertDialogTitle>{state.title}</AlertDialogTitle>
              {state.body ? (
                <AlertDialogDescription>{state.body}</AlertDialogDescription>
              ) : null}
            </AlertDialogHeader>
            {state.type === 'prompt' && (
              <Input
                name="prompt"
                defaultValue={state.defaultValue}
                {...state.inputProps}
              />
            )}
            <AlertDialogFooter>
              <Button variant="outline" type="button" onClick={close}>
                {state.cancelButton}
              </Button>
              {state.type === 'alert' ? null : (
                <Button type="submit">{state.actionButton}</Button>
              )}
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}
