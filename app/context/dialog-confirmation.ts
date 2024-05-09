import React from 'react';

export const AlertDialogContext = React.createContext<
  <T extends AlertAction>(
    params: T,
  ) => Promise<T['type'] extends 'alert' | 'confirm' ? boolean : null | string>
>(() => null!);

export type AlertAction =
  | { type: 'alert'; title: string; body?: string; cancelButton?: string }
  | {
      type: 'confirm';
      title: string;
      body?: string | React.ReactNode;
      cancelButton?: string;
      actionButton?: string;
    }
  | {
      type: 'prompt';
      title: string;
      body?: string | React.ReactNode;
      cancelButton?: string;
      actionButton?: string;
      defaultValue?: string;
      inputProps?: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >;
    }
  | { type: 'close' };

export type ConfirmationParams<T extends 'alert' | 'confirm' | 'prompt'> =
  | Omit<Extract<AlertAction, { type: T }>, 'type'>
  | string;
