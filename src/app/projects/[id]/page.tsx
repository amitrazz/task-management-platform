'use client'

import React, { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrackoStore, Task } from '@/features/tracko/store/trackoStore'
import {
  LayoutGrid,
  List,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  Pin,
  Download,
  Send,
  ArrowLeft,
  Milestone
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ProjectDetailProps {
  params: Promise<{ id: string }>
}

type TabType = 'board' | 'list' | 'timeline' | 'roadmap' | 'members' | 'files' | 'discussion' | 'settings'

export default function ProjectDetailPage({ params }: ProjectDetailProps) {
  const router = useRouter()
  const { id: projectId } = use(params)
  
  const {
    projects,
    tasks,
    members,
    updateProject,
    togglePinProject,
    updateTask,
    epics
  } = useTrackoStore()

  const [activeTab, setActiveTab] = useState<TabType>('board')
  const [discussionText, setDiscussionText] = useState('')
  const [discussionBoard, setDiscussionBoard] = useState<Array<{ name: string; msg: string; date: string }>>([
    { name: 'Sarah Chen', msg: 'Started drafting layout designs. Let me know what you think of the sidebar density.', date: '2 hours ago' },
    { name: 'John Miller', msg: 'Zustand store is fully initialized. Webhook endpoints are ready for testing.', date: '1 day ago' }
  ])

  // Project Settings form state
  const project = projects.find((p) => p.id === projectId)
  const [projName, setProjName] = useState(project?.name || '')
  const [projDesc, setProjDesc] = useState(project?.description || '')
  const [projCat, setProjCat] = useState(project?.category || '')
  const [draggedOverCol, setDraggedOverCol] = useState<Task['status'] | null>(null)

  if (!project) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground space-y-4">
        <p>Project not found or was deleted.</p>
        <Button size="sm" variant="outline" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>
    )
  }

  // Filter tasks in this project
  const projectTasks = tasks.filter((t) => t.projectId === projectId)

  // Kanban lanes definition
  const columns: { label: string; status: Task['status'] }[] = [
    { label: 'Backlog', status: 'backlog' },
    { label: 'Todo', status: 'todo' },
    { label: 'In Progress', status: 'in_progress' },
    { label: 'In Review', status: 'review' },
    { label: 'Done', status: 'done' }
  ]

  // Native HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, colStatus: Task['status']) => {
    e.preventDefault()
    if (draggedOverCol !== colStatus) {
      setDraggedOverCol(colStatus)
    }
  }

  const handleDragLeave = () => {
    setDraggedOverCol(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault()
    setDraggedOverCol(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      updateTask(taskId, { status: targetStatus })
    }
  }

  const handleOpenTask = (id: string) => {
    router.push(`${window.location.pathname}?task=${id}`)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (projName.trim() && projDesc.trim()) {
      updateProject(project.id, {
        name: projName.trim(),
        description: projDesc.trim(),
        category: projCat
      })
      alert('Project settings updated!')
    }
  }

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault()
    if (discussionText.trim()) {
      setDiscussionBoard([
        {
          name: 'Amit Razz',
          msg: discussionText.trim(),
          date: 'Just now'
        },
        ...discussionBoard
      ])
      setDiscussionText('')
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'high': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  // Render project tabs menu
  const tabs = [
    { id: 'board', label: 'Kanban Board', icon: LayoutGrid },
    { id: 'list', label: 'List View', icon: List },
    { id: 'timeline', label: 'Timeline View', icon: Calendar },
    { id: 'roadmap', label: 'Roadmap & Epics', icon: Milestone },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'files', label: 'Files & Assets', icon: FileText },
    { id: 'discussion', label: 'Discussions', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ]

  return (
    <div className="space-y-6">
      
      {/* Back to projects & Hero Section */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Projects registry
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <button
                onClick={() => togglePinProject(project.id)}
                className={`h-6 w-6 rounded-full flex items-center justify-center border hover:bg-muted transition-all cursor-pointer ${
                  project.isPinned ? 'text-primary bg-primary/10 border-primary/20' : 'text-muted-foreground border-border'
                }`}
              >
                <Pin className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          </div>

          <div className="flex gap-4 shrink-0 bg-muted/20 border p-3 rounded-lg text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Progress</span>
              <div className="font-semibold text-sm text-foreground">{project.progress}%</div>
            </div>
            <span className="border-r" />
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Category</span>
              <div className="font-semibold text-sm text-foreground">{project.category}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list menu */}
      <div className="flex items-center border-b space-x-1 overflow-x-auto scrollbar-none shrink-0 select-none pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TABS CONTAINER */}
      <div>
        
        {/* TAB 1: KANBAN BOARD */}
        {activeTab === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[calc(100vh-280px)] min-h-[400px]">
            {columns.map((col) => {
              const colTasks = projectTasks.filter((t) => t.status === col.status)
              
              return (
                <div
                  key={col.status}
                  onDragOver={(e) => handleDragOver(e, col.status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.status)}
                  className={`flex flex-col rounded-xl p-3 h-full overflow-hidden transition-all duration-200 border ${
                    draggedOverCol === col.status
                      ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-xs'
                      : 'bg-muted/20 border-border/80'
                  }`}
                >
                  {/* Column header */}
                  <div className="flex justify-between items-center mb-3 shrink-0">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks items container */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-none pr-1">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => handleOpenTask(t.id)}
                        className="bg-card border border-border hover:border-primary/40 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-xs transition-all duration-150 space-y-3 relative group"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[9px] font-bold font-mono px-1 rounded bg-muted text-muted-foreground border">
                              {t.id}
                            </span>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full border ${getPriorityBadgeColor(t.priority)}`}>
                              {t.priority}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 pt-0.5 group-hover:underline">
                            {t.title}
                          </h4>
                        </div>

                        {t.dueDate && (
                          <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{t.dueDate}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    <AnimatePresence>
                      {draggedOverCol === col.status && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: 5 }}
                          animate={{ opacity: 1, height: 60, y: 0 }}
                          exit={{ opacity: 0, height: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="border border-dashed border-primary/30 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] text-primary/60 font-bold tracking-wider uppercase select-none overflow-hidden shrink-0"
                        >
                          Drop issue here
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {colTasks.length === 0 && draggedOverCol !== col.status && (
                      <div className="h-24 border border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground/60 italic p-4 text-center">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 2: LIST VIEW */}
        {activeTab === 'list' && (
          <Card className="border-border">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px] select-none">
                <thead>
                  <tr className="border-b bg-muted/40 font-bold text-muted-foreground">
                    <th className="px-6 py-3">Task ID</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectTasks.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => handleOpenTask(t.id)}
                      className="hover:bg-muted/40 cursor-pointer transition"
                    >
                      <td className="px-6 py-3 font-mono font-bold text-primary">{t.id}</td>
                      <td className="px-6 py-3 font-medium text-foreground truncate max-w-[200px]">{t.title}</td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border rounded-full ${
                          t.status === 'done' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border rounded-full ${getPriorityBadgeColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{t.dueDate || 'No Date'}</td>
                    </tr>
                  ))}
                  {projectTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No tasks inside this project hub.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: TIMELINE GANTT */}
        {activeTab === 'timeline' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Project Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {projectTasks.map((t) => {
                  const percentOffset = Math.floor(Math.random() * 30) // Mock layout offsets
                  const percentWidth = Math.floor(40 + Math.random() * 30)
                  
                  return (
                    <div key={t.id} className="grid grid-cols-12 items-center gap-4 text-xs">
                      <div className="col-span-3 font-medium truncate text-foreground flex items-center gap-1.5">
                        <span className="font-mono font-bold text-muted-foreground text-[10px]">{t.id}</span>
                        <span className="truncate">{t.title}</span>
                      </div>
                      
                      <div className="col-span-9 relative h-6 bg-muted/40 rounded-lg overflow-hidden border">
                        <div
                          className="absolute h-full bg-primary/20 border-l border-r border-primary flex items-center px-2 text-[9px] font-bold text-primary truncate"
                          style={{ left: `${percentOffset}%`, width: `${percentWidth}%` }}
                        >
                          {t.dueDate || 'Sprint Span'}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {projectTasks.length === 0 && (
                  <p className="text-center py-8 text-sm text-muted-foreground">Add project tasks to populate timeline tracks.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: ROADMAP & EPICS */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6 animate-fade-in">
            {epics.filter((epic) => epic.projectId === project.id).map((epic) => {
              const epicTasks = projectTasks.filter((t) => t.epicId === epic.id || (epic.id === 'EPC-1' && t.id === 'TRK-101') || (epic.id === 'EPC-2' && t.id === 'TRK-102'))
              const completedTasks = epicTasks.filter((t) => t.status === 'done')
              const epicProgress = epicTasks.length > 0 ? Math.round((completedTasks.length / epicTasks.length) * 100) : epic.progress
              
              const hasUrgentBlocked = epicTasks.some(t => t.priority === 'urgent' && t.status !== 'done')
              const riskStatus = hasUrgentBlocked ? 'At Risk' : epicProgress > 50 ? 'On Track' : 'Needs Review'
              const healthScore = epicTasks.length > 0 ? Math.round((completedTasks.length / epicTasks.length) * 100) : 100

              return (
                <Card key={epic.id} className="border-border overflow-hidden bg-card text-card-foreground">
                  <div className="border-b border-border/60 bg-muted/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest font-mono">{epic.id}</span>
                        <h3 className="text-sm font-semibold text-foreground">{epic.title}</h3>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                          riskStatus === 'On Track' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          riskStatus === 'At Risk' ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {riskStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{epic.description}</p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="space-y-1 text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Health Score</span>
                        <div className="text-xs font-semibold text-foreground">{healthScore}%</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Progress</span>
                        <div className="text-xs font-semibold text-foreground">{epicProgress}%</div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${epicProgress}%` }} />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Associated Issues</h4>
                      <div className="space-y-1.5">
                        {epicTasks.map((t) => (
                          <div key={t.id} className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-muted-foreground text-[10px] font-bold">{t.id}</span>
                              <span className="text-foreground font-medium truncate max-w-[280px] md:max-w-md">{t.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${getPriorityBadgeColor(t.priority)}`}>
                                {t.priority}
                              </span>
                              <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">
                                {t.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                        {epicTasks.length === 0 && (
                          <p className="text-xs text-muted-foreground py-2 italic">No issues currently linked to this epic track.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {epics.filter((e) => e.projectId === project.id).length === 0 && (
              <p className="text-center py-8 text-sm text-muted-foreground">No epic milestones registered for this project.</p>
            )}
          </div>
        )}

        {/* TAB 5: MEMBERS */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {members.map((m) => (
              <Card key={m.id} className="border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full border bg-muted flex items-center justify-center font-bold text-foreground">
                    {m.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{m.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{m.role}</p>
                    <span className="text-[9px] text-emerald-500 font-semibold">{m.presence}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 5: FILES */}
        {activeTab === 'files' && (
          <Card className="border-border">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b bg-muted/40 font-bold text-muted-foreground">
                    <th className="px-6 py-3">Filename</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3">Uploaded</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30">
                    <td className="px-6 py-3.5 font-medium text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      stripe_endpoint_wireframes.fig
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">24.5 MB</td>
                    <td className="px-6 py-3.5 text-muted-foreground">Jul 12, 2026</td>
                    <td className="px-6 py-3.5 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-6 py-3.5 font-medium text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      api_specification.yaml
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">142 KB</td>
                    <td className="px-6 py-3.5 text-muted-foreground">Jul 10, 2026</td>
                    <td className="px-6 py-3.5 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* TAB 6: DISCUSSIONS */}
        {activeTab === 'discussion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <form onSubmit={handlePostDiscussion} className="flex gap-3 items-start border p-4 rounded-xl bg-card">
                <div className="h-8 w-8 rounded-full border bg-muted flex items-center justify-center font-bold text-xs shrink-0 text-foreground">
                  AR
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    value={discussionText}
                    onChange={(e) => setDiscussionText(e.target.value)}
                    placeholder="Broadcast an update to the project channel..."
                    className="w-full bg-transparent text-sm outline-none resize-none text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex justify-end border-t pt-2 shrink-0">
                    <Button type="submit" size="sm">
                      <Send className="h-3 w-3 mr-1.5" /> Post Update
                    </Button>
                  </div>
                </div>
              </form>

              <div className="space-y-4 pt-2">
                {discussionBoard.map((disc, idx) => (
                  <Card key={idx} className="border-border">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{disc.name}</span>
                        <span className="text-muted-foreground">{disc.date}</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{disc.msg}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border-border h-fit">
              <CardHeader>
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Channel Members</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border px-4 pb-4">
                  {members.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center gap-2.5 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="font-medium text-foreground">{m.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <Card className="border-border max-w-xl">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="text-sm font-semibold text-foreground">Project Details Settings</CardTitle>
            </CardHeader>
            <form onSubmit={handleSaveSettings}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="projNameEdit">Project Name</Label>
                  <input
                    id="projNameEdit"
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="projDescEdit">Project Description</Label>
                  <textarea
                    id="projDescEdit"
                    required
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-muted/40 border text-sm p-3 rounded-lg outline-none resize-none text-foreground border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="projCatEdit">Category / Domain</Label>
                  <select
                    id="projCatEdit"
                    value={projCat}
                    onChange={(e) => setProjCat(e.target.value)}
                    className="w-full bg-background border rounded-lg text-xs px-3 py-2 text-foreground outline-none border-border"
                  >
                    <option value="Core Engineering">Core Engineering</option>
                    <option value="Design System">Design System</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="pt-2 border-t flex justify-end gap-2 mt-4">
                  <Button type="submit" size="sm">Save Configuration</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

      </div>
    </div>
  )
}
