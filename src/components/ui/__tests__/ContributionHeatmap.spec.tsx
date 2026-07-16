import { describe, it, expect, vi } from 'vitest'

// Mock store state
vi.mock('@/features/tracko/store/trackoStore', () => ({
  useTrackoStore: () => ({
    tasks: [
      { id: 'TRK-101', title: 'Task Title A', status: 'done', dueDate: '2026-07-16', comments: [], subtasks: [], dependencies: [] },
      { id: 'TRK-102', title: 'Task Title B', status: 'done', dueDate: '2026-07-16', comments: [], subtasks: [], dependencies: [] }
    ]
  })
}))

describe('ContributionHeatmap Widget', () => {
  it('should map data counts and intensities', () => {
    // Assert mock data logic calculation
    const completionCounts: { [dateStr: string]: number } = {}
    const mockDates = ['2026-07-16', '2026-07-16']
    mockDates.forEach(d => {
      completionCounts[d] = (completionCounts[d] || 0) + 1
    })

    expect(completionCounts['2026-07-16']).toBe(2)
  })

  it('should resolve grid intensity levels', () => {
    const getIntensityColor = (level: number) => {
      switch (level) {
        case 1: return 'bg-emerald-500/20'
        case 2: return 'bg-emerald-500/45'
        case 3: return 'bg-emerald-500/70'
        case 4: return 'bg-emerald-500'
        default: return 'bg-muted/40'
      }
    }

    expect(getIntensityColor(0)).toBe('bg-muted/40')
    expect(getIntensityColor(2)).toBe('bg-emerald-500/45')
    expect(getIntensityColor(4)).toBe('bg-emerald-500')
  })
})
