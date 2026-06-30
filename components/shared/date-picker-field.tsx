"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { parseDateKey, toDateKey } from "@/lib/datetime"
import { cn } from "@/lib/utils"

export type DatePickerFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Choisir une date",
  className,
  id,
}: DatePickerFieldProps) {
  const selected = useMemo(() => parseDateKey(value), [value])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          data-empty={!selected}
          className={cn(
            "w-full justify-between font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            {selected ? (
              format(selected, "PPP", { locale: fr })
            ) : (
              <span>{placeholder}</span>
            )}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={fr}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return
            onChange(toDateKey(date))
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
