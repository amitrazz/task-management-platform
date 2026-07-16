'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  FolderKanban,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut
} from 'lucide-react'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { TaskDetailDrawer } from '@/components/ui/TaskDetailDrawer'
import { useLiveSimulation } from '@/features/tracko/hooks/useLiveSimulation'
import { useKeyboardShortcuts } from '@/features/tracko/hooks/useKeyboardShortcuts'
import { ShortcutsHelpModal } from '@/components/ui/ShortcutsHelpModal'

export default function TrackoShell({ children }: { children: React.ReactNode }) {
  useLiveSimulation()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)

  // Bind Keyboard Shortcuts Hook
  useKeyboardShortcuts(() => setIsShortcutsOpen((prev) => !prev))
  
  const { notifications, members, currentUserId, workspace } = useTrackoStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    // Register global hotkey for command palette: ⌘K or Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (pathname === '/login') {
    return <>{children}</>
  }

  const currentUser = members.find((m) => m.id === currentUserId)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    document.cookie = 'isLoggedIn=false; path=/; max-age=0'
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Inbox', href: '/inbox', icon: Inbox, badge: unreadCount },
    { label: 'My Tasks', href: '/tasks', icon: CheckCircle2 },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Teams', href: '/teams', icon: Users },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Activity', href: '/activity', icon: Activity },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  // Render navigation links
  const renderNavLinks = () => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className={`transition-all duration-200 ${isCollapsed && 'hidden md:hidden'}`}>{item.label}</span>
            </div>
            
            {item.badge && item.badge > 0 && (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ring-1 ${
                  isActive 
                    ? 'bg-primary-foreground text-primary ring-primary/20' 
                    : 'bg-destructive/10 text-destructive ring-destructive/20'
                } ${isCollapsed && 'hidden md:hidden'}`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <AnimatePresence>
        {isSearchOpen && (
          <CommandPalette onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isShortcutsOpen && (
          <ShortcutsHelpModal onClose={() => setIsShortcutsOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchParams && searchParams.get('task') && (
          <TaskDetailDrawer />
        )}
      </AnimatePresence>

      {/* MOBILE HEADER BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
            className="h-8 w-8 text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-md font-bold tracking-tight">Tracko</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="h-8 w-8 text-muted-foreground"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Avatar className="h-7 w-7 border">
            <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
              {currentUser?.avatar || 'US'}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* MOBILE DRAWER SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background shadow-xl md:hidden"
            >
              {/* Mobile Sidebar Head */}
              <div className="flex h-14 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Tracko</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">v2.0</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Workspace Selector (Mobile) */}
              <div className="border-b p-3">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{workspace.logo}</span>
                    <span className="truncate">{workspace.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Navigation Links */}
              {renderNavLinks()}

              {/* Mobile Sidebar Footer */}
              <div className="border-t p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="font-bold bg-muted text-foreground">
                        {currentUser?.avatar || 'AR'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{currentUser?.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{currentUser?.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {mounted && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-destructive">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground shrink-0 sticky top-0 h-screen select-none z-30"
      >
        {/* Workspace Switcher Header */}
        <div className="relative border-b border-sidebar-border px-4 py-3 flex items-center justify-between h-14">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-lg font-bold shrink-0">{workspace.logo}</span>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-sm truncate tracking-tight pr-6 text-foreground"
              >
                {workspace.name}
              </motion.span>
            )}
          </div>
          
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 absolute right-4 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}

          {/* Workspace Dropdown Panel */}
          <AnimatePresence>
            {isWorkspaceDropdownOpen && !isCollapsed && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsWorkspaceDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-3 right-3 top-12 z-20 border rounded-lg bg-popover text-popover-foreground shadow-lg p-1.5 space-y-0.5"
                >
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-semibold bg-muted text-foreground">
                    <span>⚡</span>
                    <span className="truncate">StackCrafter Enterprise</span>
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                    <span>💻</span>
                    <span className="truncate">Personal Workspace</span>
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                    <span>🚀</span>
                    <span className="truncate">Client Sandbox</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search Button */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`flex w-full items-center justify-between rounded-lg border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground text-xs p-2 transition-all duration-150 ${isCollapsed ? 'justify-center py-2' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 shrink-0" />
              {!isCollapsed && <span>Search Tracko...</span>}
            </div>
            {!isCollapsed && (
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[9px] font-bold text-muted-foreground">
                <span>⌘</span>K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Section */}
        {renderNavLinks()}

        {/* Desktop Sidebar Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-3 bg-muted/10 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="h-8 w-8 border shrink-0">
                <AvatarFallback className="font-bold text-xs bg-muted text-foreground">
                  {currentUser?.avatar || 'AR'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-semibold truncate text-foreground">{currentUser?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{currentUser?.role}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Collapsible toggle buttons */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-background border text-muted-foreground hover:text-foreground h-5 w-5 rounded-full flex items-center justify-center shadow-xs cursor-pointer focus:outline-none"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>
      </motion.aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 mt-14 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
