"use client"

import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

export function FilterMultiSelect({
  label,
  allLabel,
  options,
  selected,
  onChange,
}: {
  label: string
  allLabel: string
  options: { value: string; label: string; icon?: ReactNode }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value]
    )
  }

  const summary =
    selected.length === 0 ? allLabel : `${label} (${selected.length})`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between">
          {summary}
          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="flex flex-col gap-1">
          {options.map((option) => {
            const id = `filter-${label}-${option.value}`
            return (
              <Label
                key={option.value}
                htmlFor={id}
                className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-normal"
              >
                <Checkbox
                  id={id}
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => toggle(option.value)}
                />
                {option.icon}
                {option.label}
              </Label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
