import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubmissionForm from '@/components/SubmissionForm'

export default async function SubmitPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Submit an entry</h1>
      <SubmissionForm userId={user.id} />
    </main>
  )
}
