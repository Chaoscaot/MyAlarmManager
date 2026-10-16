"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "~/lib/utils"
import { buttonVariants } from "~/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 h-7 items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "z-10 size-7 bg-transparent p-0 opacity-50 hover:opacity-100 aria-disabled:pointer-events-none"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "z-10 size-7 bg-transparent p-0 opacity-50 hover:opacity-100 aria-disabled:pointer-events-none"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "group/day relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "data-[selected]:bg-accent first:data-[selected]:rounded-l-md last:data-[selected]:rounded-r-md"
            : "rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal",
          "group-data-[today]/day:bg-accent group-data-[today]/day:text-accent-foreground",
          "group-data-[selected]/day:bg-primary group-data-[selected]/day:text-primary-foreground group-data-[selected]/day:hover:bg-primary group-data-[selected]/day:hover:text-primary-foreground group-data-[selected]/day:focus:bg-primary group-data-[selected]/day:focus:text-primary-foreground",
          "group-data-[outside]/day:text-muted-foreground group-data-[disabled]/day:text-muted-foreground group-data-[disabled]/day:opacity-50"
        ),
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        range_middle:
          "[&>button]:!bg-accent [&>button]:!text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className={cn("size-4", className)} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
