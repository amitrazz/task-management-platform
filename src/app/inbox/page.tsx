'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTrackoStore, Notification } from '@/features/tracko/store/trackoStore'
import {
  Inbox,
  Check,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InboxPage() {
  const router = useRouter()
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useTrackoStore()

  // Helper to categorize notifications
  const groupedNotifications = useMemo(() => {
    const today = new Date('2026-07-16') // Pin today to match mock dates, or fallback dynamically
    const yesterday = new Date('2026-07-15')
    
    const groups: { Today: Notification[]; Yesterday: Notification[]; Earlier: Notification[] } = {
      Today: [],
      Yesterday: [],
      Earlier: []
    }

    notifications.forEach((notif) => {
      const notifDate = new Date(notif.time)
      const diffTime = Math.abs(today.getTime() - notifDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (notifDate.toDateString() === today.toDateString() || diffDays <= 1) {
        // Mocking Today's grouping
        groups.Today.push(notif)
      } else if (notifDate.toDateString() === yesterday.toDateString() || diffDays === 2) {
        groups.Yesterday.push(notif)
      } else {
        groups.Earlier.push(notif)
      }
    })

    return groups
  }, [notifications])

  const handleOpenTask = (taskId?: string, notifId?: string) => {
    if (notifId) {
      markNotificationAsRead(notifId)
    }
    if (taskId) {
      router.push(`${window.location.pathname}?task=${taskId}`)
    }
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case 'mention': return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'status_change': return <TrendingUp className="h-4 w-4 text-emerald-500" />
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Inbox className="h-6 w-6 text-muted-foreground" />
            Inbox Cockpit
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay up to date with comments, issue assignments, and task state changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsAsRead}
            className="h-9 text-xs w-fit shrink-0 border-border"
          >
            <Check className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {/* Notifications list layout */}
      <div className="space-y-8 select-none">
        
        {/* TODAY */}
        {groupedNotifications.Today.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today</h2>
            <div className="space-y-2">
              {groupedNotifications.Today.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleOpenTask(n.taskId, n.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                    n.isRead 
                      ? 'bg-card border-border hover:border-primary/20 opacity-80' 
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-xs relative overflow-hidden'
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                    {getNotifIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-xs font-bold text-foreground ${!n.isRead && 'text-primary font-semibold'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(n.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed truncate">{n.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YESTERDAY */}
        {groupedNotifications.Yesterday.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Yesterday</h2>
            <div className="space-y-2">
              {groupedNotifications.Yesterday.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleOpenTask(n.taskId, n.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                    n.isRead 
                      ? 'bg-card border-border hover:border-primary/20 opacity-80' 
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-xs relative overflow-hidden'
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                    {getNotifIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-xs font-bold text-foreground ${!n.isRead && 'text-primary font-semibold'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground shrink-0">Yesterday</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed truncate">{n.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EARLIER */}
        {groupedNotifications.Earlier.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Earlier</h2>
            <div className="space-y-2">
              {groupedNotifications.Earlier.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleOpenTask(n.taskId, n.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                    n.isRead 
                      ? 'bg-card border-border hover:border-primary/20 opacity-80' 
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-xs relative overflow-hidden'
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                    {getNotifIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-xs font-bold text-foreground ${!n.isRead && 'text-primary'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(n.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed truncate">{n.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="py-24 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full border bg-muted flex items-center justify-center">
              <Eye className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground">Workspace is silent</h3>
            <p className="text-xs">No updates or notifications logged. You are completely up to date!</p>
          </div>
        )}
      </div>

    </div>
  )
}
