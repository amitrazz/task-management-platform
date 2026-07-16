'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import {
  Plus,
  Users,
  Activity as ActivityIcon,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const {
    tasks,
    projects,
    members,
    sprints,
    activities,
    currentUserId,
    addTask
  } = useTrackoStore()

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedProjId, setSelectedProjId] = useState(projects[0]?.id || '')

  const currentUser = members.find((m) => m.id === currentUserId)
  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0]

  // Filter tasks belonging to the active sprint
  const activeSprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id)
  const completedSprintTasks = activeSprintTasks.filter((t) => t.status === 'done')
  
  // Calculate completion percentage
  const sprintProgress = activeSprintTasks.length > 0 
    ? Math.round((completedSprintTasks.length / activeSprintTasks.length) * 100)
    : 0

  // Filter tasks assigned to current user (MEM-1)
  const myTasks = tasks.filter((t) => t.assigneeId === currentUserId)
  const pendingMyTasks = myTasks.filter((t) => t.status !== 'done')

  // Calculate statistics for charts
  // 1. Tasks by Status
  const statusCounts = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0
  }
  tasks.forEach((t) => {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++
    }
  })
  
  const statusChartData = [
    { name: 'Backlog', value: statusCounts.backlog, color: 'var(--chart-1)' },
    { name: 'Todo', value: statusCounts.todo, color: 'var(--chart-2)' },
    { name: 'In Progress', value: statusCounts.in_progress, color: 'var(--chart-3)' },
    { name: 'Review', value: statusCounts.review, color: 'var(--chart-4)' },
    { name: 'Done', value: statusCounts.done, color: 'var(--chart-5)' }
  ].filter(d => d.value > 0)

  // 2. Sprint Burndown Mock Data
  const burndownData = [
    { day: 'Day 1', remaining: 12, ideal: 12 },
    { day: 'Day 3', remaining: 10, ideal: 9.6 },
    { day: 'Day 5', remaining: 8, ideal: 8 },
    { day: 'Day 7', remaining: 7, ideal: 6.4 },
    { day: 'Day 9', remaining: 5, ideal: 4.8 },
    { day: 'Day 11', remaining: 3, ideal: 3.2 },
    { day: 'Day 13', remaining: 2, ideal: 1.6 },
    { day: 'Day 14', remaining: 0, ideal: 0 }
  ]

  // 3. Workload per Assignee
  const workloadData = members.map((m) => {
    const count = tasks.filter((t) => t.assigneeId === m.id).length
    return {
      name: m.name.split(' ')[0],
      Tasks: count
    }
  })

  // Quick Action: Create Quick Task
  const handleQuickCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim() && selectedProjId) {
      addTask({
        title: newTaskTitle.trim(),
        description: 'Created quickly from dashboard cockpit.',
        status: 'todo',
        priority: 'medium',
        assigneeId: currentUserId,
        reporterId: currentUserId,
        labels: ['Quick Task'],
        sprintId: activeSprint.id,
        dueDate: null,
        projectId: selectedProjId,
        timeLogged: { timeSpentMinutes: 0, timeEstimatedMinutes: 60 }
      })
      setNewTaskTitle('')
    }
  }

  const handleOpenTask = (id: string) => {
    router.push(`${window.location.pathname}?task=${id}`)
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'high': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Welcome back, {currentUser?.name} <Sparkles className="h-5 w-5 text-yellow-500" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here is a summary of the active sprint and your assigned workload for today.
          </p>
        </div>

        {/* Date / Time summary */}
        <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-muted/20 text-xs text-muted-foreground w-fit shrink-0">
          <Calendar className="h-3.5 w-3.5" />
          <span>Sprint 12 ends in 8 days (July 24, 2026)</span>
        </div>
      </div>

      {/* Pinned Projects Row */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pinned Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.filter((p) => p.isPinned).map((proj) => (
            <Card key={proj.id} className="hover:shadow-md transition-shadow cursor-pointer border-border" onClick={() => router.push(`/projects/${proj.id}`)}>
              <CardContent className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <h3 className="font-semibold text-sm truncate text-foreground">{proj.name}</h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border bg-muted/40 font-medium">
                    {proj.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-semibold text-foreground">{proj.progress}%</span>
                  </div>
                  <Progress value={proj.progress} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Grid: Left column widgets, Right column widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Tasks & Activities (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* My Tasks Card */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b px-6 py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                My Pending Workload ({pendingMyTasks.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')} className="text-xs px-2.5">
                View all tasks <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {pendingMyTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-all cursor-pointer group"
                    onClick={() => handleOpenTask(t.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 border">
                        {t.id}
                      </span>
                      <span className="text-sm font-medium truncate text-foreground group-hover:underline">
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border rounded-full ${getPriorityBadgeColor(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {t.dueDate ? t.dueDate : 'No deadline'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {pendingMyTasks.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    All caught up! No pending tasks assigned.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Issue Creator */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Quick Action: Create Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickCreateTask} className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Task title (e.g. Implement webhook handlers)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-muted/40 border text-sm px-3.5 py-2 rounded-lg outline-none text-foreground placeholder:text-muted-foreground"
                />
                
                <select
                  value={selectedProjId}
                  onChange={(e) => setSelectedProjId(e.target.value)}
                  className="bg-background border rounded-lg text-xs px-3.5 py-2 text-foreground outline-none border-border"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <Button type="submit" className="h-9 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Create Issue
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Status Distribution Donut Chart */}
            <Card className="border-border">
              <CardHeader className="pb-0 px-5 pt-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Tasks per Status
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] flex items-center justify-center p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconSize={8} 
                      wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Workload distribution Bar Chart */}
            <Card className="border-border">
              <CardHeader className="pb-0 px-5 pt-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Workload Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="Tasks" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sprint Burndown Line Chart */}
            <Card className="col-span-1 md:col-span-2 border-border">
              <CardHeader className="pb-0 px-5 pt-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Active Sprint Burndown
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burndownData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="remaining" stroke="var(--chart-3)" strokeWidth={2.5} activeDot={{ r: 6 }} name="Actual remaining" />
                    <Line type="monotone" dataKey="ideal" stroke="var(--border)" strokeDasharray="4 4" strokeWidth={1.5} name="Ideal guideline" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Right Side: Sprint details, Team list, Activities feed (1/3 width) */}
        <div className="space-y-6">
          
          {/* Active Sprint overview card */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
                <span>Active Sprint Stats</span>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  Sprint 12
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Progress</span>
                  <div className="text-xl font-bold text-foreground">{sprintProgress}%</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Issues Completed</span>
                  <div className="text-xl font-bold text-foreground">
                    {completedSprintTasks.length} / {activeSprintTasks.length}
                  </div>
                </div>
              </div>
              <Progress value={sprintProgress} className="h-2" />
            </CardContent>
          </Card>

          {/* Team members panel */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b px-5 py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" />
                Team Presence ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border relative">
                        <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                          {m.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        m.presence === 'online' ? 'bg-emerald-500' : m.presence === 'away' ? 'bg-amber-500' : 'bg-muted-foreground/30'
                      }`} />
                      <span className="text-[10px] text-muted-foreground capitalize">{m.presence}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workspace Activity feed widget */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b px-5 py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                Workspace Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[300px] overflow-y-auto scrollbar-thin">
              <div className="relative border-l border-border pl-4 space-y-4">
                {activities.slice(0, 5).map((act) => {
                  const relativeTime = new Date(act.time).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  
                  return (
                    <div key={act.id} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full border bg-background border-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="text-foreground/90 font-medium leading-relaxed">{act.message}</p>
                        <span className="text-[9px] text-muted-foreground block">{relativeTime}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
    </div>
  )
}
