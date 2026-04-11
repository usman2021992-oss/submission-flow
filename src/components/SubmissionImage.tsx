'use client'

import { useState } from 'react'

interface SubmissionImageProps {
  src: string
  alt: string
}

export default function SubmissionImage({ src, alt }: SubmissionImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-xs">—</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-10 h-10 rounded object-cover border border-gray-200"
    />
  )
}
