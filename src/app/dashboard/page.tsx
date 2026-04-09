import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TutorGrid } from '@/components/dashboard/tutor-grid'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: tutors } = await supabase
    .from('tutors')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Tutors</h1>
            <p className="text-muted-foreground mt-1">Create and manage your AI tutoring sessions</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Sign Out
            </button>
          </form>
        </div>
        <TutorGrid tutors={tutors ?? []} />
      </div>
    </div>
  )
}
