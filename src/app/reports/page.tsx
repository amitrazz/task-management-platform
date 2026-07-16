'use client'

import React, { useMemo } from 'react'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  HeartPulse
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { ContributionHeatmap } from '@/components/ui/ContributionHeatmap'

export default function ReportsPage() {
  const { tasks, projects, members } = useTrackoStore()

  // Calculate metrics
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const completionPercentage = tasks.length > 0 
    ? Math.round((doneTasks.length / tasks.length) * 100) 
    : 0

  // 1. Sprint Velocity Data (Mock + Real weights)
  const velocityData = [
    { name: 'Sprint 10', Completed: 14, Planned: 15 },
    { name: 'Sprint 11', Completed: 18, Planned: 18 },
    { name: 'Sprint 12 (Active)', Completed: doneTasks.filter(t => t.sprintId === 'SPR-12').length, Planned: tasks.filter(t => t.sprintId === 'SPR-12').length }
  ]

  // 2. Tasks per Status
  const statusCounts = { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 }
  tasks.forEach((t) => {
    if (statusCounts[t.status] !== undefined) statusCounts[t.status]++
  })

  const statusChartData = [
    { name: 'Backlog', value: statusCounts.backlog, color: 'var(--chart-1)' },
    { name: 'Todo', value: statusCounts.todo, color: 'var(--chart-2)' },
    { name: 'In Progress', value: statusCounts.in_progress, color: 'var(--chart-3)' },
    { name: 'In Review', value: statusCounts.review, color: 'var(--chart-4)' },
    { name: 'Done', value: statusCounts.done, color: 'var(--chart-5)' }
  ].filter(d => d.value > 0)

  // 3. Workload per Assignee (Stacked Bar)
  const assigneeWorkloadData = useMemo(() => {
    return members.map((m) => {
      const userTasks = tasks.filter((t) => t.assigneeId === m.id)
      const doneCount = userTasks.filter((t) => t.status === 'done').length
      const pendingCount = userTasks.length - doneCount

      return {
        name: m.name.split(' ')[0],
        Completed: doneCount,
        Pending: pendingCount
      }
    })
  }, [tasks, members])

  // 4. Sprint Burndown Chart
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

  // Calculate project health
  const projectHealth = useMemo(() => {
    if (projects.length === 0) return 100
    const totalProgress = projects.reduce((acc, p) => acc + p.progress, 0)
    return Math.round(totalProgress / projects.length)
  }, [projects])

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
            Performance & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze workspace throughput, sprint velocities, and burn-down performance.
          </p>
        </div>
      </div>

      {/* Top statistics indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Task completion rate */}
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Task Completion Rate</span>
              <div className="text-lg font-bold text-foreground">{completionPercentage}%</div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Velocity */}
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Avg Velocity Index</span>
              <div className="text-lg font-bold text-foreground">16.3 tasks</div>
            </div>
          </CardContent>
        </Card>

        {/* Project Health */}
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Project Health Index</span>
              <div className="text-lg font-bold text-foreground">{projectHealth}%</div>
            </div>
          </CardContent>
        </Card>

        {/* Active sprint workload */}
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Time Logged (Sprint)</span>
              <div className="text-lg font-bold text-foreground">15.8 hrs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Heatmap Widget */}
      <ContributionHeatmap />

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sprint Velocity Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Sprint Velocity (Completed vs Planned)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Planned" fill="var(--border)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sprint Burndown chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Sprint Burndown Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="remaining" stroke="var(--chart-3)" strokeWidth={2.5} name="Actual remaining" />
                <Line type="monotone" dataKey="ideal" stroke="var(--border)" strokeDasharray="4 4" strokeWidth={1.5} name="Ideal guideline" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workload stacked bar chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Assignee Workload Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeWorkloadData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Completed" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pending" stackId="a" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks status distribution donut chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tasks per Status Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] flex items-center justify-center p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
