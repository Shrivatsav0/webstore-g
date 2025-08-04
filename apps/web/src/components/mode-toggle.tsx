"use client"

import { useId, useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function ModeToggle() {
  const id = useId()
  const { theme, systemTheme, setTheme } = useTheme()
  const [checked, setChecked] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set initial state based on system theme
  useEffect(() => {
    if (!mounted) return

    // Determine effective theme
    const effectiveTheme = theme === 'system' ? systemTheme : theme

    // Set switch state based on effective theme
    setChecked(effectiveTheme === 'dark')
  }, [theme, systemTheme, mounted])

  const handleCheckedChange = (checked: boolean) => {
    setChecked(checked)
    setTheme(checked ? "dark" : "light")
  }

  if (!mounted) {
    // Return a placeholder to avoid hydration mismatch
    return (
      <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <div className="h-[inherit] w-auto bg-input/50"></div>
        <span className="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center">
          <MoonIcon size={16} aria-hidden="true" />
        </span>
        <span className="pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center">
          <SunIcon size={16} aria-hidden="true" />
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="peer data-[state=checked]:bg-input/50 data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
        />
        <span className="peer-data-[state=checked]:text-muted-foreground/70 pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center">
          <MoonIcon size={16} aria-hidden="true" />
        </span>
        <span className="peer-data-[state=unchecked]:text-muted-foreground/70 pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center">
          <SunIcon size={16} aria-hidden="true" />
        </span>
      </div>
      <Label htmlFor={id} className="sr-only">
        Toggle dark mode
      </Label>
    </div>
  )
}
