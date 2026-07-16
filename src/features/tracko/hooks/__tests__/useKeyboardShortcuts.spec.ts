import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock React module's named hook exports for Node tests
vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>()
  return {
    ...original,
    useRef: () => ({ current: false }),
    useEffect: (cb: () => void) => { cb() }
  }
})

import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

type KeyEventListener = (e: KeyboardEvent) => void

// Mock DOM events and structures inside the Node.js test runner
const listeners: { [event: string]: KeyEventListener[] } = {}
let activeElementMock: { tagName: string } | null = null

global.window = {
  addEventListener: vi.fn((event: string, cb: KeyEventListener) => {
    if (!listeners[event]) listeners[event] = []
    listeners[event].push(cb)
  }),
  removeEventListener: vi.fn((event: string, cb: KeyEventListener) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(f => f !== cb)
    }
  }),
  dispatchEvent: vi.fn((event: KeyboardEvent) => {
    if (listeners[event.type]) {
      listeners[event.type].forEach(cb => cb(event))
    }
    return true
  })
} as unknown as Window & typeof globalThis

global.document = {
  createElement: vi.fn((tag: string) => ({
    tagName: tag.toUpperCase(),
    focus: () => {
      activeElementMock = { tagName: tag.toUpperCase() }
    },
    getAttribute: vi.fn()
  })),
  body: {
    appendChild: vi.fn()
  },
  get activeElement() {
    return activeElementMock
  }
} as unknown as Document

class MockKeyboardEvent {
  type: string
  key: string
  preventDefault = vi.fn()
  constructor(type: string, options: { key: string }) {
    this.type = type
    this.key = options.key
  }
}
global.KeyboardEvent = MockKeyboardEvent as unknown as typeof KeyboardEvent

// Mock next/navigation router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('useKeyboardShortcuts Hook', () => {
  const mockToggleHelp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    activeElementMock = null
  })

  it('should navigate to create task URL on pressing "c" key', () => {
    const cleanup = () => {
      listeners['keydown'] = []
    }
    
    useKeyboardShortcuts(mockToggleHelp)

    const event = new KeyboardEvent('keydown', { key: 'c' })
    window.dispatchEvent(event)

    expect(mockPush).toHaveBeenCalledWith('/tasks?create=true')
    cleanup()
  })

  it('should trigger toggle help overlay on pressing "?" key', () => {
    const cleanup = () => {
      listeners['keydown'] = []
    }
    
    useKeyboardShortcuts(mockToggleHelp)

    const event = new KeyboardEvent('keydown', { key: '?' })
    window.dispatchEvent(event)

    expect(mockToggleHelp).toHaveBeenCalled()
    cleanup()
  })

  it('should ignore shortcuts when focused inside an input element', () => {
    const cleanup = () => {
      listeners['keydown'] = []
    }
    
    useKeyboardShortcuts(mockToggleHelp)

    const input = document.createElement('input') as unknown as HTMLInputElement
    input.focus()

    const event = new KeyboardEvent('keydown', { key: 'c' })
    window.dispatchEvent(event)

    expect(mockPush).not.toHaveBeenCalled()
    cleanup()
  })
})
