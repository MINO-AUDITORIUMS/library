"use client"

import { useEffect, useRef, useState } from "react"
import { ClockIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { parseTimeValue, toTimeValue } from "@/lib/datetime"
import { cn } from "@/lib/utils"

export type TimePickerFieldProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  id?: string
}

function digitsOnly(raw: string, maxLength: number) {
  return raw.replace(/\D/g, "").slice(0, maxLength)
}

function clampHour(value: number) {
  return Math.min(23, Math.max(0, value))
}

function clampMinute(value: number) {
  return Math.min(59, Math.max(0, value))
}

function commitTime(hourText: string, minuteText: string) {
  const hours = clampHour(parseInt(hourText || "0", 10))
  const minutes = clampMinute(parseInt(minuteText || "0", 10))
  return toTimeValue(hours, minutes)
}

function splitTimeValue(value: string) {
  const parsed = parseTimeValue(value)
  if (!parsed) return { hourText: "", minuteText: "" }
  return {
    hourText: String(parsed.hours),
    minuteText: String(parsed.minutes).padStart(2, "0"),
  }
}

function selectAll(event: React.FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget
  requestAnimationFrame(() => input.select())
}

export function TimePickerField({
  value,
  onChange,
  className,
  id,
}: TimePickerFieldProps) {
  const minuteRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const [hourText, setHourText] = useState("")
  const [minuteText, setMinuteText] = useState("")
  const editingRef = useRef<"hour" | "minute" | null>(null)

  useEffect(() => {
    if (editingRef.current) return
    const next = splitTimeValue(value)
    setHourText(next.hourText)
    setMinuteText(next.minuteText)
  }, [value])

  function handleHourChange(raw: string) {
    const previous = hourText
    const next = digitsOnly(raw, 2)
    setHourText(next)
    onChange(commitTime(next, minuteText))

    if (previous.length < 2 && next.length === 2) {
      requestAnimationFrame(() => {
        minuteRef.current?.focus()
        minuteRef.current?.select()
      })
    }
  }

  function handleMinuteChange(raw: string) {
    const next = digitsOnly(raw, 2)
    setMinuteText(next)
    onChange(commitTime(hourText, next))
  }

  function handleHourKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === ":" || event.key === "ArrowRight") {
      event.preventDefault()
      minuteRef.current?.focus()
      minuteRef.current?.select()
    }
  }

  function handleMinuteKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && minuteText.length === 0) {
      event.preventDefault()
      hourRef.current?.focus()
      hourRef.current?.select()
      return
    }

    if (event.key === "ArrowLeft" && event.currentTarget.selectionStart === 0) {
      event.preventDefault()
      hourRef.current?.focus()
      hourRef.current?.select()
    }
  }

  function handleHourBlur() {
    editingRef.current = null
    if (!hourText) return
    const normalized = String(clampHour(parseInt(hourText, 10)))
    setHourText(normalized)
    onChange(commitTime(normalized, minuteText))
  }

  function handleMinuteBlur() {
    editingRef.current = null
    if (!minuteText) return
    const padded = String(clampMinute(parseInt(minuteText, 10))).padStart(2, "0")
    setMinuteText(padded)
    onChange(commitTime(hourText, padded))
  }

  return (
    <InputGroup className={cn("h-8", className)}>
      <InputGroupAddon>
        <ClockIcon className="size-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        ref={hourRef}
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="14"
        value={hourText}
        className="w-10 text-center tabular-nums"
        onFocus={(event) => {
          editingRef.current = "hour"
          selectAll(event)
        }}
        onClick={(event) => event.currentTarget.select()}
        onChange={(event) => handleHourChange(event.target.value)}
        onKeyDown={handleHourKeyDown}
        onBlur={handleHourBlur}
        aria-label="Heures"
      />
      <InputGroupText className="px-0 tabular-nums">:</InputGroupText>
      <InputGroupInput
        ref={minuteRef}
        inputMode="numeric"
        autoComplete="off"
        placeholder="30"
        value={minuteText}
        className="w-10 text-center tabular-nums"
        onFocus={(event) => {
          editingRef.current = "minute"
          selectAll(event)
        }}
        onClick={(event) => event.currentTarget.select()}
        onChange={(event) => handleMinuteChange(event.target.value)}
        onKeyDown={handleMinuteKeyDown}
        onBlur={handleMinuteBlur}
        aria-label="Minutes"
      />
    </InputGroup>
  )
}
