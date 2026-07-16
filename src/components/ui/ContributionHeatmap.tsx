'use client'

import React, { useMemo } from 'react'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'

export function ContributionHeatmap() {
  const { tasks } = useTrackoStore()

  // Generate 16 weeks of daily contribution data
  const dataGrid = useMemo(() => {
    const days = 16 * 7
    const list = []
    const today = new Date('2026-07-16')

    // Find task completion frequencies by date
    const completionCounts: { [dateStr: string]: number } = {}
    
    // Seed some mock activity patterns
    const mockDates = [
      '2026-07-16', '2026-07-16', '2026-07-15', '2026-07-14',
      '2026-07-12', '2026-07-10', '2026-07-10', '2026-07-10',
      '2026-07-05', '2026-07-01', '2026-06-25', '2026-06-25',
      '2026-06-24', '2026-06-20', '2026-06-15', '2026-06-10',
      '2026-06-08', '2026-06-08', '2026-06-02', '2026-05-28',
      '2026-05-27', '2026-05-20', '2026-05-15', '2026-05-15'
    ]

    mockDates.forEach(d => {
      completionCounts[d] = (completionCounts[d] || 0) + 1
    })

    // Accumulate real completed tasks from store
    tasks.forEach(task => {
      if (task.status === 'done' && task.dueDate) {
        completionCounts[task.dueDate] = (completionCounts[task.dueDate] || 0) + 1
      }
    })

    // Build the grid list starting 16 weeks ago
    for (let i = days - 1; i >= 0; i--) {
      const dayDate = new Date(today)
      dayDate.setDate(today.getDate() - i)
      const dateStr = dayDate.toISOString().split('T')[0]
      const count = completionCounts[dateStr] || 0
      list.push({
        date: dateStr,
        count,
        level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4
      })
    }

    return list
  }, [tasks])

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-500/20 dark:bg-emerald-500/10 border-emerald-500/10'
      case 2:
        return 'bg-emerald-500/45 dark:bg-emerald-500/30 border-emerald-500/20'
      case 3:
        return 'bg-emerald-500/70 dark:bg-emerald-500/55 border-emerald-500/40'
      case 4:
        return 'bg-emerald-500 dark:bg-emerald-400 border-emerald-600/30'
      default:
        return 'bg-muted/40 border-border/40 hover:bg-muted/65'
    }
  }

  // Slice grid data into 16 weeks of 7 days
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < 16; i++) {
      w.push(dataGrid.slice(i * 7, (i + 1) * 7))
    }
    return w
  }, [dataGrid])

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card border-border shadow-xs select-none">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground tracking-wide uppercase">Workspace Velocity Heatmap</h4>
        <span className="text-[10px] text-muted-foreground">Past 16 weeks activity</span>
      </div>

      <div className="flex gap-2.5 pt-1 overflow-x-auto scrollbar-none items-start">
        {/* Days label */}
        <div className="flex flex-col justify-between text-[9px] text-muted-foreground/75 h-[84px] pr-1 leading-none pt-1">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  title={`${day.count} issues completed on ${day.date}`}
                  className={`h-2.5 w-2.5 rounded-xs border transition-all duration-150 cursor-pointer ${getIntensityColor(day.level)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex justify-between items-center text-[9px] text-muted-foreground pt-1.5 border-t border-border/40">
        <span>Learn how velocity is tracked</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="h-2 w-2 rounded-xs border bg-muted/40 border-border/40" />
          <div className="h-2 w-2 rounded-xs border bg-emerald-500/20 border-emerald-500/10" />
          <div className="h-2 w-2 rounded-xs border bg-emerald-500/45 border-emerald-500/20" />
          <div className="h-2 w-2 rounded-xs border bg-emerald-500/70 border-emerald-500/40" />
          <div className="h-2 w-2 rounded-xs border bg-emerald-500 border-emerald-600/30" />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
