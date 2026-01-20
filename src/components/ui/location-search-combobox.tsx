'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/useDebounce';
import {
  searchDistrictsWithContext,
  searchMandalsWithContext,
  searchStatesWithContext,
  searchVillagesWithContext,
} from '@/lib/adminLocationsSearch';

type LocationSearchType = 'state' | 'district' | 'mandal' | 'village';

interface LocationSearchItem {
  id: string;
  label: string;
  sublabel: string;
}

export interface LocationSearchComboboxProps {
  type: LocationSearchType;
  value: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function LocationSearchCombobox({
  type,
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
}: LocationSearchComboboxProps) {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: ['location-search', type, debouncedSearch],
    queryFn: async () => {
      if (type === 'state') {
        const results = await searchStatesWithContext(debouncedSearch, 20);
        return results.map(
          (r: { id: string; name: string }): LocationSearchItem => ({
            id: r.id,
            label: r.name,
            sublabel: 'State',
          }),
        );
      } else if (type === 'district') {
        const results = await searchDistrictsWithContext(debouncedSearch, 20);
        return results.map(
          (r: {
            id: string;
            name: string;
            stateName: string;
          }): LocationSearchItem => ({
            id: r.id,
            label: r.name,
            sublabel: r.stateName,
          }),
        );
      } else if (type === 'mandal') {
        const results = await searchMandalsWithContext(debouncedSearch, 20);
        return results.map(
          (r: {
            id: string;
            name: string;
            districtName: string;
            stateName: string;
          }): LocationSearchItem => ({
            id: r.id,
            label: r.name,
            sublabel: `${r.districtName}, ${r.stateName}`,
          }),
        );
      } else {
        const results = await searchVillagesWithContext(debouncedSearch, 20);
        return results.map(
          (r: {
            id: string;
            name: string;
            mandalName: string;
            districtName: string;
            stateName: string;
          }): LocationSearchItem => ({
            id: r.id,
            label: r.name,
            sublabel: `${r.mandalName}, ${r.districtName}, ${r.stateName}`,
          }),
        );
      }
    },
    staleTime: 30000,
  });

  const items = query.data ?? [];

  const selectedItem = React.useMemo(() => {
    if (!value) return null;
    return items.find((item) => item.id === value) ?? null;
  }, [items, value]);

  const defaultPlaceholder =
    type === 'district'
      ? 'Search district...'
      : type === 'mandal'
        ? 'Search mandal...'
        : type === 'village'
          ? 'Search village...'
          : 'Search state...';

  return (
    <Combobox
      items={items}
      value={selectedItem}
      onValueChange={(next) => {
        if (!next) {
          onValueChange('');
          return;
        }
        if (
          typeof next === 'object' &&
          'id' in next &&
          typeof next.id === 'string'
        ) {
          onValueChange(next.id);
        }
      }}
      onInputValueChange={setSearch}
    >
      <ComboboxInput
        placeholder={placeholder ?? defaultPlaceholder}
        disabled={disabled}
        showClear
        className={cn('w-full', className)}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {query.isLoading ? 'Searching...' : 'No results found.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: LocationSearchItem) => (
            <ComboboxItem key={item.id} value={item}>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.sublabel}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
