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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Your Tutors</h1>
          <p className="text-sm text-muted-foreground mt-2">Select or create a tutor</p>
        </div>
        <TutorGrid tutors={tutors ?? []} />
        <div className="flex justify-center">
          <form action="/api/auth/signout" method="POST">
            <button className="glass-fab-pill text-muted-foreground !text-xs cursor-pointer">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
