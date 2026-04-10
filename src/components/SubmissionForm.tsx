'use client'

import { useState, useCallback, KeyboardEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import ImageUploader from '@/components/ImageUploader'
import StatusBadge from '@/components/StatusBadge'
import type { SubmissionType } from '@/types'
import Link from 'next/link'

interface SubmissionFormProps {
  userId: string
}

interface SuccessData {
  id: string
}

const SUBMISSION_TYPES: { type: SubmissionType; label: string; description: string }[] = [
  { type: 'A', label: 'Type A', description: 'Standard entry' },
  { type: 'B', label: 'Type B', description: 'Featured entry' },
]

export default function SubmissionForm({ userId }: SubmissionFormProps) {
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessData | null>(null)

  const handleFileSelect = useCallback((file: File | null) => {
    setImageFile(file)
  }, [])

  const handleTypeSelect = (type: SubmissionType) => {
    setSubmissionType(type)
  }

  const handleTypeKeyDown = (e: KeyboardEvent<HTMLDivElement>, type: SubmissionType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSubmissionType(type)
    }
  }

  const isFormValid =
    submissionType !== null && imageFile !== null && identifier.trim().length > 0

  const handleSubmit = async () => {
    if (!isFormValid || !imageFile || !submissionType) return

    setIsSubmitting(true)
    setSubmitError(null)

    const supabase = createClient()

    try {
      // Generate unique file path: {user_id}/{uuid}.{ext}
      const ext = imageFile.name.split('.').pop() ?? 'jpg'
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('submission-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('[SubmissionForm upload]:', uploadError)
        setSubmitError('Image upload failed. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('submission-images')
        .getPublicUrl(filePath)

      const imageUrl = urlData.publicUrl

      // Insert into submissions table
      const { data: submission, error: insertError } = await supabase
        .from('submissions')
        .insert({
          user_id: userId,
          identifier: identifier.trim(),
          submission_type: submissionType,
          image_url: imageUrl,
          image_path: filePath,
          status: 'pending',
          points: 0,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[SubmissionForm insert]:', insertError)
        // Attempt to clean up uploaded file
        await supabase.storage.from('submission-images').remove([filePath])
        setSubmitError('Submission could not be saved. Please try again.')
        setIsSubmitting(false)
        return
      }

      setSuccess({ id: submission.id })
    } catch (err) {
      console.error('[SubmissionForm unexpected]:', err)
      setSubmitError('Connection error. Check your internet and try again.')
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmissionType(null)
    setImageFile(null)
    setIdentifier('')
    setSubmitError(null)
    setSuccess(null)
    setIsSubmitting(false)
  }

  if (success) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">Submission received</h2>
        <p className="text-gray-500 text-sm mb-4">
          Your entry is in review. You&apos;ll be notified when it&apos;s approved.
        </p>

        <p className="font-mono text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 inline-block mb-4">
          ID: {success.id}
        </p>

        <div className="flex items-center justify-center mb-6">
          <StatusBadge status="pending" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Submit another
          </button>
          <span className="text-gray-300 hidden sm:block">|</span>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all submissions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Submission Type */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Submission type</h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          role="radiogroup"
          aria-label="Submission type"
        >
          {SUBMISSION_TYPES.map(({ type, label, description }) => {
            const isSelected = submissionType === type
            return (
              <div
                key={type}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => handleTypeSelect(type)}
                onKeyDown={(e) => handleTypeKeyDown(e, type)}
                className={`
                  cursor-pointer rounded-lg border-2 p-4 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section 2: Image Upload */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Image</h2>
        <ImageUploader onFileSelect={handleFileSelect} />
      </section>

      {/* Section 3: Identifier */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Identifier</h2>
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
            Identifier
          </label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            maxLength={40}
            placeholder="e.g. 12345 or CARD-A"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {identifier.length} / 40
          </p>
        </div>
      </section>

      {/* Submit Error */}
      {submitError && (
        <div aria-live="polite">
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
            {submitError}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        aria-disabled={!isFormValid || isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Saving...
          </>
        ) : (
          'Submit entry'
        )}
      </button>
    </div>
  )
}
