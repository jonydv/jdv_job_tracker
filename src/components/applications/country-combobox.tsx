"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { getCountryName } from "@/lib/geo/country-name"
import { COUNTRY_CODES, type CountryCode } from "@/lib/constants/country-codes"

const CLEAR_VALUE = "__clear__"

export function CountryCombobox({
  value,
  onChange,
  placeholder,
  clearLabel,
  ariaLabel,
}: {
  value: CountryCode | undefined
  onChange: (value: CountryCode | undefined) => void
  placeholder: string
  clearLabel: string
  ariaLabel: string
}) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)

  const options = useMemo(() => {
    return COUNTRY_CODES.map((code) => ({
      code,
      label: getCountryName(code, locale),
    })).sort((a, b) => a.label.localeCompare(b.label, locale))
  }, [locale])

  const codeByComposite = useMemo(() => {
    return new Map(
      options.map((option) => [`${option.label} ${option.code}`, option.code])
    )
  }, [options])

  const selectedLabel = value
    ? (options.find((option) => option.code === value)?.label ?? value)
    : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown
            className="size-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>—</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={CLEAR_VALUE}
                onSelect={() => {
                  onChange(undefined)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn("size-4", value ? "opacity-0" : "opacity-100")}
                  aria-hidden="true"
                />
                {clearLabel}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.code}
                  value={`${option.label} ${option.code}`}
                  onSelect={(composite) => {
                    const code = codeByComposite.get(composite)
                    if (code) onChange(code)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === option.code ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
