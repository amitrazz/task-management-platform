'use client'

import React from 'react'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import {
  Users,
  Plus
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

export default function TeamsPage() {
  const { teams, members, tasks, projects } = useTrackoStore()

  // Helper to map members to specific teams based on roles
  const getTeamMembers = (teamId: string) => {
    switch (teamId) {
      case 'TEAM-1': // Core Engineering
        return members.filter((m) => ['MEM-1', 'MEM-3', 'MEM-4'].includes(m.id))
      case 'TEAM-2': // Product & Design
        return members.filter((m) => ['MEM-1', 'MEM-2'].includes(m.id))
      case 'TEAM-3': // Growth & Marketing
        return members.filter((m) => ['MEM-2'].includes(m.id)) // Sarah handles marketing designs as well
      default:
        return []
    }
  }

  // Calculate stats for each team
  const getTeamStats = (teamId: string) => {
    const teamMems = getTeamMembers(teamId)
    const memIds = teamMems.map((m) => m.id)
    
    // Find projects assigned to this team
    const teamProjects = projects.filter((p) => p.teamId === teamId)
    
    // Find tasks assigned to members of this team
    const teamTasks = tasks.filter((t) => t.assigneeId && memIds.includes(t.assigneeId))
    const completedTasks = teamTasks.filter((t) => t.status === 'done')
    const completionRate = teamTasks.length > 0
      ? Math.round((completedTasks.length / teamTasks.length) * 100)
      : 100

    return {
      projectsCount: teamProjects.length,
      tasksCount: teamTasks.length,
      completionRate
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-muted-foreground" />
            Departments & Teams
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of the team divisions, member allocations, and workload indicators.
          </p>
        </div>

        <Button className="h-9 text-xs w-fit shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add New Division
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const teamMems = getTeamMembers(team.id)
          const stats = getTeamStats(team.id)

          return (
            <Card key={team.id} className="border-border hover:shadow-md transition flex flex-col justify-between select-none">
              <div>
                <CardHeader className="flex flex-row justify-between items-start border-b px-5 py-4 shrink-0">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-semibold text-foreground">{team.name}</CardTitle>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{team.id}</span>
                  </div>
                  <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Grid Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Projects Owned</span>
                      <div className="text-sm font-semibold text-foreground">{stats.projectsCount} Projects</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Assigned Tasks</span>
                      <div className="text-sm font-semibold text-foreground">{stats.tasksCount} Issues</div>
                    </div>
                  </div>

                  {/* Members list */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Allocated Members</span>
                    <div className="space-y-2">
                      {teamMems.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-xs hover:bg-muted/40 p-1 rounded transition">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border shrink-0">
                              <AvatarFallback className="text-[8px] font-bold bg-muted text-foreground">
                                {m.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{m.name}</p>
                              <p className="text-[9px] text-muted-foreground">{m.role}</p>
                            </div>
                          </div>

                          <span className={`h-1.5 w-1.5 rounded-full ${
                            m.presence === 'online' ? 'bg-emerald-500' : m.presence === 'away' ? 'bg-amber-500' : 'bg-muted-foreground/30'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Progress bar at bottom */}
              <div className="p-5 border-t bg-muted/10 shrink-0">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span>Team Issue Velocity</span>
                    <span>{stats.completionRate}% Done</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-1.5" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

    </div>
  )
}
