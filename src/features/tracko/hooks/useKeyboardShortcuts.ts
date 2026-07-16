'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts(onToggleHelp: () => void) {
  const router = useRouter()
  const gPressedRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in input elements
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      // Handle double-key sequence (g prefix)
      if (gPressedRef.current) {
        gPressedRef.current = false
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            router.push('/dashboard')
            break
          case 'i':
            e.preventDefault()
            router.push('/inbox')
            break
          case 't':
            e.preventDefault()
            router.push('/tasks')
            break
          case 'p':
            e.preventDefault()
            router.push('/projects')
            break
          case 's':
            e.preventDefault()
            router.push('/settings')
            break
          default:
            break
        }
        return
      }

      if (e.key.toLowerCase() === 'g') {
        gPressedRef.current = true
        // Expire key sequence after 1 second
        setTimeout(() => {
          gPressedRef.current = false
        }, 1000)
        return
      }

      // Single character commands
      if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'n') {
        e.preventDefault()
        router.push('/tasks?create=true')
      } else if (e.key === '?') {
        e.preventDefault()
        onToggleHelp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, onToggleHelp])
}
