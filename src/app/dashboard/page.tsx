import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import SubmissionImage from '@/components/SubmissionImage'
import type { SubmissionType } from '@/types'

export const revalidate = 0

const TYPE_LABELS: Record<SubmissionType, string> = {
  A: 'Type A',
  B: 'Type B',
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, identifier, submission_type, image_url, status, points, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) console.error('[Dashboard fetch]:', error)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your submissions</h1>
        <Link
          href="/submit"
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New entry
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-600">Failed to load submissions.</p>
          <a href="/dashboard" className="text-sm text-red-700 font-medium hover:underline">
            Refresh
          </a>
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-3">No submissions yet</p>
          <Link href="/submit" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Submit your first entry →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Image</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Identifier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Points</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {submission.image_url ? (
                        <SubmissionImage
                          src={submission.image_url}
                          alt={submission.identifier ?? 'submission'}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">—</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-800">{submission.identifier ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {TYPE_LABELS[submission.submission_type as SubmissionType] ?? submission.submission_type ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {submission.points != null ? submission.points : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(submission.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {submissions.length === 100 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Showing most recent 100 submissions.</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
