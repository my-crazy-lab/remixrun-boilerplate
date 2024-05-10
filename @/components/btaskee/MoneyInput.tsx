import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useReducer } from 'react';
import { UseFormReturn } from 'react-hook-form';

type TextInputProps = {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
};

function numberWithCommas(value: number) {
  return value.toLocaleString();
}

export default function MoneyInput(props: TextInputProps) {
  const initialValue = props.form.getValues()[props.name]
    ? numberWithCommas(Number(props.form.getValues()[props.name]))
    : '';

  const [value, setValue] = useReducer((_: any, next: string) => {
    const digits = next.replace(/\D/g, '');
    return numberWithCommas(Number(digits));
  }, initialValue);

  function handleChange(realChangeFn: Function, formattedValue: string) {
    const digits = formattedValue.replace(/\D/g, '');
    const realValue = Number(digits);
    realChangeFn(realValue);
  }

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        field.value = value;
        const _change = field.onChange;

        return (
          <FormItem>
            <FormLabel>{props.label}</FormLabel>
            <FormControl>
              <Input
                placeholder={props.placeholder}
                type="text"
                {...field}
                onChange={ev => {
                  setValue(ev.target.value);
                  handleChange(_change, ev.target.value);
                }}
                value={value}
                endAdornment={<span>VND</span>}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
