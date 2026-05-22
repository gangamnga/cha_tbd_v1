'use client'

import { useState } from 'react'
import { ThemeManager, type Theme } from './ThemeManager'
import { PrayerManager } from './PrayerManager'

type Prayer = {
  id: string
  title: string
  content: string
  themes: string[]
  sort_order: number
  is_active: boolean
}

export function LoiKinhClient({
  initialThemes,
  initialPrayers,
}: {
  initialThemes: Theme[]
  initialPrayers: Prayer[]
}) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)

  return (
    <>
      <ThemeManager themes={themes} onThemesChange={setThemes} />
      <PrayerManager initialPrayers={initialPrayers} initialThemes={themes} />
    </>
  )
}
