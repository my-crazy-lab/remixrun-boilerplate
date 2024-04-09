import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce.js';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';
import type { SetURLSearchParams } from 'react-router-dom';
import { type CommonFunction } from '~/types';

import { Skeleton } from './skeleton';

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectAsyncProps<T> {
  options: OptionType[];
  className?: string;
  isDisplayAllOptions?: boolean;
  selected?: OptionType[];
  setSelected?: T;
  isLoading?: boolean;
  defaultSearchValue?: string;
  searchRemix: { setSearchParams: SetURLSearchParams; searchKey: string };
}

export function MultiSelectAsync<T extends CommonFunction>({
  options,
  className,
  selected = [],
  setSelected,
  isLoading = false,
  defaultSearchValue = '',
  searchRemix,
}: MultiSelectAsyncProps<T>) {
  const [open, setOpen] = React.useState(false);
  const handleUnselect = (item: string) => {
    setSelected?.(selected.filter(i => i.value !== item));
  };
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${
            selected.length > 1 ? 'h-full' : 'h-10'
          }`}
          onClick={() => setOpen(!open)}>
          <div className="flex gap-1 flex-wrap">
            {selected.map(item => (
              <Badge
                variant="secondary"
                key={item.value}
                className="mr-1 rounded-md"
                onClick={() => handleUnselect(item.value)}>
                {item.label}
                <button
                  className="ml-1 ring-offset-background rounded-md outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleUnselect(item.value);
                    }
                  }}
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item.value)}>
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  setSelected?.(
                    selected.some(item => item.value === option.value)
                      ? selected.filter(item => item.value !== option.value)
                      : [...selected, option],
                  );
                  setOpen(true);
                }}>
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected.some(item => item.value === option.value)
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

interface MultiSelectProps<T> {
  options: OptionType[];
  className?: string;
  isDisplayAllOptions?: boolean;
  selected?: OptionType[];
  setSelected?: T;
}

export function MultiSelect<T extends CommonFunction>({
  options,
  className,
  isDisplayAllOptions,
  selected = [],
  setSelected,
}: MultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [allSelected, setAllSelected] = React.useState(false);

  React.useEffect(() => {
    if (isDisplayAllOptions) {
      if (selected.length === options.length) {
        setAllSelected(true);
      } else {
        setAllSelected(false);
      }
    }
  }, [isDisplayAllOptions, selected, options]);

  const handleUnselect = (item: string) => {
    setSelected?.(selected.filter(i => i.value !== item));
  };

  const handleIsDisplayAllOptions = () => {
    if (allSelected && selected) {
      setSelected?.([]);
    } else {
      setSelected?.(options);
    }
    setAllSelected(!allSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${
            selected.length > 1 ? 'h-full' : 'h-10'
          }`}
          onClick={() => setOpen(!open)}>
          <div className="flex gap-1 flex-wrap">
            {selected.map(item => (
              <Badge
                variant="secondary"
                key={item.value}
                className="mr-1 rounded-md"
                onClick={() => handleUnselect(item.value)}>
                {item.label}
                <button
                  className="ml-1 ring-offset-background rounded-md outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleUnselect(item.value);
                    }
                  }}
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item.value)}>
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className={className}>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            <CommandItem onSelect={handleIsDisplayAllOptions}>
              {allSelected ? 'Unselect All' : 'Select All'}
            </CommandItem>
            {options.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  setSelected?.(
                    selected.some(item => item.value === option.value)
                      ? selected.filter(item => item.value !== option.value)
                      : [...selected, option],
                  );
                  setOpen(true);
                }}>
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected.some(item => item.value === option.value)
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
