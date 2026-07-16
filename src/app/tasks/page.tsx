'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTrackoStore, Task } from '@/features/tracko/store/trackoStore'
import {
  Plus,
  Search,
  Trash2,
  ArrowUpDown,
  X,
  FileSpreadsheet
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 }

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createParam = searchParams.get('create')
  
  const {
    tasks,
    projects,
    members,
    sprints,
    addTask,
    updateTask,
    deleteTask
  } = useTrackoStore()

  // Local state for filters, search, and page layout
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProj, setSelectedProj] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')

  // Sorting
  const [sortField, setSortField] = useState<'id' | 'title' | 'dueDate' | 'priority'>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Row selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Creator Modal state
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newProjId, setNewProjId] = useState(projects[0]?.id || '')
  const [newStatus, setNewStatus] = useState<Task['status']>('todo')
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium')
  const [newAssigneeId, setNewAssigneeId] = useState<string>('')
  const [newDueDate, setNewDueDate] = useState<string>('')

  // Watch URL params to open task creator
  useEffect(() => {
    if (createParam === 'true') {
      setIsCreatorOpen(true)
    }
  }, [createParam])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchProj = selectedProj === 'all' || t.projectId === selectedProj
      const matchStatus = selectedStatus === 'all' || t.status === selectedStatus
      const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority
      const matchAssignee =
        selectedAssignee === 'all' ||
        (selectedAssignee === 'unassigned' && !t.assigneeId) ||
        t.assigneeId === selectedAssignee

      return matchSearch && matchProj && matchStatus && matchPriority && matchAssignee
    })
  }, [tasks, searchQuery, selectedProj, selectedStatus, selectedPriority, selectedAssignee])

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0
      
      if (sortField === 'priority') {
        comparison = priorityWeight[a.priority] - priorityWeight[b.priority]
      } else if (sortField === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
        comparison = dateA - dateB
      } else {
        comparison = a[sortField]?.localeCompare(b[sortField] || '') || 0
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredTasks, sortField, sortDirection])

  // Paginated tasks
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedTasks.slice(startIndex, startIndex + pageSize)
  }, [sortedTasks, currentPage, pageSize])

  const totalPages = Math.ceil(sortedTasks.length / pageSize)

  // Reset page when filters modify count
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedProj, selectedStatus, selectedPriority, selectedAssignee, pageSize])

  // Bulk Actions
  const handleToggleSelectRow = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  const handleToggleSelectAll = () => {
    const paginatedIds = paginatedTasks.map((t) => t.id)
    const allChecked = paginatedIds.every((id) => selectedTaskIds.includes(id))

    if (allChecked) {
      setSelectedTaskIds((prev) => prev.filter((id) => !paginatedIds.includes(id)))
    } else {
      setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...paginatedIds])))
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) {
      selectedTaskIds.forEach((id) => deleteTask(id))
      setSelectedTaskIds([])
    }
  }

  const handleBulkStatusChange = (status: Task['status']) => {
    selectedTaskIds.forEach((id) => updateTask(id, { status }))
    setSelectedTaskIds([])
  }

  // Row selection state indicators
  const isAllChecked = paginatedTasks.length > 0 && paginatedTasks.every((t) => selectedTaskIds.includes(t.id))

  const handleRowClick = (taskId: string, e: React.MouseEvent) => {
    // Prevent drawer trigger on clicking checkbox or action button
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input') || target.closest('[role="checkbox"]')) {
      return
    }
    router.push(`${window.location.pathname}?task=${taskId}`)
  }

  // Handle task creator form submission
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTitle.trim()) {
      addTask({
        title: newTitle.trim(),
        description: newDesc.trim() || 'No description provided.',
        status: newStatus,
        priority: newPriority,
        assigneeId: newAssigneeId || null,
        reporterId: 'MEM-1',
        labels: ['Task'],
        sprintId: sprints.find((s) => s.status === 'active')?.id || null,
        dueDate: newDueDate || null,
        projectId: newProjId,
        timeLogged: { timeSpentMinutes: 0, timeEstimatedMinutes: 120 }
      })
      
      // Reset state and close modal
      setNewTitle('')
      setNewDesc('')
      setIsCreatorOpen(false)
      
      // Clean query param
      const params = new URLSearchParams(searchParams.toString())
      params.delete('create')
      router.push(`${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`)
    }
  }

  const handleCloseCreatorModal = () => {
    setIsCreatorOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('create')
    router.push(`${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`)
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'high': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20'
      case 'review': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
      case 'in_progress': return 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20'
      default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20'
    }
  }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
            Issues Cockpit
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            An interactive data grid to review, search, sort, filter, and bulk-modify workspace issues.
          </p>
        </div>

        <Button onClick={() => setIsCreatorOpen(true)} className="h-9 text-xs w-fit shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>

      {/* Grid Filters and Search Row */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Query search input */}
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-muted/20 w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search ID or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs outline-none text-foreground w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <span className="h-4 border-r hidden sm:block" />

          {/* Project filter */}
          <select
            value={selectedProj}
            onChange={(e) => setSelectedProj(e.target.value)}
            className="bg-background border rounded-lg text-xs px-2.5 py-1.5 text-foreground outline-none border-border"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-background border rounded-lg text-xs px-2.5 py-1.5 text-foreground outline-none border-border"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-background border rounded-lg text-xs px-2.5 py-1.5 text-foreground outline-none border-border"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Assignee filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-background border rounded-lg text-xs px-2.5 py-1.5 text-foreground outline-none border-border"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Clear filters trigger */}
        {(selectedProj !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedAssignee !== 'all' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedProj('all')
              setSelectedStatus('all')
              setSelectedPriority('all')
              setSelectedAssignee('all')
            }}
            className="text-xs h-8 text-muted-foreground"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* BULK ACTION PANEL (Only visible when items are selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span>{selectedTaskIds.length} tasks selected</span>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              onChange={(e) => handleBulkStatusChange(e.target.value as Task['status'])}
              defaultValue=""
              className="bg-background border rounded text-xs px-2 py-1 text-foreground outline-none border-border"
            >
              <option value="" disabled>Change Status...</option>
              <option value="backlog">Backlog</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Selected
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTaskIds([])}
              className="h-8 text-xs text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* DATA GRID TABLE */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px] border-collapse relative select-none">
            <thead>
              <tr className="border-b bg-muted/40 font-semibold text-muted-foreground sticky top-0 bg-card z-10">
                <th className="px-5 py-3.5 w-10">
                  <Checkbox checked={isAllChecked} onCheckedChange={handleToggleSelectAll} />
                </th>
                <th className="px-5 py-3.5 cursor-pointer hover:bg-muted/60 transition w-24" onClick={() => toggleSort('id')}>
                  <div className="flex items-center gap-1.5">
                    ID <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-5 py-3.5 cursor-pointer hover:bg-muted/60 transition w-96" onClick={() => toggleSort('title')}>
                  <div className="flex items-center gap-1.5">
                    Summary <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-5 py-3.5 w-40">Project</th>
                <th className="px-5 py-3.5 w-32">Status</th>
                <th className="px-5 py-3.5 cursor-pointer hover:bg-muted/60 transition w-32" onClick={() => toggleSort('priority')}>
                  <div className="flex items-center gap-1.5">
                    Priority <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-5 py-3.5 cursor-pointer hover:bg-muted/60 transition w-32" onClick={() => toggleSort('dueDate')}>
                  <div className="flex items-center gap-1.5">
                    Due Date <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-5 py-3.5 w-40">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId)
                const assignee = members.find((m) => m.id === t.assigneeId)
                const isChecked = selectedTaskIds.includes(t.id)

                return (
                  <tr
                    key={t.id}
                    onClick={(e) => handleRowClick(t.id, e)}
                    className={`hover:bg-muted/30 transition cursor-pointer ${
                      isChecked ? 'bg-primary/5 hover:bg-primary/10' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <Checkbox checked={isChecked} onCheckedChange={() => handleToggleSelectRow(t.id)} />
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">{t.id}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground truncate max-w-xs">{t.title}</td>
                    <td className="px-5 py-3.5 text-muted-foreground truncate max-w-[120px]">{project?.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityBadgeColor(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.dueDate || 'No Deadline'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {assignee ? (
                          <>
                            <div className="h-5 w-5 rounded-full border bg-muted flex items-center justify-center font-bold text-[8px] text-foreground shrink-0">
                              {assignee.avatar}
                            </div>
                            <span className="truncate max-w-[100px] text-foreground/80 font-medium">{assignee.name}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground/60 italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {paginatedTasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No active issues matching filter configuration.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 shrink-0 select-none">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedTasks.length)} of{' '}
            {sortedTasks.length} issues
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            
            <div className="text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* CREATE TASK DIALOG MODAL */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleCloseCreatorModal} />
          
          <Card className="w-full max-w-lg relative z-10 border-border">
            <CardHeader className="flex flex-row justify-between items-center border-b px-5 py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                Create New Workspace Issue
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCloseCreatorModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <form onSubmit={handleCreateTaskSubmit}>
              <CardContent className="p-5 space-y-4">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="newTitle">Task Summary</Label>
                  <input
                    id="newTitle"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Short summary (e.g. Build analytics endpoints)"
                    className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="newDesc">Description Details</Label>
                  <textarea
                    id="newDesc"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide reproduction steps or issue context..."
                    rows={3}
                    className="w-full bg-muted/40 border text-sm p-3 rounded-lg outline-none resize-none text-foreground border-border placeholder:text-muted-foreground"
                  />
                </div>

                {/* Properties Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newProj">Project Hub</Label>
                    <select
                      id="newProj"
                      value={newProjId}
                      onChange={(e) => setNewProjId(e.target.value)}
                      className="w-full bg-background border rounded-lg text-xs px-3 py-2 text-foreground outline-none border-border"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newAssignee">Assignee</Label>
                    <select
                      id="newAssignee"
                      value={newAssigneeId}
                      onChange={(e) => setNewAssigneeId(e.target.value)}
                      className="w-full bg-background border rounded-lg text-xs px-3 py-2 text-foreground outline-none border-border"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Properties Row 2 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="newStatus">Status</Label>
                    <select
                      id="newStatus"
                      value={newStatus}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStatus(e.target.value as Task['status'])}
                      className="w-full bg-background border rounded-lg text-xs px-2.5 py-2 text-foreground outline-none border-border"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPriority">Priority</Label>
                    <select
                      id="newPriority"
                      value={newPriority}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPriority(e.target.value as Task['priority'])}
                      className="w-full bg-background border rounded-lg text-xs px-2.5 py-2 text-foreground outline-none border-border"
                    >
                      <option value="none">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newDueDate">Due Date</Label>
                    <input
                      id="newDueDate"
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-background border rounded-lg text-xs px-2.5 py-1.5 text-foreground outline-none border-border"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                  <Button type="button" variant="ghost" size="sm" onClick={handleCloseCreatorModal}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Create Issue
                  </Button>
                </div>

              </CardContent>
            </form>
          </Card>
        </div>
      )}

    </div>
  )
}
