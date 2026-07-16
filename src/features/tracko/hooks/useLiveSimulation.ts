'use client'

import { useEffect } from 'react'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import { toast } from 'sonner'

const MOCK_COMMENTS = [
  'I will take a look at this tomorrow morning.',
  'Is this blocked by the design adjustments?',
  'PR is linked and waiting for QA approval.',
  'Can we discuss this in the next daily standup?',
  'Done. Let me know if we need additional tests here.',
  'Figma layout is updated, check description links.',
  'We should prioritize this for the current sprint milestone.'
]

const MOCK_STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'] as const
const MOCK_PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'] as const

export function useLiveSimulation() {
  const {
    tasks,
    members,
    updateTask,
    addComment,
    addNotification,
    currentUserId
  } = useTrackoStore()

  const viewTask = (taskId: string) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('task', taskId)
    window.history.pushState({}, '', url.toString())
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return

    const interval = setInterval(() => {
      // Don't simulate if no tasks or members exist
      if (tasks.length === 0 || members.length === 0) return

      // Pick a random task (excluding ones that are done or closed)
      const activeTasks = tasks.filter(t => t.status !== 'done')
      const targetTask = activeTasks.length > 0
        ? activeTasks[Math.floor(Math.random() * activeTasks.length)]
        : tasks[Math.floor(Math.random() * tasks.length)]

      // Pick a random simulated member (excluding the current user)
      const simulatedMembers = members.filter(m => m.id !== currentUserId)
      if (simulatedMembers.length === 0) return
      const member = simulatedMembers[Math.floor(Math.random() * simulatedMembers.length)]

      // Pick an action type: 0 = comment, 1 = status update, 2 = assignment change / priority update, 3 = direct user mention
      const actionType = Math.floor(Math.random() * 4)

      if (actionType === 0) {
        // Post a simulated comment
        const commentText = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)]
        addComment(targetTask.id, commentText, member.id)

        // Show toast
        toast.info(`${member.name} commented on issue ${targetTask.id}`, {
          description: `"${commentText.substring(0, 45)}..."`,
          action: {
            label: 'View',
            onClick: () => viewTask(targetTask.id)
          }
        })
      } else if (actionType === 1) {
        // Move task status
        const nextStatus = MOCK_STATUSES[Math.floor(Math.random() * MOCK_STATUSES.length)]
        if (nextStatus !== targetTask.status) {
          updateTask(targetTask.id, { status: nextStatus }, member.id)

          toast.info(`${member.name} moved ${targetTask.id} to ${nextStatus.replace('_', ' ')}`, {
            action: {
              label: 'View',
              onClick: () => viewTask(targetTask.id)
            }
          })
        }
      } else if (actionType === 2) {
        // Random priority update
        const nextPriority = MOCK_PRIORITIES[Math.floor(Math.random() * MOCK_PRIORITIES.length)]
        if (nextPriority !== targetTask.priority) {
          updateTask(targetTask.id, { priority: nextPriority }, member.id)

          toast.info(`${member.name} updated priority of ${targetTask.id} to ${nextPriority}`, {
            action: {
              label: 'View',
              onClick: () => viewTask(targetTask.id)
            }
          })
        }
      } else if (actionType === 3) {
        // Mention/assignment notification for active user
        const notifTitle = `Assigned to issue ${targetTask.id}`
        const notifDesc = `${member.name} assigned you to "${targetTask.title}"`

        // Update task assignee to current user
        updateTask(targetTask.id, { assigneeId: currentUserId }, member.id)

        // Add workspace notification
        addNotification({
          title: notifTitle,
          description: notifDesc,
          type: 'assignment',
          taskId: targetTask.id
        })

        toast.success(notifTitle, {
          description: notifDesc,
          action: {
            label: 'Open',
             onClick: () => viewTask(targetTask.id)
          }
        })
      }
    }, 45000) // Trigger simulation tick every 45 seconds

    return () => clearInterval(interval)
  }, [tasks, members, currentUserId, updateTask, addComment, addNotification])
}
