import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CaretSortIcon } from '@radix-ui/react-icons';
import debounce from 'lodash/debounce.js';
import { CheckIcon } from 'lucide-react';
import React from 'react';
import { SetURLSearchParams } from 'react-router-dom';
import { CommonFunction, OptionType } from '~/types';

interface SelectSearchAsyncProps<T> {
  options: OptionType[];
  className?: string;
  selected?: OptionType[];
  setSelected?: T;
  isLoading?: boolean;
  defaultSearchValue?: string;
  placeholder?: string;
  searchRemix: { setSearchParams: SetURLSearchParams; searchKey: string };
}

function SelectSearchAsync<T extends CommonFunction>({
  options,
  className,
  selected = [],
  setSelected,
  isLoading = false,
  defaultSearchValue = '',
  searchRemix,
  placeholder = 'Select option',
}: SelectSearchAsyncProps<T>) {
  const [searchText, setSearchText] =
    React.useState<string>(defaultSearchValue);

  const debouncedOnChange = React.useMemo(
    () =>
      debounce(e => {
        searchRemix.setSearchParams(params => {
          params.set(searchRemix.searchKey, e || '');
          return params;
        });
      }, 500),
    [searchRemix],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full justify-between ${
            selected.length > 1 ? 'h-full' : 'h-10'
          }`}>
          {selected.length
            ? options.find(option => selected?.[0]?.value === option.value)
                ?.label
            : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className={className} shouldFilter={false}>
          <CommandInput
            value={searchText}
            onValueChange={e => {
              setSearchText(e);
              debouncedOnChange(e);
            }}
            placeholder="Search..."
          />
          <CommandEmpty>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ) : (
              'No item found.'
            )}
          </CommandEmpty>
          <CommandGroup>
            {options.map(option => (
              <CommandItem
                value={option.value}
                key={option.value}
                onSelect={() => {
                  setSelected?.([option]);
                }}>
                <CheckIcon
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected?.[0]?.value === option.value
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SelectSearchAsync;
