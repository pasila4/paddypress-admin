"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

export type GroupedComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}

export type GroupedComboboxGroup = {
  label: string
  options: GroupedComboboxOption[]
}

type InternalGroup = {
  value: string
  items: GroupedComboboxOption[]
}

export function GroupedCombobox(props: {
  value: string
  onValueChange: (nextValue: string) => void
  groups: GroupedComboboxGroup[]
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  contentClassName?: string
}) {
  const items = React.useMemo<InternalGroup[]>(
    () =>
      props.groups.map((g) => ({
        value: g.label,
        items: g.options,
      })),
    [props.groups]
  )

  const selected = React.useMemo(() => {
    for (const group of props.groups) {
      const match = group.options.find((o) => o.value === props.value)
      if (match) return match
    }
    return null
  }, [props.groups, props.value])

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(next) => {
        if (!next) {
          props.onValueChange("")
          return
        }
        if (typeof next === "object" && "value" in next && typeof next.value === "string") {
          props.onValueChange(next.value)
        }
      }}
    >
      <ComboboxInput
        placeholder={props.placeholder ?? "Select option"}
        disabled={props.disabled}
        showClear
        className={cn("w-full", props.className)}
      />
      <ComboboxContent className={props.contentClassName}>
        <ComboboxEmpty>{props.emptyText ?? "No results found."}</ComboboxEmpty>
        <ComboboxList>
          {(group: InternalGroup) => (
            <ComboboxGroup key={group.value} items={group.items} className="block pb-1">
              <ComboboxLabel className="sticky top-0 z-20 -mx-1 bg-popover border-b border-border/50 mb-1">
                {group.value}
              </ComboboxLabel>
              <div className="pt-1">
                <ComboboxCollection>
                  {(item: GroupedComboboxOption) => (
                    <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
                      <span className="flex-1 truncate">{item.label}</span>
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </div>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
