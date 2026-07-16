'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CalendarPage() {
  const router = useRouter()
  const { tasks } = useTrackoStore()

  // For this application, we anchor on July 2026 to align with mock dates
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(6) // 0-indexed, so 6 is July

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday, 1 = Monday...)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Generate date cells array (including blank days from previous month)
  const calendarCells = useMemo(() => {
    const cells: Array<{ dayNumber: number | null; dateString: string | null }> = []
    
    // Blank days
    for (let i = 0; i < firstDay; i++) {
      cells.push({ dayNumber: null, dateString: null })
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0')
      const dayStr = String(day).padStart(2, '0')
      const dateString = `${currentYear}-${monthStr}-${dayStr}`
      cells.push({ dayNumber: day, dateString })
    }

    return cells
  }, [currentYear, currentMonth, daysInMonth, firstDay])

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleOpenTask = (taskId: string) => {
    router.push(`${window.location.pathname}?task=${taskId}`)
  }

  const handleCreateTaskOnDate = (dateStr: string) => {
    router.push(`/tasks?create=true&dueDate=${dateStr}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive border-destructive text-white'
      case 'high': return 'bg-amber-500 border-amber-500 text-white animate-pulse'
      case 'medium': return 'bg-blue-500 border-blue-500 text-white'
      default: return 'bg-muted border-border text-muted-foreground'
    }
  }

  const getDayTasks = (dateString: string) => {
    return tasks.filter((t) => t.dueDate === dateString)
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-muted-foreground" />
            Milestones Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep track of deadlines and sprint milestones in a monthly dashboard layout.
          </p>
        </div>

        <Button onClick={() => router.push('/tasks?create=true')} className="h-9 text-xs w-fit shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>

      {/* Calendar Controller */}
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl shrink-0 select-none">
        <h2 className="text-sm font-bold text-foreground">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setCurrentMonth(6); setCurrentYear(2026) }} className="text-xs h-8">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Grid Table */}
      <Card className="border-border overflow-hidden select-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-[10px] font-bold text-muted-foreground py-2 tracking-wider">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>
          
          <div className="grid grid-cols-7 divide-x divide-y divide-border bg-border/20">
            {calendarCells.map((cell, idx) => {
              const dateTasks = cell.dateString ? getDayTasks(cell.dateString) : []
              const isToday = cell.dateString === '2026-07-16' // Mock anchor day
              
              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 flex flex-col justify-between bg-card text-foreground group relative transition ${
                    cell.dayNumber ? 'hover:bg-muted/10' : 'bg-muted/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center ${
                        isToday ? 'bg-primary text-primary-foreground font-bold shadow' : ''
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    
                    {cell.dateString && (
                      <button
                        onClick={() => handleCreateTaskOnDate(cell.dateString!)}
                        className="opacity-0 group-hover:opacity-100 transition h-5 w-5 rounded border bg-background hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Task alerts in day cell */}
                  <div className="flex-1 mt-2 space-y-1 overflow-y-auto max-h-[80px] scrollbar-none">
                    {dateTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenTask(t.id)}
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:scale-105 transition-transform ${getPriorityColor(
                          t.priority
                        )}`}
                      >
                        {t.id}: {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
