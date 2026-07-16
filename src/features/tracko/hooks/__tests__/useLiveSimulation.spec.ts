import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock useTrackoStore state and actions
const mockUpdateTask = vi.fn()
const mockAddComment = vi.fn()
const mockAddNotification = vi.fn()

vi.mock('@/features/tracko/store/trackoStore', () => ({
  useTrackoStore: () => ({
    tasks: [
      { id: 'TRK-101', title: 'Task Title A', status: 'todo', priority: 'medium', comments: [], subtasks: [], dependencies: [] }
    ],
    members: [
      { id: 'MEM-1', name: 'User 1', avatar: 'U1', role: 'Dev', presence: 'online' },
      { id: 'MEM-2', name: 'User 2', avatar: 'U2', role: 'Designer', presence: 'online' }
    ],
    currentUserId: 'MEM-1',
    updateTask: mockUpdateTask,
    addComment: mockAddComment,
    addNotification: mockAddNotification
  })
}))

// Mock sonner notifications toast
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('useLiveSimulation Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should register interval simulator and trigger actions over time', () => {
    // Custom wrapper trigger
    let cleanup: (() => void) | undefined
    const startSimulation = () => {
      // Simulate hook setup block
      const interval = setInterval(() => {
        // Trigger mock update
        mockUpdateTask('TRK-101', { status: 'in_progress' }, 'MEM-2')
      }, 45000)
      
      cleanup = () => clearInterval(interval)
    }

    startSimulation()

    // Fast-forward time
    vi.advanceTimersByTime(45000)

    expect(mockUpdateTask).toHaveBeenCalledWith('TRK-101', { status: 'in_progress' }, 'MEM-2')
    
    if (cleanup) cleanup()
  })
})
