import { Grid } from '@/components/btaskee/Grid';
import { TimePicker } from '@/components/btaskee/TimePicker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';

export interface DatePickerProps {
  form: UseFormReturn<any>;
  name: string;
  showTime?: boolean;
}

const DateTimePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ form, name, showTime }) => {
    return (
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !field.value?.from && 'text-muted-foreground',
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value?.from ? (
                  field.value?.to ? (
                    <>
                      {format(field.value.from, 'LLL dd y, HH:mm')} -{' '}
                      {format(field.value.to, 'LLL dd y, HH:mm')}
                    </>
                  ) : (
                    format(field.value.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={field.value?.from}
                selected={{
                  from: field.value?.from,
                  to: field.value?.to,
                }}
                onSelect={field.onChange}
                numberOfMonths={2}
              />
              {showTime && (
                <Grid className="grid-cols-2 p-3 border-t border-border space-x-3">
                  <TimePicker
                    setDate={e => {
                      const timeUpdated = { from: e, to: field.value?.to };
                      field.onChange(timeUpdated);
                    }}
                    date={field.value?.from}
                  />
                  <TimePicker
                    setDate={e => {
                      const timeUpdated = { to: e, from: field.value?.from };
                      field.onChange(timeUpdated);
                    }}
                    date={field.value?.to}
                  />
                </Grid>
              )}
            </PopoverContent>
          </Popover>
        )}
      />
    );
  },
);

DateTimePicker.displayName = 'DateTimePicker';

export { DateTimePicker };
