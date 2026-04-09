'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Tutor } from '@/types/database'

export function TutorGrid({ tutors: initialTutors }: { tutors: Tutor[] }) {
  const [tutors, setTutors] = useState(initialTutors)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function createTutor() {
    if (!newName.trim()) return
    setCreating(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('tutors')
      .insert({ name: newName.trim(), user_id: user.id })
      .select()
      .single()

    if (data && !error) {
      setTutors([data, ...tutors])
      setNewName('')
    }
    setCreating(false)
  }

  async function deleteTutor(id: string) {
    await supabase.from('tutors').delete().eq('id', id)
    setTutors(tutors.filter(t => t.id !== id))
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Create new tutor card */}
      <div className="rounded-xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center min-h-[180px] hover:border-primary/50 transition-colors">
        <div className="space-y-3 w-full">
          <input
            type="text"
            placeholder="New tutor name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createTutor()}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
          />
          <button
            onClick={createTutor}
            disabled={creating || !newName.trim()}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {creating ? 'Creating...' : '+ Create Tutor'}
          </button>
        </div>
      </div>

      {/* Tutor cards */}
      {tutors.map((tutor) => (
        <div
          key={tutor.id}
          className="group rounded-xl border border-border bg-card p-6 min-h-[180px] flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
          onClick={() => router.push(`/tutor/${tutor.id}`)}
        >
          <div>
            <h3 className="text-lg font-semibold truncate">{tutor.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(tutor.created_at).toLocaleDateString()}
            </p>
            {tutor.soul_md && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {tutor.soul_md.slice(0, 100)}
              </p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Delete this tutor?')) deleteTutor(tutor.id)
              }}
              className="text-xs text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
