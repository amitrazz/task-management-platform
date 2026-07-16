import { describe, it, expect, beforeEach, vi } from 'vitest'

const storeMap: Record<string, string> = {}
const mockLocalStorage = {
  getItem: vi.fn((key: string) => storeMap[key] || null),
  setItem: vi.fn((key: string, value: string) => { storeMap[key] = value }),
  removeItem: vi.fn((key: string) => { delete storeMap[key] }),
  clear: vi.fn(() => { Object.keys(storeMap).forEach(k => delete storeMap[k]) }),
  key: vi.fn((idx: number) => Object.keys(storeMap)[idx] || null),
  get length() { return Object.keys(storeMap).length }
}

global.localStorage = mockLocalStorage
global.window = {
  localStorage: mockLocalStorage
} as unknown as Window & typeof globalThis

import { useTrackoStore } from '../trackoStore'

describe('Tracko Core Store Logic', () => {
  beforeEach(() => {
    // Reset state to initial mock seeds before each test run
    useTrackoStore.getState().resetStore()
  })

  it('should initialize with mock tasks and members', () => {
    const state = useTrackoStore.getState()
    expect(state.members.length).toBeGreaterThan(0)
    expect(state.tasks.length).toBeGreaterThan(0)
    expect(state.projects.length).toBeGreaterThan(0)
  })

  it('should add a new task and generate unique ID', () => {
    const store = useTrackoStore.getState()
    const taskCountBefore = store.tasks.length

    const createdTask = store.addTask({
      title: 'Unit test dashboard metrics integration',
      description: 'Write unit tests to cover state mutations.',
      status: 'todo',
      priority: 'high',
      assigneeId: 'MEM-1',
      reporterId: 'MEM-2',
      labels: ['Testing'],
      sprintId: 'SPR-12',
      dueDate: '2026-07-25',
      timeLogged: { timeSpentMinutes: 0, timeEstimatedMinutes: 180 },
      projectId: 'PRJ-1'
    })

    const updatedState = useTrackoStore.getState()
    expect(updatedState.tasks.length).toBe(taskCountBefore + 1)
    expect(createdTask.id).toMatch(/^TRK-\d+$/)
    expect(createdTask.title).toBe('Unit test dashboard metrics integration')
    expect(createdTask.comments).toEqual([])
    expect(createdTask.subtasks).toEqual([])
    expect(createdTask.dependencies).toEqual([])
  })

  it('should update task details and status', () => {
    const store = useTrackoStore.getState()
    const targetTask = store.tasks[0]

    store.updateTask(targetTask.id, { status: 'in_progress', priority: 'urgent' })

    const updatedStore = useTrackoStore.getState()
    const updatedTask = updatedStore.tasks.find(t => t.id === targetTask.id)

    expect(updatedTask?.status).toBe('in_progress')
    expect(updatedTask?.priority).toBe('urgent')
  })

  it('should delete a task and remove it from lists', () => {
    const store = useTrackoStore.getState()
    const targetTask = store.tasks[0]
    const taskCountBefore = store.tasks.length

    store.deleteTask(targetTask.id)

    const updatedStore = useTrackoStore.getState()
    expect(updatedStore.tasks.length).toBe(taskCountBefore - 1)
    expect(updatedStore.tasks.find(t => t.id === targetTask.id)).toBeUndefined()
  })

  it('should add a comment and record mock activity', () => {
    const store = useTrackoStore.getState()
    const targetTask = store.tasks[0]
    const commentsBefore = targetTask.comments.length

    store.addComment(targetTask.id, 'This comment was simulated by the unit test framework.', 'MEM-2')

    const updatedStore = useTrackoStore.getState()
    const updatedTask = updatedStore.tasks.find(t => t.id === targetTask.id)

    expect(updatedTask?.comments.length).toBe(commentsBefore + 1)
    expect(updatedTask?.comments[updatedTask.comments.length - 1].content).toBe('This comment was simulated by the unit test framework.')
    expect(updatedTask?.comments[updatedTask.comments.length - 1].userId).toBe('MEM-2')
  })

  it('should toggle a subtask status', () => {
    const store = useTrackoStore.getState()
    
    // Find task containing subtasks
    const taskWithSubtasks = store.tasks.find(t => t.subtasks.length > 0)
    expect(taskWithSubtasks).toBeDefined()
    
    const subtask = taskWithSubtasks!.subtasks[0]
    const initialState = subtask.done

    store.toggleSubtask(taskWithSubtasks!.id, subtask.id)

    const updatedStore = useTrackoStore.getState()
    const updatedTask = updatedStore.tasks.find(t => t.id === taskWithSubtasks!.id)
    const updatedSubtask = updatedTask?.subtasks.find(s => s.id === subtask.id)

    expect(updatedSubtask?.done).toBe(!initialState)
  })

  it('should add a subtask to task', () => {
    const store = useTrackoStore.getState()
    const targetTask = store.tasks[0]
    const subtaskCountBefore = targetTask.subtasks.length

    store.addSubtask(targetTask.id, 'Clean up lint warnings')

    const updatedStore = useTrackoStore.getState()
    const updatedTask = updatedStore.tasks.find(t => t.id === targetTask.id)

    expect(updatedTask?.subtasks.length).toBe(subtaskCountBefore + 1)
    expect(updatedTask?.subtasks[updatedTask.subtasks.length - 1].title).toBe('Clean up lint warnings')
    expect(updatedTask?.subtasks[updatedTask.subtasks.length - 1].done).toBe(false)
  })

  it('should establish dependencies between tasks', () => {
    const store = useTrackoStore.getState()
    const taskA = store.tasks[0]
    const taskB = store.tasks[1]

    store.addDependency(taskA.id, taskB.id, 'blocks')

    const updatedStore = useTrackoStore.getState()
    const updatedTaskA = updatedStore.tasks.find(t => t.id === taskA.id)

    expect(updatedTaskA?.dependencies.some(d => d.id === taskB.id && d.type === 'blocks')).toBe(true)
  })

  it('should pin and unpin projects', () => {
    const store = useTrackoStore.getState()
    const project = store.projects[0]
    const initialPinned = project.isPinned

    store.togglePinProject(project.id)

    let updatedStore = useTrackoStore.getState()
    expect(updatedStore.projects.find(p => p.id === project.id)?.isPinned).toBe(!initialPinned)

    store.togglePinProject(project.id)

    updatedStore = useTrackoStore.getState()
    expect(updatedStore.projects.find(p => p.id === project.id)?.isPinned).toBe(initialPinned)
  })

  it('should add notifications', () => {
    const store = useTrackoStore.getState()
    const notificationCountBefore = store.notifications.length

    store.addNotification({
      title: 'New issue assignment',
      description: 'You have been assigned to task TRK-105',
      type: 'assignment',
      taskId: 'TRK-105'
    })

    const updatedStore = useTrackoStore.getState()
    expect(updatedStore.notifications.length).toBe(notificationCountBefore + 1)
    expect(updatedStore.notifications[0].title).toBe('New issue assignment')
    expect(updatedStore.notifications[0].isRead).toBe(false)
  })

  it('should reset store defaults', () => {
    const store = useTrackoStore.getState()
    
    // Add dynamic task
    store.addTask({
      title: 'Task to discard',
      description: 'Will be removed on reset.',
      status: 'todo',
      priority: 'low',
      assigneeId: 'MEM-1',
      reporterId: 'MEM-2',
      labels: [],
      sprintId: 'SPR-12',
      dueDate: '',
      timeLogged: { timeSpentMinutes: 0, timeEstimatedMinutes: 0 },
      projectId: 'PRJ-1'
    })

    // Reset store
    store.resetStore()

    const resetStoreState = useTrackoStore.getState()
    expect(resetStoreState.tasks.some(t => t.title === 'Task to discard')).toBe(false)
  })
})
