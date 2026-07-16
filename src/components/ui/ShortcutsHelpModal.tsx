'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShortcutsHelpModalProps {
  onClose: () => void
}

export function ShortcutsHelpModal({ onClose }: ShortcutsHelpModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/45 dark:bg-black/65 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl relative z-10 border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Keyboard className="h-4 w-4 text-primary" />
            <span>Keyboard Shortcuts</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Content list */}
        <div className="p-5 space-y-4 text-sm max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">General Commands</h3>
            
            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Open Command Search</span>
              <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">
                ⌘ K
              </kbd>
            </div>
            
            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Create New Issue / Task</span>
              <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">
                C
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Toggle Shortcuts Menu</span>
              <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">
                ?
              </kbd>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Navigation Sequences</h3>
            <p className="text-[11px] text-muted-foreground mb-2">Press the first key followed by the second.</p>

            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Go to Dashboard</span>
              <div className="flex gap-1">
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">G</kbd>
                <span className="text-muted-foreground text-xs font-mono">+</span>
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">D</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Go to Inbox Notifications</span>
              <div className="flex gap-1">
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">G</kbd>
                <span className="text-muted-foreground text-xs font-mono">+</span>
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">I</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Go to Issues Cockpit</span>
              <div className="flex gap-1">
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">G</kbd>
                <span className="text-muted-foreground text-xs font-mono">+</span>
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">T</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Go to Projects Hub</span>
              <div className="flex gap-1">
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">G</kbd>
                <span className="text-muted-foreground text-xs font-mono">+</span>
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">P</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-foreground/80">Go to Workspace Settings</span>
              <div className="flex gap-1">
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">G</kbd>
                <span className="text-muted-foreground text-xs font-mono">+</span>
                <kbd className="h-5 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground shadow-xs">S</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 bg-muted/40 text-[10px] text-muted-foreground text-center">
          Press ESC or click outside to dismiss this panel.
        </div>
      </motion.div>
    </div>
  )
}
