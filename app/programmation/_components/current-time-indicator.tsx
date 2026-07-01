 "use client"
 
 import { useEffect, useMemo, useState } from "react"
 
 import {
   GRID_END_MINUTES,
   GRID_START_MINUTES,
   PIXELS_PER_MINUTE,
 } from "@/lib/programmation/constants"
 import { isToday } from "@/lib/programmation/dates"
 import { cn } from "@/lib/utils"
 
 export type CurrentTimeIndicatorProps = {
   date: Date
   className?: string
 }
 
 function minutesSinceMidnight(value: Date) {
   return value.getHours() * 60 + value.getMinutes()
 }
 
 export function CurrentTimeIndicator({
   date,
   className,
 }: CurrentTimeIndicatorProps) {
   const [now, setNow] = useState(() => new Date())
 
   useEffect(() => {
     const id = window.setInterval(() => setNow(new Date()), 30_000)
     return () => window.clearInterval(id)
   }, [])
 
   const top = useMemo(() => {
     if (!isToday(date)) return null
     const minutes = minutesSinceMidnight(now)
     if (minutes < GRID_START_MINUTES || minutes > GRID_END_MINUTES) return null
     return (minutes - GRID_START_MINUTES) * PIXELS_PER_MINUTE
   }, [date, now])
 
   if (top === null) return null
 
   return (
     <div
       className={cn(
         "pointer-events-none absolute right-0 left-0 z-20",
         className
       )}
       style={{ top }}
       aria-hidden="true"
     >
       <div className="h-[2px] bg-destructive shadow-[0_0_0_1px_hsl(var(--background))]" />
       <div className="absolute -top-1 left-0 size-2 rounded-full bg-destructive shadow-[0_0_0_2px_hsl(var(--background))]" />
     </div>
   )
 }
