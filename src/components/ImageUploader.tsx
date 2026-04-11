'use client'

import { useRef, useState, useCallback, useEffect, DragEvent, ChangeEvent } from 'react'

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void
  error?: string
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImageUploader({ onFileSelect, error }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null)
      if (!file.type.startsWith('image/')) {
        setValidationError('Only image files are allowed (JPG, PNG, WEBP).')
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setValidationError('File size must be 5MB or less.')
        return
      }
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setSelectedFile(file)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setSelectedFile(null)
    setValidationError(null)
    onFileSelect(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayError = validationError ?? error

  return (
    <div>
      <div
        role="button"
        aria-label="Upload image"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'}
          ${displayError ? 'border-red-300' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        {preview && selectedFile ? (
          <div className="p-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full object-cover rounded max-h-60"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <svg
              className="w-10 h-10 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">Click to upload or drag &amp; drop</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP · max 5MB</p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span className="truncate max-w-xs">{selectedFile.name} ({formatBytes(selectedFile.size)})</span>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-2 text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
          >
            Remove image
          </button>
        </div>
      )}

      {displayError && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}
