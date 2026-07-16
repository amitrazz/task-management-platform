'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

export type UserRole = 'viewer' | 'member' | 'admin' | 'owner'

export type WorkspaceAction = 
  | 'create_task'
  | 'update_task'
  | 'delete_task'
  | 'manage_settings'
  | 'manage_billing'
  | 'manage_keys'

export interface FeatureFlags {
  offlineSync: boolean
  liveSimulation: boolean
  velocityCharts: boolean
}

export interface Epic {
  id: string
  title: string
  description: string
  progress: number
  projectId: string
}

export interface QueuedAction {
  type: 'add_task' | 'update_task' | 'delete_task' | 'add_comment'
  payload: Record<string, unknown>
}

export interface ActionSnapshot {
  tasks: Task[]
  projects: Project[]
  activities: Activity[]
  notifications: Notification[]
}

export interface Member {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  presence: 'online' | 'offline' | 'away'
}

export interface Team {
  id: string
  name: string
  membersCount: number
}

export interface Project {
  id: string
  name: string
  description: string
  progress: number
  status: 'planning' | 'active' | 'completed' | 'paused'
  icon: string
  category: string
  teamId: string
  isPinned: boolean
}

export interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'past' | 'active' | 'upcoming'
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
  reactions: {
    emoji: string
    count: number
    users: string[]
  }[]
}

export interface Dependency {
  id: string // targets task.id
  type: 'blocks' | 'blocked_by'
}

export interface TimeLogged {
  timeSpentMinutes: number
  timeEstimatedMinutes: number
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  assigneeId: string | null
  reporterId: string
  labels: string[]
  sprintId: string | null
  dueDate: string | null
  subtasks: Subtask[]
  comments: Comment[]
  dependencies: Dependency[]
  timeLogged: TimeLogged
  projectId: string
  createdAt: string
  epicId?: string | null
}

export interface Activity {
  id: string
  type: 'task' | 'project' | 'comment' | 'sprint'
  message: string
  time: string
  userId: string
  taskId?: string
}

export interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: 'mention' | 'assignment' | 'status_change'
  isRead: boolean
  taskId?: string
}

export interface WorkspaceSettings {
  name: string
  url: string
  logo: string
  description: string
  billingPlan: 'Free' | 'Pro' | 'Enterprise'
  apiKeys: { key: string; name: string; createdAt: string; permissions: string }[]
  integrations: { id: string; name: string; enabled: boolean; description: string }[]
}

interface TrackoState {
  members: Member[]
  teams: Team[]
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  activities: Activity[]
  notifications: Notification[]
  workspace: WorkspaceSettings
  currentUserId: string

