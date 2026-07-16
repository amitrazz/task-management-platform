'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import {
  Activity as ActivityIcon,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ActivityPage() {
  const router = useRouter()
  const { activities, members } = useTrackoStore()

  const handleOpenTask = (taskId?: string) => {
    if (taskId) {
      router.push(`${window.location.pathname}?task=${taskId}`)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ActivityIcon className="h-6 w-6 text-muted-foreground" />
            Global Activity Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time audit log of task updates, project operations, and discussion comments.
          </p>
        </div>
      </div>

      {/* Timeline Feed */}
      <Card className="border-border p-6">
        <CardContent className="p-0">
          <div className="relative border-l border-border pl-6 space-y-6 ml-3">
            {activities.map((act) => {
              const user = members.find((m) => m.id === act.userId)
              const dateObj = new Date(act.time)
              const formattedTime = dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div key={act.id} className="relative group text-sm">
                  {/* Timeline dot */}
                  <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background border-muted-foreground/60 flex items-center justify-center shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>

                  <div className="flex items-start gap-4">
                    <Avatar className="h-7 w-7 border shrink-0">
                      <AvatarFallback className="text-[9px] font-bold bg-muted text-foreground">
                        {user?.avatar || 'AR'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-foreground">{user?.name || 'Workspace Broker'}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{formattedTime}</span>
                      </div>
                      
                      <div className="text-sm text-foreground/80 leading-relaxed">
                        {act.message}
                      </div>

                      {/* Clickable link to target task if present */}
                      {act.taskId && (
                        <button
                          onClick={() => handleOpenTask(act.taskId)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold font-mono tracking-wider text-primary hover:underline border rounded px-2 py-0.5 bg-muted/40 mt-1 cursor-pointer"
                        >
                          View {act.taskId} <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {activities.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic">No activities recorded in the workspace audit trail yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
