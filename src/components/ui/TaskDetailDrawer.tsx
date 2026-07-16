'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  X,
  CheckSquare,
  Square,
  Plus,
  Clock,
  Link as LinkIcon,
  Send,
  AlertCircle,
  TrendingUp,
  User as UserIcon,
  Calendar as CalendarIcon,
  Layers
} from 'lucide-react'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function TaskDetailDrawer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const taskId = searchParams.get('task')

  const {
    tasks,
    members,
    sprints,
    projects,
    updateTask,
    addComment,
    addReaction,
    toggleSubtask,
    addSubtask,
    addDependency,
    activities,
    deleteTask
  } = useTrackoStore()

  const [newCommentText, setNewCommentText] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [descText, setDescText] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleText, setTitleText] = useState('')
  const [newDepTaskId, setNewDepTaskId] = useState('')
  const [depType, setDepType] = useState<'blocks' | 'blocked_by'>('blocks')

  const task = tasks.find((t) => t.id === taskId)

  useEffect(() => {
    if (task) {
      setDescText(task.description)
      setTitleText(task.title)
    }
  }, [task, taskId])

  if (!taskId || !task) {
    return null
  }

  const project = projects.find((p) => p.id === task.projectId)
  const taskActivities = activities.filter((act) => act.taskId === task.id)

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('task')
    const queryStr = params.toString()
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname)
  }

  const handleSaveDescription = () => {
    updateTask(task.id, { description: descText })
    setIsEditingDesc(false)
  }

  const handleSaveTitle = () => {
    if (titleText.trim()) {
      updateTask(task.id, { title: titleText })
      setIsEditingTitle(false)
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCommentText.trim()) {
      addComment(task.id, newCommentText.trim())
      setNewCommentText('')
    }
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim())
      setNewSubtaskTitle('')
    }
  }

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDepTaskId && newDepTaskId !== task.id) {
      addDependency(task.id, newDepTaskId, depType)
      setNewDepTaskId('')
    }
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'high':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20'
      case 'medium':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20'
      case 'low':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'done':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20'
      case 'review':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
      case 'in_progress':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20'
      case 'todo':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-xs"
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-4xl h-full bg-card border-l border-border relative z-10 flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex h-14 items-center justify-between border-b px-6 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
              {project?.name} / {task.id}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drawer Body - Split Layout */}
        <div className="flex-1 flex overflow-hidden divide-x divide-border flex-col md:flex-row">
          
          {/* Left Column: Content, Subtasks, Activity, Comments */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* Title Section */}
            <div className="space-y-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="flex-1 text-xl font-bold bg-muted border px-3 py-1.5 rounded-lg outline-none text-foreground"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveTitle}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setTitleText(task.title); setIsEditingTitle(false) }}>Cancel</Button>
                </div>
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xl font-bold tracking-tight hover:bg-muted/50 px-2 py-1 -ml-2 rounded-lg cursor-text transition-all duration-150 text-foreground"
                >
                  {task.title}
                </h1>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</h3>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={descText}
                    onChange={(e) => setDescText(e.target.value)}
                    rows={4}
                    className="w-full text-sm bg-muted border p-3 rounded-lg outline-none resize-y text-foreground"
                    placeholder="Describe this issue..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveDescription}>Save changes</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setDescText(task.description); setIsEditingDesc(false) }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="text-sm leading-relaxed text-foreground/80 hover:bg-muted/50 p-3 -ml-3 rounded-lg cursor-text transition-all duration-150 whitespace-pre-wrap min-h-[60px]"
                >
                  {task.description || <span className="italic text-muted-foreground/60">No description provided. Click to add details.</span>}
                </div>
              )}
            </div>

            {/* Subtasks Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="h-3.5 w-3.5" /> Subtasks
              </h3>
              
              <div className="space-y-1.5">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-all duration-100 text-sm"
                  >
                    {sub.done ? (
                      <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={sub.done ? 'line-through text-muted-foreground' : 'text-foreground'}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtask} className="flex gap-2 max-w-md pt-1">
                <input
                  type="text"
                  placeholder="Add a checklist subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 text-xs bg-muted/60 border px-3 py-1.5 rounded-lg outline-none text-foreground placeholder:text-muted-foreground"
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 py-0">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </form>
            </div>

            {/* Comments & Discussion Panel */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Discussion</h3>
              
              {/* Comment input form */}
              <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                <Avatar className="h-8 w-8 border shrink-0">
                  <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                    AR
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Type a message or press enter..."
                    className="w-full bg-transparent text-sm p-3 outline-none resize-none text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex justify-between items-center px-3 py-1.5 border-t bg-muted/40 shrink-0">
                    <span className="text-[10px] text-muted-foreground">Support comment text formatting</span>
                    <Button type="submit" size="sm" className="h-7 px-3.5">
                      <Send className="h-3 w-3 mr-1" /> Comment
                    </Button>
                  </div>
                </div>
              </form>

              {/* List comments */}
              <div className="space-y-4 pt-2">
                {task.comments.map((comment) => {
                  const commentUser = members.find((m) => m.id === comment.userId)
                  const formattedTime = new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  
                  return (
                    <div key={comment.id} className="flex gap-3 text-sm">
                      <Avatar className="h-8 w-8 border shrink-0">
                        <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                          {commentUser?.avatar || 'US'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground">{commentUser?.name}</span>
                          <span className="text-[10px] text-muted-foreground">{formattedTime}</span>
                        </div>
                        <div className="bg-muted/40 dark:bg-muted/20 border rounded-xl p-3 text-foreground/80 leading-relaxed text-sm">
                          {comment.content}
                        </div>
                        
                        {/* Reactions row */}
                        <div className="flex items-center gap-1.5 pt-1.5">
                          <button
                            type="button"
                            onClick={() => addReaction(task.id, comment.id, '👍')}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full border bg-muted/20 text-xs hover:bg-muted text-muted-foreground transition"
                          >
                            <span>👍</span>
                            {comment.reactions.find((r) => r.emoji === '👍')?.count || 0}
                          </button>
                          <button
                            type="button"
                            onClick={() => addReaction(task.id, comment.id, '🎉')}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full border bg-muted/20 text-xs hover:bg-muted text-muted-foreground transition"
                          >
                            <span>🎉</span>
                            {comment.reactions.find((r) => r.emoji === '🎉')?.count || 0}
                          </button>
                          <button
                            type="button"
                            onClick={() => addReaction(task.id, comment.id, '❤️')}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full border bg-muted/20 text-xs hover:bg-muted text-muted-foreground transition"
                          >
                            <span>❤️</span>
                            {comment.reactions.find((r) => r.emoji === '❤️')?.count || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activity History Timeline */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Activity History</h3>
              <div className="relative border-l border-border pl-4 ml-2 space-y-3">
                {taskActivities.map((act) => {
                  const formattedActTime = new Date(act.time).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  
                  return (
                    <div key={act.id} className="relative text-xs">
                      <span className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full border bg-background border-muted-foreground" />
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{act.message}</span>
                        <span className="text-[9px] shrink-0">{formattedActTime}</span>
                      </div>
                    </div>
                  )
                })}
                {taskActivities.length === 0 && (
                  <p className="text-xs text-muted-foreground italic pl-2">No activity logged for this task yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Parameters and Properties */}
          <div className="w-full md:w-80 overflow-y-auto p-6 bg-muted/10 space-y-5 shrink-0 select-none scrollbar-thin">
            
            {/* Standard parameter grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Properties</h3>
              
              {/* Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" /> Status
                </span>
                <select
                  value={task.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateTask(task.id, { status: e.target.value as 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' })}
                  className="bg-background border rounded-md text-xs px-2.5 py-1 text-foreground font-semibold outline-none border-border"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" /> Priority
                </span>
                <select
                  value={task.priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateTask(task.id, { priority: e.target.value as 'none' | 'low' | 'medium' | 'high' | 'urgent' })}
                  className="bg-background border rounded-md text-xs px-2.5 py-1 text-foreground font-semibold outline-none border-border"
                >
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5" /> Assignee
                </span>
                <select
                  value={task.assigneeId || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateTask(task.id, { assigneeId: e.target.value || null })}
                  className="bg-background border rounded-md text-xs px-2.5 py-1 text-foreground outline-none border-border"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5" /> Reporter
                </span>
                <select
                  value={task.reporterId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateTask(task.id, { reporterId: e.target.value })}
                  className="bg-background border rounded-md text-xs px-2.5 py-1 text-foreground outline-none border-border"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sprint */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" /> Sprint
                </span>
                <select
                  value={task.sprintId || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateTask(task.id, { sprintId: e.target.value || null })}
                  className="bg-background border rounded-md text-xs px-2.5 py-1 text-foreground outline-none border-border"
                >
                  <option value="">No Sprint</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" /> Due Date
                </span>
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTask(task.id, { dueDate: e.target.value || null })}
                  className="bg-background border rounded-md text-xs px-2 py-1 text-foreground outline-none border-border"
                />
              </div>

              {/* Time Tracking */}
              <div className="space-y-2 pt-2 border-t">
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5" /> Time Logged
                </span>
                
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Estimated</span>
                    <div className="flex items-center gap-1 bg-background border px-2 py-1 rounded border-border">
                      <input
                        type="number"
                        className="bg-transparent text-xs outline-none w-full text-foreground"
                        value={Math.round(task.timeLogged.timeEstimatedMinutes / 60)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0)
                          updateTask(task.id, {
                            timeLogged: { ...task.timeLogged, timeEstimatedMinutes: val * 60 },
                          })
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground">hrs</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Logged</span>
                    <div className="flex items-center gap-1 bg-background border px-2 py-1 rounded border-border">
                      <input
                        type="number"
                        className="bg-transparent text-xs outline-none w-full text-foreground"
                        value={Math.round(task.timeLogged.timeSpentMinutes / 60)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0)
                          updateTask(task.id, {
                            timeLogged: { ...task.timeLogged, timeSpentMinutes: val * 60 },
                          })
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground">hrs</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {task.timeLogged.timeEstimatedMinutes > 0 && (
                  <div className="space-y-1">
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (task.timeLogged.timeSpentMinutes / task.timeLogged.timeEstimatedMinutes) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {Math.round(
                          (task.timeLogged.timeSpentMinutes / task.timeLogged.timeEstimatedMinutes) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dependencies section */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5" /> Dependencies
              </h3>
              
              <div className="space-y-1.5">
                {task.dependencies.map((dep, idx) => {
                  const depTask = tasks.find((t) => t.id === dep.id)
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs border rounded p-2 bg-background">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-primary">{dep.id}</span>
                        <span className="text-[10px] text-muted-foreground">({dep.type.replace('_', ' ')})</span>
                      </div>
                      <span className="truncate max-w-[120px] font-medium text-foreground">{depTask?.title}</span>
                    </div>
                  )
                })}
              </div>

              <form onSubmit={handleAddDependency} className="space-y-1.5 pt-1">
                <div className="flex gap-2">
                  <select
                    value={depType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepType(e.target.value as 'blocks' | 'blocked_by')}
                    className="bg-background border rounded text-[11px] p-1 outline-none text-foreground"
                  >
                    <option value="blocks">Blocks</option>
                    <option value="blocked_by">Blocked By</option>
                  </select>

                  <select
                    value={newDepTaskId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDepTaskId(e.target.value)}
                    className="flex-1 bg-background border rounded text-[11px] p-1 outline-none text-foreground"
                  >
                    <option value="">Select Task...</option>
                    {tasks
                      .filter((t) => t.id !== task.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.id}: {t.title.substring(0, 20)}...
                        </option>
                      ))}
                  </select>
                </div>
                <Button type="submit" size="sm" variant="outline" className="w-full h-8 text-xs">
                  Link Dependency
                </Button>
              </form>
            </div>
            
            {/* Delete issue button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(task.id)
                    handleClose()
                  }
                }}
              >
                Delete Issue
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
