import type { FieldErrors } from 'react-hook-form';
import type { Props } from '@hookform/error-message';
import { ErrorMessage } from '@hookform/error-message';

export type IErrorMessage<TFieldErrors extends FieldErrors, T> = Props<
  TFieldErrors,
  any
>;

function ErrorMessageBase<TFieldErrors extends FieldErrors, T = any>(
  props: IErrorMessage<TFieldErrors, T>,
) {
  return (
    <ErrorMessage<TFieldErrors, any>
      {...props}
      render={({ message }) => <p className="italic mt-2 text-sm text-red-500">{message}</p>}
    />
  );
}

export default ErrorMessageBase;
