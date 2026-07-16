'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTrackoStore } from '@/features/tracko/store/trackoStore'
import {
  Settings as SettingsIcon,
  User,
  Shield,
  CreditCard,
  Key,
  Layers,
  Slack,
  Github,
  Figma,
  Users,
  Bell,
  Trash2,
  Plus,
  CheckCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type SettingsTab =
  | 'profile'
  | 'workspace'
  | 'members'
  | 'billing'
  | 'api_keys'
  | 'integrations'
  | 'notifications'
  | 'security'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as SettingsTab | null
  
  const {
    workspace,
    members,
    currentUserId,
    updateWorkspace,
    generateApiKey,
    revokeApiKey,
    toggleIntegration
  } = useTrackoStore()

  const [activeTab, setActiveTab] = useState<SettingsTab>('workspace')
  const [keyName, setKeyName] = useState('')
  const [keyPerm, setKeyPerm] = useState('Read & Write')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('QA Engineer')
  
  // Profile settings local states
  const currentUser = members.find((m) => m.id === currentUserId)
  const [profName, setProfName] = useState(currentUser?.name || '')
  const [profEmail, setProfEmail] = useState(currentUser?.email || '')
  const [profRole, setProfRole] = useState(currentUser?.role || '')

  // Workspace settings local states
  const [workName, setWorkName] = useState(workspace.name)
  const [workUrl, setWorkUrl] = useState(workspace.url)
  const [workDesc, setWorkDesc] = useState(workspace.description)

  // Watch URL queries to shift settings tab dynamically
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    alert('User Profile updated successfully!')
  }

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    updateWorkspace({
      name: workName.trim(),
      url: workUrl.trim(),
      description: workDesc.trim()
    })
    alert('Workspace details updated!')
  }

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyName.trim()) {
      generateApiKey(keyName.trim(), keyPerm)
      setKeyName('')
    }
  }

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteEmail.trim()) {
      alert(`An invite was dispatched to ${inviteEmail} under the role: ${inviteRole}`)
      setInviteEmail('')
    }
  }

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Account security credentials updated!')
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'workspace', label: 'Workspace Details', icon: SettingsIcon },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'members', label: 'Members & Roles', icon: Users },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'api_keys', label: 'Developer API Keys', icon: Key },
    { id: 'integrations', label: 'Integrations Hub', icon: Layers },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
    { id: 'security', label: 'Account Security', icon: Shield }
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-muted-foreground animate-spin-slow" />
          Settings Panel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure profile properties, integrations settings, billing tiers, and API credentials.
        </p>
      </div>

      {/* Settings layout: Side menu and detailed form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Navigation Menu */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col space-y-0.5 border rounded-lg p-2 bg-muted/10 shrink-0 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  router.push(`/settings?tab=${tab.id}`)
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="md:col-span-8 lg:col-span-9">
          
          {/* TAB 1: WORKSPACE */}
          {activeTab === 'workspace' && (
            <Card className="border-border">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-sm font-semibold text-foreground">Workspace Configuration</CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdateWorkspace}>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="workName">Workspace Name</Label>
                    <input
                      id="workName"
                      type="text"
                      required
                      value={workName}
                      onChange={(e) => setWorkName(e.target.value)}
                      className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="workUrl">Workspace URL Domain</Label>
                    <div className="flex items-center rounded-lg border bg-muted/20 border-border overflow-hidden">
                      <span className="text-xs text-muted-foreground px-3 py-2 select-none border-r shrink-0">https://</span>
                      <input
                        id="workUrl"
                        type="text"
                        required
                        value={workUrl}
                        onChange={(e) => setWorkUrl(e.target.value)}
                        className="w-full bg-transparent text-sm px-3 py-2 outline-none text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="workDesc">Workspace Description</Label>
                    <textarea
                      id="workDesc"
                      value={workDesc}
                      onChange={(e) => setWorkDesc(e.target.value)}
                      rows={4}
                      className="w-full bg-muted/40 border text-sm p-3 rounded-lg outline-none resize-none text-foreground border-border"
                    />
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <Button type="submit" size="sm">Save Configuration</Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <Card className="border-border">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-sm font-semibold text-foreground">Personal Profile Options</CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-14 w-14 rounded-full border bg-muted flex items-center justify-center font-bold text-lg text-foreground shrink-0">
                      {currentUser?.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Workspace Avatar</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">JPG or PNG formats under 2MB size.</p>
                      <Button variant="outline" size="sm" type="button" className="h-7 text-[10px] mt-1.5 border-border">Upload Logo</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="profName">Display Name</Label>
                      <input
                        id="profName"
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="profRole">Designation / Role Title</Label>
                      <input
                        id="profRole"
                        type="text"
                        required
                        value={profRole}
                        onChange={(e) => setProfRole(e.target.value)}
                        className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profEmail">Primary Contact Email</Label>
                    <input
                      id="profEmail"
                      type="email"
                      required
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                    />
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <Button type="submit" size="sm">Save Profile</Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}

          {/* TAB 3: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-foreground">Invite New Teammate</CardTitle>
                </CardHeader>
                <form onSubmit={handleInviteMember}>
                  <CardContent className="p-5 flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="flex-1 bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border placeholder:text-muted-foreground"
                    />
                    
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="bg-background border rounded-lg text-xs px-3.5 py-2 text-foreground outline-none border-border"
                    >
                      <option value="Frontend Architect">Frontend Architect</option>
                      <option value="Lead Product Designer">Lead Product Designer</option>
                      <option value="Backend Lead">Backend Lead</option>
                      <option value="QA Engineer">QA Engineer</option>
                    </select>

                    <Button type="submit" size="sm" className="h-9">
                      <Plus className="h-4 w-4 mr-1" /> Invite
                    </Button>
                  </CardContent>
                </form>
              </Card>

              {/* Members Registry table */}
              <Card className="border-border">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-foreground">Active Team Members ({members.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b bg-muted/40 font-bold text-muted-foreground">
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Presence</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-muted/20">
                          <td className="px-6 py-3.5 flex items-center gap-3">
                            <Avatar className="h-6 w-6 border shrink-0">
                              <AvatarFallback className="text-[8px] font-bold bg-muted text-foreground">{m.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{m.name}</p>
                              <p className="text-[9px] text-muted-foreground">{m.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-muted-foreground">{m.role}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                              m.presence === 'online' ? 'text-emerald-500' : m.presence === 'away' ? 'text-amber-500' : 'text-muted-foreground'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                m.presence === 'online' ? 'bg-emerald-500' : m.presence === 'away' ? 'bg-amber-500' : 'bg-muted-foreground/30'
                              }`} />
                              {m.presence}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs border-border" disabled={m.id === currentUserId}>Remove</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">Workspace Tier: {workspace.billingPlan} Plan</h3>
                    <p className="text-xs text-muted-foreground">Premium capabilities activated. Seat based pricing billed monthly.</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-border">Manage Portal</Button>
                </CardContent>
              </Card>

              {/* Invoices list */}
              <Card className="border-border">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-foreground">Billing Receipts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40 font-bold text-muted-foreground">
                        <th className="px-6 py-3">Billing Cycle</th>
                        <th className="px-6 py-3">Total Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-muted/20">
                        <td className="px-6 py-3.5 text-foreground font-semibold">Jul 1, 2026</td>
                        <td className="px-6 py-3.5 text-muted-foreground">$120.00</td>
                        <td className="px-6 py-3.5 text-emerald-500 font-semibold flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Settled</td>
                        <td className="px-6 py-3.5 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs border-border">PDF</Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="px-6 py-3.5 text-foreground font-semibold">Jun 1, 2026</td>
                        <td className="px-6 py-3.5 text-muted-foreground">$120.00</td>
                        <td className="px-6 py-3.5 text-emerald-500 font-semibold flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Settled</td>
                        <td className="px-6 py-3.5 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs border-border">PDF</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 5: API KEYS */}
          {activeTab === 'api_keys' && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-foreground">Generate API Sync Key</CardTitle>
                </CardHeader>
                <form onSubmit={handleGenerateKey}>
                  <CardContent className="p-5 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      required
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="e.g. NextJS build webhook"
                      className="flex-1 bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border placeholder:text-muted-foreground"
                    />

                    <select
                      value={keyPerm}
                      onChange={(e) => setKeyPerm(e.target.value)}
                      className="bg-background border rounded-lg text-xs px-3.5 py-2 text-foreground outline-none border-border shrink-0"
                    >
                      <option value="Read & Write">Read & Write</option>
                      <option value="Read Only">Read Only</option>
                    </select>

                    <Button type="submit" size="sm" className="h-9">
                      <Plus className="h-4 w-4 mr-1" /> Generate
                    </Button>
                  </CardContent>
                </form>
              </Card>

              {/* API list cards */}
              <Card className="border-border">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-foreground">Active API Tokens ({workspace.apiKeys.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {workspace.apiKeys.map((keyObj, idx) => (
                      <div key={idx} className="flex justify-between items-center px-6 py-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-foreground">{keyObj.name}</h4>
                          <p className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded border inline-block select-all">
                            {keyObj.key}
                          </p>
                          <span className="text-[9px] text-muted-foreground block">Generated: {keyObj.createdAt} | Perms: {keyObj.permissions}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeApiKey(keyObj.key)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workspace.integrations.map((item) => (
                <Card key={item.id} className="border-border hover:shadow-sm transition select-none">
                  <CardContent className="p-5 flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                      {item.id === 'slack' && <Slack className="h-5 w-5 text-pink-500" />}
                      {item.id === 'github' && <Github className="h-5 w-5 text-foreground" />}
                      {item.id === 'figma' && <Figma className="h-5 w-5 text-orange-500" />}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{item.name}</h4>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{item.id} Hook</span>
                        </div>
                        
                        {/* Switch mock toggling */}
                        <button
                          onClick={() => toggleIntegration(item.id)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                            item.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-background transition-transform ${
                            item.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <Card className="border-border">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-sm font-semibold text-foreground">Alert Preferences Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="notif-1" defaultChecked className="mt-1" />
                    <label htmlFor="notif-1" className="text-xs text-foreground/80 cursor-pointer">
                      <strong>Issue Assignments:</strong> Receive internal alerts and emails when assigned to new tasks.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="notif-2" defaultChecked className="mt-1" />
                    <label htmlFor="notif-2" className="text-xs text-foreground/80 cursor-pointer">
                      <strong>Comments & Mentions:</strong> Trigger alerts when mentioned or replied in issue comment threads.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="notif-3" className="mt-1" />
                    <label htmlFor="notif-3" className="text-xs text-foreground/80 cursor-pointer">
                      <strong>Daily Summary Digests:</strong> Dispatch a summary email containing remaining sprint days and active milestones.
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button size="sm" onClick={() => alert('Preferences saved!')}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 8: SECURITY */}
          {activeTab === 'security' && (
            <Card className="border-border max-w-xl">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-sm font-semibold text-foreground">Reset Account Password</CardTitle>
              </CardHeader>
              <form onSubmit={handleSaveSecurity}>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="oldPass">Current Password</Label>
                    <input
                      id="oldPass"
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPass">New Password</Label>
                      <input
                        id="newPass"
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPass">Confirm Password</Label>
                      <input
                        id="confirmPass"
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-muted/40 border text-sm px-3 py-2 rounded-lg outline-none text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <Button type="submit" size="sm">Modify Password</Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}

        </div>
      </div>

    </div>
  )
}
