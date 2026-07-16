'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTrackoStore, Project } from '@/features/tracko/store/trackoStore'
import {
  FolderKanban,
  Pin,
  Plus,
  Briefcase,
  Search,
  Paintbrush,
  Smartphone,
  CreditCard,
  Megaphone,
  X
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, tasks, addProject, togglePinProject } = useTrackoStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // New project state
  const [projName, setProjName] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projCat, setProjCat] = useState('Core Engineering')
  const [projIcon, setProjIcon] = useState('Briefcase')

  // Filter projects by search
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group by Category
  const categories: { [key: string]: Project[] } = {}
  filteredProjects.forEach((proj) => {
    if (!categories[proj.category]) {
      categories[proj.category] = []
    }
    categories[proj.category].push(proj)
  })

  const getProjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Paintbrush': return <Paintbrush className="h-4 w-4" />
      case 'Smartphone': return <Smartphone className="h-4 w-4" />
      case 'CreditCard': return <CreditCard className="h-4 w-4" />
      case 'Megaphone': return <Megaphone className="h-4 w-4" />
      default: return <Briefcase className="h-4 w-4" />
    }
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (projName.trim() && projDesc.trim()) {
      addProject({
        name: projName.trim(),
        description: projDesc.trim(),
        status: 'active',
        icon: projIcon,
        category: projCat,
        teamId: 'TEAM-1',
        isPinned: false
      })
      
      // Reset form states
      setProjName('')
      setProjDesc('')
      setIsModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-muted-foreground" />
            Projects Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, search, and monitor progress across all organizational project hubs.
          </p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="h-9 text-xs shrink-0 w-fit">
          <Plus className="h-4 w-4 mr-1" /> Create Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 border rounded-lg px-3 py-2 bg-muted/20 max-w-md shrink-0">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Filter projects by title, category, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none text-foreground"
        />
      </div>

      {/* Projects Grid grouped by Category */}
      <div className="space-y-8">
        {Object.entries(categories).map(([catName, projList]) => (
          <div key={catName} className="space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">
              {catName} ({projList.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projList.map((proj) => {
                const projectTasks = tasks.filter((t) => t.projectId === proj.id)
                const completedCount = projectTasks.filter((t) => t.status === 'done').length
                
                return (
                  <Card
                    key={proj.id}
                    className="hover:shadow-md transition-all duration-200 border-border cursor-pointer group flex flex-col justify-between"
                    onClick={() => router.push(`/projects/${proj.id}`)}
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                            {getProjectIcon(proj.icon)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate text-foreground group-hover:underline">
                              {proj.name}
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              {proj.id}
                            </p>
                          </div>
                        </div>

                        {/* Pin trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePinProject(proj.id)
                          }}
                          className={`h-7 w-7 rounded-full flex items-center justify-center border hover:bg-muted transition-all cursor-pointer ${
                            proj.isPinned ? 'text-primary bg-primary/10 border-primary/20' : 'text-muted-foreground border-border'
                          }`}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">
                        {proj.description}
                      </p>

                      {/* Progress widget */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                          <span>Issues Completed</span>
                          <span>
                            {completedCount} / {projectTasks.length} ({proj.progress}%)
                          </span>
                        </div>
                        <Progress value={proj.progress} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <FolderKanban className="h-10 w-10 text-muted-foreground/30 stroke-[1.25px]" />
            <p>No projects match your current search queries.</p>
            <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>Clear Query</Button>
          </div>
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <Card className="w-full max-w-md relative z-10 border-border">
            <CardHeader className="flex flex-row justify-between items-center border-b px-5 py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                Create New Project Hub
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <form onSubmit={handleCreateProject}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="projName">Project Name</Label>
                  <input
                    id="projName"
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Stripe Sync Bridge"
                    className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="projDesc">Short Description</Label>
                  <textarea
                    id="projDesc"
                    required
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Provide context and high-level project goals..."
                    rows={3}
                    className="w-full bg-muted/40 border text-sm p-3 rounded-lg outline-none resize-none text-foreground border-border placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="projCat">Category / Department</Label>
                    <select
                      id="projCat"
                      value={projCat}
                      onChange={(e) => setProjCat(e.target.value)}
                      className="w-full bg-background border rounded-lg text-xs px-3 py-2 text-foreground outline-none border-border"
                    >
                      <option value="Core Engineering">Core Engineering</option>
                      <option value="Design System">Design System</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="projIcon">Icon Profile</Label>
                    <select
                      id="projIcon"
                      value={projIcon}
                      onChange={(e) => setProjIcon(e.target.value)}
                      className="w-full bg-background border rounded-lg text-xs px-3 py-2 text-foreground outline-none border-border"
                    >
                      <option value="Briefcase">💼 Briefcase</option>
                      <option value="Paintbrush">🎨 Paintbrush</option>
                      <option value="Smartphone">📱 Smartphone</option>
                      <option value="CreditCard">💳 CreditCard</option>
                      <option value="Megaphone">📢 Megaphone</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Create Project
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
