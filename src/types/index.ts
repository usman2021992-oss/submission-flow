export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'verified'
export type SubmissionType = 'A' | 'B'

export interface Submission {
  id: string
  user_id: string
  identifier: string
  submission_type: SubmissionType
  image_url: string
  image_path: string
  status: SubmissionStatus
  points: number
  created_at: string
  updated_at: string
}

export interface SubmissionFormData {
  submissionType: SubmissionType | null
  imageFile: File | null
  identifier: string
}