  // Staff+ State variables
  isOffline: boolean
  offlineQueue: QueuedAction[]
  undoStack: ActionSnapshot[]
  redoStack: ActionSnapshot[]
  currentUserRole: UserRole
  featureFlags: FeatureFlags
  epics: Epic[]

  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'subtasks' | 'dependencies'>) => Task
  updateTask: (id: string, updates: Partial<Task>, customUserId?: string) => void
  deleteTask: (id: string) => void
  addComment: (taskId: string, content: string, userId?: string) => void
  addReaction: (taskId: string, commentId: string, emoji: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  addSubtask: (taskId: string, title: string) => void
  addDependency: (taskId: string, targetId: string, type: 'blocks' | 'blocked_by') => void
  addProject: (project: Omit<Project, 'id' | 'progress'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  togglePinProject: (id: string) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  addActivity: (type: Activity['type'], message: string, taskId?: string) => void
  updateWorkspace: (updates: Partial<WorkspaceSettings>) => void
  generateApiKey: (name: string, permissions: string) => void
  revokeApiKey: (key: string) => void
  toggleIntegration: (id: string) => void
  resetStore: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => void

  // Staff+ Actions
  hasPermission: (action: WorkspaceAction) => boolean
  toggleNetworkStatus: () => void
  setUserRole: (role: UserRole) => void
  setFeatureFlag: (flag: keyof FeatureFlags, enabled: boolean) => void
  undo: () => void
  redo: () => void
  pushToUndo: () => void
}

// Initial Mock Data
const mockMembers: Member[] = [
  { id: 'MEM-1', name: 'Amit Razz', email: 'amit@tracko.com', avatar: 'AR', role: 'Frontend Architect', presence: 'online' },
  { id: 'MEM-2', name: 'Sarah Chen', email: 'sarah@tracko.com', avatar: 'SC', role: 'Lead Product Designer', presence: 'away' },
  { id: 'MEM-3', name: 'John Miller', email: 'john@tracko.com', avatar: 'JM', role: 'Backend Lead', presence: 'online' },
  { id: 'MEM-4', name: 'Emily Watson', email: 'emily@tracko.com', avatar: 'EW', role: 'QA Engineer', presence: 'offline' }
]

const mockTeams: Team[] = [
  { id: 'TEAM-1', name: 'Core Engineering', membersCount: 3 },
  { id: 'TEAM-2', name: 'Product & Design', membersCount: 2 },
  { id: 'TEAM-3', name: 'Growth & Marketing', membersCount: 1 }
]

const mockProjects: Project[] = [
  { id: 'PRJ-1', name: 'Linear Design Refactor', description: 'Introduce highly premium, clean styles with fluid interactions inspired by Linear app.', progress: 75, status: 'active', icon: 'Paintbrush', category: 'Design System', teamId: 'TEAM-2', isPinned: true },
  { id: 'PRJ-2', name: 'Mobile Companion App', description: 'Develop React Native iOS and Android shell for quick task creation and notifications.', progress: 32, status: 'active', icon: 'Smartphone', category: 'Core Engineering', teamId: 'TEAM-1', isPinned: false },
  { id: 'PRJ-3', name: 'Stripe Billing Bridge', description: 'Migrate enterprise clients to high-throughput recurring seat-based billing APIs.', progress: 95, status: 'active', icon: 'CreditCard', category: 'Core Engineering', teamId: 'TEAM-1', isPinned: true },
  { id: 'PRJ-4', name: 'Q3 Enterprise Campaign', description: 'Promotional landing pages and targeted email sequences showcasing SOC-2 compliance.', progress: 10, status: 'planning', icon: 'Megaphone', category: 'Marketing', teamId: 'TEAM-3', isPinned: false }
]

const mockSprints: Sprint[] = [
  { id: 'SPR-11', name: 'Sprint 11', startDate: '2026-06-26', endDate: '2026-07-10', status: 'past' },
  { id: 'SPR-12', name: 'Sprint 12 (Active)', startDate: '2026-07-10', endDate: '2026-07-24', status: 'active' },
  { id: 'SPR-13', name: 'Sprint 13 (Upcoming)', startDate: '2026-07-24', endDate: '2026-08-07', status: 'upcoming' }
]

const mockTasks: Task[] = [
  {
    id: 'TRK-101',
    title: 'Refactor globals.css variables to OKLCH values',
    description: 'Replace standard Tailwind hexes with OKLCH dynamic profiles to support beautiful theme colors, glow outlines, and soft shadow palettes.',
    status: 'done',
    priority: 'high',
    assigneeId: 'MEM-1',
    reporterId: 'MEM-2',
    labels: ['Frontend', 'Aesthetics'],
    sprintId: 'SPR-12',
    dueDate: '2026-07-14',
    subtasks: [
      { id: 'SUB-1', title: 'Verify Light mode contrast levels', done: true },
      { id: 'SUB-2', title: 'Verify Dark mode glow indexes', done: true }
    ],
    comments: [
      { id: 'COM-1', userId: 'MEM-2', content: 'These contrast markers look gorgeous on dark screens! Excellent work.', createdAt: '2026-07-13T10:00:00.000Z', reactions: [{ emoji: '🎉', count: 2, users: ['MEM-1', 'MEM-3'] }] }
    ],
    dependencies: [],
    timeLogged: { timeSpentMinutes: 180, timeEstimatedMinutes: 240 },
    projectId: 'PRJ-1',
    createdAt: '2026-07-10T09:00:00.000Z'
  },
  {
    id: 'TRK-102',
    title: 'Create collapsible Left Sidebar shell layout',
    description: 'Design a responsive sidebar containing top workspaces, core views (Inbox, My Tasks, Reports), theme switcher, and profile modal. Collapses to compact icons on desktop, and behaves as drawer on tablets/mobiles.',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: 'MEM-1',
    reporterId: 'MEM-1',
    labels: ['UX', 'Layout'],
    sprintId: 'SPR-12',
    dueDate: '2026-07-18',
    subtasks: [
      { id: 'SUB-3', title: 'Collapsible state logic and store hook', done: true },
      { id: 'SUB-4', title: 'Theme toggle connection using next-themes', done: true },
      { id: 'SUB-5', title: 'Mobile sliding drawer transition', done: false }
    ],
    comments: [
      { id: 'COM-2', userId: 'MEM-3', content: 'Make sure it is focus-manageable for keyboard accessibility.', createdAt: '2026-07-15T15:20:00.000Z', reactions: [] }
    ],
    dependencies: [{ id: 'TRK-101', type: 'blocked_by' }],
    timeLogged: { timeSpentMinutes: 320, timeEstimatedMinutes: 480 },
    projectId: 'PRJ-1',
    createdAt: '2026-07-11T10:00:00.000Z'
  },
  {
    id: 'TRK-103',
    title: 'Integrate Framer Motion animations for page switches',
    description: 'Configure standard slide-up page layouts and loading skeletons to give the SaaS product a native, highly fluid desktop app feel.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'MEM-2',
    reporterId: 'MEM-1',
    labels: ['Animations'],
    sprintId: 'SPR-12',
    dueDate: '2026-07-22',
    subtasks: [],
    comments: [],
    dependencies: [],
    timeLogged: { timeSpentMinutes: 0, timeEstimatedMinutes: 120 },
    projectId: 'PRJ-1',
    createdAt: '2026-07-12T11:00:00.000Z'
  },
  {
    id: 'TRK-104',
    title: 'Add custom Command Palette (⌘K) for search',
    description: 'Implement a beautiful blur-backdrop global query popup search. Filters instantly over active tasks, projects, workspace links, and quick commands.',
    status: 'backlog',
    priority: 'high',
    assigneeId: null,
    reporterId: 'MEM-2',
    labels: ['Global Search', 'Productivity'],
    sprintId: 'SPR-13',
    dueDate: '2026-08-01',
    subtasks: [],
    comments: [],
    dependencies: [],
    timeLogged: { timeSpentMinutes: 0, timeEstimatedMinutes: 300 },
    projectId: 'PRJ-1',
    createdAt: '2026-07-13T12:00:00.000Z'
  },
  {
    id: 'TRK-201',
    title: 'Build push notification broker with APNs & FCM',
    description: 'Set up node-apn and firebase-admin queues inside backend stack to route task update notifications directly to active mobile devices.',
    status: 'review',
    priority: 'high',
    assigneeId: 'MEM-3',
    reporterId: 'MEM-1',
    labels: ['APIs', 'Mobile'],
    sprintId: 'SPR-12',
    dueDate: '2026-07-19',
    subtasks: [
      { id: 'SUB-6', title: 'Verify credential key file loaders', done: true },
      { id: 'SUB-7', title: 'Implement custom batch route endpoints', done: false }
    ],
    comments: [],
    dependencies: [],
    timeLogged: { timeSpentMinutes: 240, timeEstimatedMinutes: 300 },
    projectId: 'PRJ-2',
    createdAt: '2026-07-10T14:00:00.000Z'
  },
  {
    id: 'TRK-301',
    title: 'Migrate active customer tokens to Stripe customer portals',
    description: 'Configure active billing dashboard redirects, allowing users to securely manage cards, receipts, and tier modifications on Stripe servers directly.',
    status: 'done',
    priority: 'urgent',
    assigneeId: 'MEM-3',
    reporterId: 'MEM-1',
    labels: ['Billing'],
    sprintId: 'SPR-11',
    dueDate: '2026-07-08',
    subtasks: [],
    comments: [],
    dependencies: [],
    timeLogged: { timeSpentMinutes: 450, timeEstimatedMinutes: 450 },
    projectId: 'PRJ-3',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'TRK-401',
    title: 'Write promotional newsletter highlighting Dark Theme updates',
    description: 'Draft custom customer email templates outlining the visual improvements, hotkey palettes, and keyboard shortcuts added to Tracko.',
    status: 'backlog',
    priority: 'low',
    assigneeId: 'MEM-2',
    reporterId: 'MEM-2',
    labels: ['Copywriting'],
    sprintId: 'SPR-13',
    dueDate: '2026-07-28',
    subtasks: [],
    comments: [],
    dependencies: [],
    timeLogged: { timeSpentMinutes: 0, timeEstimatedMinutes: 90 },
    projectId: 'PRJ-4',
    createdAt: '2026-07-15T09:00:00.000Z'
  }
]

const mockActivities: Activity[] = [
  { id: 'ACT-1', type: 'task', message: 'Amit Razz completed "Refactor globals.css variables to OKLCH values"', time: '2026-07-14T17:00:00.000Z', userId: 'MEM-1', taskId: 'TRK-101' },
  { id: 'ACT-2', type: 'task', message: 'Sarah Chen added a comment in "Refactor globals.css variables to OKLCH values"', time: '2026-07-13T10:00:00.000Z', userId: 'MEM-2', taskId: 'TRK-101' },
  { id: 'ACT-3', type: 'task', message: 'Amit Razz updated status of "Create collapsible Left Sidebar shell layout" to In Progress', time: '2026-07-11T10:15:00.000Z', userId: 'MEM-1', taskId: 'TRK-102' }
]

const mockNotifications: Notification[] = [
  { id: 'NTF-1', title: 'Assigned to TRK-102', description: 'Sarah Chen assigned you to "Create collapsible Left Sidebar shell layout".', time: '2026-07-11T10:00:00.000Z', type: 'assignment', isRead: false, taskId: 'TRK-102' },
  { id: 'NTF-2', title: 'New Comment on TRK-101', description: 'Sarah Chen commented: "These contrast markers look gorgeous..."', time: '2026-07-13T10:00:00.000Z', type: 'mention', isRead: false, taskId: 'TRK-101' },
  { id: 'NTF-3', title: 'Status Change TRK-301', description: 'John Miller moved "Migrate active customer tokens" to Done.', time: '2026-07-08T15:30:00.000Z', type: 'status_change', isRead: true, taskId: 'TRK-301' }
]

const mockWorkspace: WorkspaceSettings = {
  name: 'StackCrafter Enterprise',
  url: 'stack-crafter.tracko.app',
  logo: '⚡',
  description: 'Enterprise workspace for StackCrafter software team development tracking.',
  billingPlan: 'Enterprise',
  apiKeys: [
    { key: 'trk_live_e938da747b2', name: 'Production Vercel Sync', createdAt: '2026-05-12', permissions: 'Read & Write' },
    { key: 'trk_test_8874ba8c73d', name: 'Staging Sandbox Broker', createdAt: '2026-07-01', permissions: 'Read Only' }
  ],
  integrations: [
    { id: 'slack', name: 'Slack Alerts', enabled: true, description: 'Post real-time task notifications directly to development channels.' },
    { id: 'github', name: 'GitHub Sync', enabled: true, description: 'Automatically link PR references and auto-close completed issues.' },
    { id: 'figma', name: 'Figma Overlay', enabled: false, description: 'Embed interactive design mockups in task description sidebars.' }
  ]
}

const mockEpics: Epic[] = [
  { id: 'EPC-1', title: 'Design System Refactor', description: 'OKLCH theme migration, sleek glass UI layouts, framer-motion micro-animations.', progress: 75, projectId: 'PRJ-1' },
  { id: 'EPC-2', title: 'Productivity Mechanics', description: 'Command Palette search indexing and raycast keyboard navigation cockpit shortcut listeners.', progress: 100, projectId: 'PRJ-1' },
  { id: 'EPC-3', title: 'Enterprise Integrations', description: 'Slack notifications trigger logs and billing management layout forms.', progress: 40, projectId: 'PRJ-3' }
]

export const useTrackoStore = create<TrackoState>()(
  persist(
    (set, get) => ({
  members: mockMembers,
  teams: mockTeams,
  projects: mockProjects,
  sprints: mockSprints,
  tasks: mockTasks,
  activities: mockActivities,
  notifications: mockNotifications,
  workspace: mockWorkspace,
  currentUserId: 'MEM-1',

  // Staff+ State initialization
  isOffline: false,
  offlineQueue: [],
  undoStack: [],
  redoStack: [],
  currentUserRole: 'admin',
  featureFlags: { offlineSync: true, liveSimulation: true, velocityCharts: true },
  epics: mockEpics,

  addTask: (taskData) => {
    if (!get().hasPermission('create_task')) {
      toast.error('Access Denied: You do not have permission to create tasks.')
      return {
        ...taskData,
        id: 'DENIED',
        createdAt: new Date().toISOString(),
        comments: [],
        subtasks: [],
        dependencies: []
      }
    }

    const newId = `TRK-${Math.floor(100 + Math.random() * 900)}`
    const newTask: Task = {
      ...taskData,
      id: newId,
      createdAt: new Date().toISOString(),
      comments: [],
      subtasks: [],
      dependencies: []
    }

    if (get().isOffline) {
      set((state) => ({
        tasks: [...state.tasks, newTask],
        offlineQueue: [...state.offlineQueue, { type: 'add_task', payload: taskData }]
      }))
      toast.success('Task created optimistically (offline)')
      return newTask
    }

    get().pushToUndo()

    set((state) => {
      const updatedTasks = [...state.tasks, newTask]
      const newActivity: Activity = {
        id: `ACT-${Date.now()}`,
        type: 'task',
        message: `${state.members.find(m => m.id === state.currentUserId)?.name || 'Someone'} created task "${newTask.title}"`,
        time: new Date().toISOString(),
        userId: state.currentUserId,
        taskId: newId
      }
      return {
        tasks: updatedTasks,
        activities: [newActivity, ...state.activities]
      }
    })

    return newTask
  },

  updateTask: (id, updates, customUserId) => {
    if (!get().hasPermission('update_task')) {
      toast.error('Access Denied: You do not have permission to update tasks.')
      return
    }

    if (get().isOffline) {
      set((state) => {
        const updatedTasks = state.tasks.map((task) => {
          if (task.id === id) {
            return { ...task, ...updates }
          }
          return task
        })
        return {
          tasks: updatedTasks,
          offlineQueue: [...state.offlineQueue, { type: 'update_task', payload: { id, updates, customUserId } }]
        }
      })
      toast.success('Task update queued (offline)')
      return
    }

    get().pushToUndo()

    set((state) => {
      const oldTask = state.tasks.find(t => t.id === id)
      if (!oldTask) return {}

      const updatedTasks = state.tasks.map((task) => {
        if (task.id === id) {
          return { ...task, ...updates }
        }
        return task
      })

      const activityMessages: string[] = []
      const activeUserId = customUserId || state.currentUserId
      const commenterName = state.members.find(m => m.id === activeUserId)?.name || 'Someone'

      if (updates.status && updates.status !== oldTask.status) {
        activityMessages.push(`${commenterName} updated status of "${oldTask.title}" to "${updates.status.replace('_', ' ')}"`)
      }
      if (updates.priority && updates.priority !== oldTask.priority) {
        activityMessages.push(`${commenterName} set priority of "${oldTask.title}" to "${updates.priority}"`)
      }
      if (updates.assigneeId !== undefined && updates.assigneeId !== oldTask.assigneeId) {
        const newAssignee = state.members.find(m => m.id === updates.assigneeId)?.name || 'Unassigned'
        activityMessages.push(`${commenterName} assigned "${oldTask.title}" to ${newAssignee}`)
      }

      const newActivities = activityMessages.map((msg, index) => ({
        id: `ACT-${Date.now()}-${index}`,
        type: 'task' as const,
        message: msg,
        time: new Date().toISOString(),
        userId: activeUserId,
        taskId: id
      }))

      let updatedProjects = state.projects
      if (updates.status && updates.status !== oldTask.status) {
        updatedProjects = state.projects.map(proj => {
          if (proj.id === oldTask.projectId) {
            const projectTasks = updatedTasks.filter(t => t.projectId === proj.id)
            const completedCount = projectTasks.filter(t => t.status === 'done').length
            const newProgress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0
            return { ...proj, progress: newProgress }
          }
          return proj
        })
      }

      return {
        tasks: updatedTasks,
        projects: updatedProjects,
        activities: [...newActivities, ...state.activities]
      }
    })
  },

  deleteTask: (id) => {
    if (!get().hasPermission('delete_task')) {
      toast.error('Access Denied: You do not have permission to delete tasks.')
      return
    }

    if (get().isOffline) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        offlineQueue: [...state.offlineQueue, { type: 'delete_task', payload: { id } }]
      }))
      toast.success('Task deletion queued (offline)')
      return
    }

    get().pushToUndo()

    set((state) => {
      const taskToDelete = state.tasks.find(t => t.id === id)
      if (!taskToDelete) return {}

      const updatedTasks = state.tasks.filter((task) => task.id !== id)
      const newActivity: Activity = {
        id: `ACT-${Date.now()}`,
        type: 'task',
        message: `Task "${taskToDelete.title}" was deleted.`,
        time: new Date().toISOString(),
        userId: state.currentUserId
      }

      return {
        tasks: updatedTasks,
        activities: [newActivity, ...state.activities]
      }
    })
  },

  addComment: (taskId, content, userId) => {
    set((state) => {
      const activeUserId = userId || state.currentUserId
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const newComment: Comment = {
            id: `COM-${Date.now()}`,
            userId: activeUserId,
            content,
            createdAt: new Date().toISOString(),
            reactions: []
          }
          return {
            ...task,
            comments: [...task.comments, newComment]
          }
        }
        return task
      })

      const taskObj = state.tasks.find(t => t.id === taskId)
      const commenterName = state.members.find(m => m.id === activeUserId)?.name || 'Someone'
      const newActivity: Activity = {
        id: `ACT-${Date.now()}`,
        type: 'comment',
        message: `${commenterName} commented on "${taskObj?.title || taskId}"`,
        time: new Date().toISOString(),
        userId: activeUserId,
        taskId
      }

      return {
        tasks: updatedTasks,
        activities: [newActivity, ...state.activities]
      }
    })
  },

  addReaction: (taskId, commentId, emoji) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task

        const updatedComments = task.comments.map((comment) => {
          if (comment.id !== commentId) return comment

          // Check if user already reacted with this emoji
          const userIdx = comment.reactions.findIndex(r => r.emoji === emoji)
          let updatedReactions = [...comment.reactions]

          if (userIdx > -1) {
            const reaction = updatedReactions[userIdx]
            const hasUserReacted = reaction.users.includes(state.currentUserId)

            if (hasUserReacted) {
              // Remove user reaction
              const newUsers = reaction.users.filter(u => u !== state.currentUserId)
              if (newUsers.length === 0) {
                updatedReactions = updatedReactions.filter(r => r.emoji !== emoji)
              } else {
                updatedReactions[userIdx] = { ...reaction, count: newUsers.length, users: newUsers }
              }
            } else {
              // Add user reaction to existing emoji group
              updatedReactions[userIdx] = {
                ...reaction,
                count: reaction.count + 1,
                users: [...reaction.users, state.currentUserId]
              }
            }
          } else {
            // New emoji reaction group
            updatedReactions.push({
              emoji,
              count: 1,
              users: [state.currentUserId]
            })
          }

          return { ...comment, reactions: updatedReactions }
        })

        return { ...task, comments: updatedComments }
      })

      return { tasks: updatedTasks }
    })
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((sub) => {
            if (sub.id === subtaskId) {
              return { ...sub, done: !sub.done }
            }
            return sub
          })
          return { ...task, subtasks: updatedSubtasks }
        }
        return task
      })
      return { tasks: updatedTasks }
    })
  },

  addSubtask: (taskId, title) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const newSub: Subtask = {
            id: `SUB-${Date.now()}`,
            title,
            done: false
          }
          return { ...task, subtasks: [...task.subtasks, newSub] }
        }
        return task
      })
      return { tasks: updatedTasks }
    })
  },

  addDependency: (taskId, targetId, type) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const newDep: Dependency = { id: targetId, type }
          return { ...task, dependencies: [...task.dependencies, newDep] }
        }
        return task
      })
      return { tasks: updatedTasks }
    })
  },

  addProject: (projData) => {
    const newId = `PRJ-${Math.floor(5 + Math.random() * 95)}`
    const newProject: Project = {
      ...projData,
      id: newId,
      progress: 0
    }

    set((state) => {
      const newActivity: Activity = {
        id: `ACT-${Date.now()}`,
        type: 'project',
        message: `Project "${newProject.name}" was created`,
        time: new Date().toISOString(),
        userId: state.currentUserId
      }
      return {
        projects: [...state.projects, newProject],
        activities: [newActivity, ...state.activities]
      }
    })
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((proj) => (proj.id === id ? { ...proj, ...updates } : proj))
    }))
  },

  togglePinProject: (id) => {
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === id ? { ...proj, isPinned: !proj.isPinned } : proj
      )
    }))
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    }))
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
    }))
  },

  addActivity: (type, message, taskId) => {
    set((state) => ({
      activities: [
        {
          id: `ACT-${Date.now()}`,
          type,
          message,
          time: new Date().toISOString(),
          userId: state.currentUserId,
          taskId
        },
        ...state.activities
      ]
    }))
  },

  updateWorkspace: (updates) => {
    set((state) => ({
      workspace: { ...state.workspace, ...updates }
    }))
  },

  generateApiKey: (name, permissions) => {
    set((state) => {
      const newKey = `trk_${Math.random().toString(36).substring(2, 6)}_` + Math.random().toString(36).substring(2, 12)
      return {
        workspace: {
          ...state.workspace,
          apiKeys: [
            ...state.workspace.apiKeys,
            { key: newKey, name, createdAt: new Date().toISOString().split('T')[0], permissions }
          ]
        }
      }
    })
  },

  revokeApiKey: (keyToRevoke) => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        apiKeys: state.workspace.apiKeys.filter(k => k.key !== keyToRevoke)
      }
    }))
  },

  toggleIntegration: (id) => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        integrations: state.workspace.integrations.map((integration) =>
          integration.id === id ? { ...integration, enabled: !integration.enabled } : integration
        )
      }
    }))
  },

  resetStore: () => {
    set({
      members: mockMembers,
      teams: mockTeams,
      projects: mockProjects,
      sprints: mockSprints,
      tasks: mockTasks,
      activities: mockActivities,
      notifications: mockNotifications,
      workspace: mockWorkspace,
      currentUserId: 'MEM-1',
      isOffline: false,
      offlineQueue: [],
      undoStack: [],
      redoStack: [],
      currentUserRole: 'admin',
      featureFlags: { offlineSync: true, liveSimulation: true, velocityCharts: true },
      epics: mockEpics
    })
  },

  addNotification: (notifData) => {
    set((state) => ({
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          ...notifData,
          isRead: false,
          time: new Date().toISOString()
        },
        ...state.notifications
      ]
    }))
  },

  hasPermission: (action) => {
    const role = get().currentUserRole
    if (role === 'viewer') return false
    if (role === 'member') {
      if (action === 'delete_task' || action === 'manage_settings' || action === 'manage_billing' || action === 'manage_keys') {
        return false
      }
    }
    return true
  },

  toggleNetworkStatus: () => {
    const nextOffline = !get().isOffline
    set({ isOffline: nextOffline })
    
    if (!nextOffline && get().offlineQueue.length > 0) {
      toast.info('Syncing offline actions...')
      setTimeout(() => {
        const queue = get().offlineQueue
        // Re-play queued actions
        queue.forEach((action) => {
          if (action.type === 'update_task') {
            const p = action.payload as unknown as { id: string; updates: Partial<Task>; customUserId?: string }
            get().updateTask(p.id, p.updates, p.customUserId)
          } else if (action.type === 'add_task') {
            const p = action.payload as unknown as Omit<Task, 'id' | 'createdAt' | 'comments' | 'subtasks' | 'dependencies'>
            get().addTask(p)
          } else if (action.type === 'delete_task') {
            const p = action.payload as unknown as { id: string }
            get().deleteTask(p.id)
          } else if (action.type === 'add_comment') {
            const p = action.payload as unknown as { taskId: string; content: string; userId?: string }
            get().addComment(p.taskId, p.content, p.userId)
          }
        })
        set({ offlineQueue: [] })
        toast.success(`Sync completed: ${queue.length} updates synchronized!`)
      }, 1200)
    } else {
      toast.success(nextOffline ? 'Workspace is now Offline' : 'Workspace is now Online')
    }
  },

  setUserRole: (role) => {
    set({ currentUserRole: role })
    toast.success(`Role switched to: ${role}`)
  },

  setFeatureFlag: (flag, enabled) => {
    set((state) => ({
      featureFlags: {
        ...state.featureFlags,
        [flag]: enabled
      }
    }))
    toast.success(`Feature Flag "${flag}" toggled ${enabled ? 'ON' : 'OFF'}`)
  },

  pushToUndo: () => {
    const { tasks, projects, activities, notifications } = get()
    set((state) => ({
      undoStack: [...state.undoStack, { tasks, projects, activities, notifications }].slice(-25),
      redoStack: []
    }))
  },

  undo: () => {
    const { undoStack, tasks, projects, activities, notifications } = get()
    if (undoStack.length === 0) {
      toast.error('Nothing to undo')
      return
    }
    const previous = undoStack[undoStack.length - 1]
    const rest = undoStack.slice(0, -1)
    set((state) => ({
      tasks: previous.tasks,
      projects: previous.projects,
      activities: previous.activities,
      notifications: previous.notifications,
      undoStack: rest,
      redoStack: [...state.redoStack, { tasks, projects, activities, notifications }]
    }))
    toast.success('Action undone')
  },

  redo: () => {
    const { redoStack, tasks, projects, activities, notifications } = get()
    if (redoStack.length === 0) {
      toast.error('Nothing to redo')
      return
    }
    const next = redoStack[redoStack.length - 1]
    const rest = redoStack.slice(0, -1)
    set((state) => ({
      tasks: next.tasks,
      projects: next.projects,
      activities: next.activities,
      notifications: next.notifications,
      redoStack: rest,
      undoStack: [...state.undoStack, { tasks, projects, activities, notifications }]
    }))
    toast.success('Action redone')
  }
}), {
  name: 'tracko-workspace-storage'
}))
