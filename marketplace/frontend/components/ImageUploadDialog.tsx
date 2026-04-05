'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'

interface ImageUploadDialogProps {
  open: boolean
  currentImage?: string
  onClose: () => void
  onSelect: (imageUrl: string) => void
  onRemove?: () => void
}

export default function ImageUploadDialog({
  open,
  currentImage,
  onClose,
  onSelect,
  onRemove,
}: ImageUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState(currentImage || '')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setPreview(currentImage || '')
  }, [currentImage, open])

  if (!open) {
    return null
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      return
    }

    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPreview(dataUrl)
      onSelect(dataUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900">Upload Product Image</h3>
            <p className="mt-1 text-sm text-neutral-600">Use a product photo for the catalog card and product table.</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6">
          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-white">
            {preview ? (
              <img src={preview} alt="Product preview" className="h-full max-h-64 w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center text-neutral-500">
                <ImagePlus className="h-10 w-10" />
                <p className="text-sm">No image selected yet</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-700"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Choose Image'}
            </button>
            {preview && onRemove && (
              <button
                type="button"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
                onClick={() => {
                  setPreview('')
                  onRemove()
                }}
              >
                Remove Image
              </button>
            )}
            <button
              type="button"
              className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
              onClick={onClose}
            >
              Done
            </button>
          </div>
          <p className="mt-3 text-xs text-neutral-500">Accepted: image files up to 2MB. The image is stored directly with the product for now.</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
