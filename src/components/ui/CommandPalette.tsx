'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Hash, User, CornerDownLeft, Sparkles, Plus } from 'lucide-react'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

interface CommandPaletteProps {
  onClose: () => void
}

interface PaletteItem {
  type: 'task' | 'project' | 'member' | 'action'
  id: string
  title: string
  category: string
  action: () => void
  globalIndex?: number
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { tasks, projects, members } = useTrackoStore()
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Filter items based on query
  const filteredTasks = query
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase())
      )
    : tasks.slice(0, 3)

  const filteredProjects = query
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : projects.slice(0, 2)

  const filteredMembers = query
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.role.toLowerCase().includes(query.toLowerCase())
      )
    : members.slice(0, 2)

  // Quick actions
  const quickActions = useMemo(() => [
    {
      id: 'act-new-task',
      title: 'Create new issue / task',
      category: 'Quick Actions',
      action: () => {
        router.push('/tasks?create=true')
        onClose()
      },
    },
    {
      id: 'act-theme',
      title: `Toggle color theme (current: ${theme})`,
      category: 'Quick Actions',
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
        onClose()
      },
    },
    {
      id: 'act-dashboard',
      title: 'Go to workspace dashboard',
      category: 'Quick Actions',
      action: () => {
        router.push('/dashboard')
        onClose()
      },
    },
  ], [theme, router, onClose, setTheme])

  const filteredActions = query
    ? quickActions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
    : quickActions

  // Build the unified items list for arrow key navigation
  const listItems = useMemo(() => {
    const items: PaletteItem[] = []

    filteredTasks.forEach((t) => {
      items.push({
        type: 'task',
        id: t.id,
        title: t.title,
        category: 'Tasks',
        action: () => {
          router.push(`/tasks?task=${t.id}`)
          onClose()
        },
      })
    })

    filteredProjects.forEach((p) => {
      items.push({
        type: 'project',
        id: p.id,
        title: p.name,
        category: 'Projects',
        action: () => {
          router.push(`/projects/${p.id}`)
          onClose()
        },
      })
    })

    filteredMembers.forEach((m) => {
      items.push({
        type: 'member',
        id: m.id,
        title: `${m.name} (${m.role})`,
        category: 'Members',
        action: () => {
          router.push(`/settings?tab=members`)
          onClose()
        },
      })
    })

    filteredActions.forEach((a) => {
      items.push({
        type: 'action',
        id: a.id,
        title: a.title,
        category: 'Quick Actions',
        action: a.action,
      })
    })

    return items
  }, [filteredTasks, filteredProjects, filteredMembers, filteredActions, router, onClose])

  // Handle key listeners for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (listItems.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % listItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + listItems.length) % listItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (listItems[selectedIndex]) {
          listItems[selectedIndex].action()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, listItems])

  // Group items by category to display beautifully
  const categories = useMemo(() => {
    const cats: { [key: string]: PaletteItem[] } = {}
    listItems.forEach((item, index) => {
      if (!cats[item.category]) {
        cats[item.category] = []
      }
      cats[item.category].push({ ...item, globalIndex: index })
    })
    return cats
  }, [listItems])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        ref={containerRef}
        className="w-full max-w-xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl relative z-10 flex flex-col max-h-[70vh] border-border"
      >
        {/* Search header bar */}
        <div className="flex items-center gap-3 border-b px-4 py-3.5 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none text-foreground"
            placeholder="Type a task ID, keyword, or action..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            autoFocus
          />
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results layout */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {listItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 stroke-[1.25px]" />
              <p>No results found for &quot;{query}&quot;</p>
              <p className="text-xs">Try searching for &quot;TRK&quot;, &quot;refactor&quot;, or &quot;theme&quot;</p>
            </div>
          ) : (
            Object.entries(categories).map(([catName, items]) => (
              <div key={catName} className="mb-3 last:mb-0">
                <h3 className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {catName}
                </h3>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isSelected = selectedIndex === item.globalIndex
                    return (
                      <div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => {
                          if (item.globalIndex !== undefined) {
                            setSelectedIndex(item.globalIndex)
                          }
                        }}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.type === 'task' && (
                            <span
                              className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground border'
                              }`}
                            >
                              {item.id}
                            </span>
                          )}
                          {item.type === 'project' && <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          {item.type === 'member' && <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          {item.type === 'action' && <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          <span className="text-sm truncate font-medium">{item.title}</span>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] text-primary-foreground/75 font-medium shrink-0 animate-fade-in">
                            <span>Open</span>
                            <CornerDownLeft className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="border-t px-4 py-2.5 bg-muted/40 text-[10px] text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="rounded border bg-background px-1 py-0.5 font-sans font-bold">↑↓</span> Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="rounded border bg-background px-1 py-0.5 font-sans font-bold">Enter</span> Select
            </span>
          </div>
          <span>Tracko workspace shortcuts</span>
        </div>
      </motion.div>
    </div>
  )
}
