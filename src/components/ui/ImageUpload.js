// src/components/ui/ImageUpload.js
'use client'
import { useState } from 'react'
import { useCloudinaryUpload } from '@/lib/hooks/useCloudinary'

export default function ImageUpload({ onUploadComplete, multiple = false }) {
  const [preview, setPreview] = useState([])
  const { uploadImage, uploadMultipleImages, uploading, error } = useCloudinaryUpload()

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    
    // Crear previews
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setPreview(previews)

    try {
      let results
      if (multiple) {
        results = await uploadMultipleImages(files)
      } else {
        results = await uploadImage(files[0])
      }
      
      onUploadComplete?.(results)
    } catch (err) {
      console.error('Upload error:', err)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 dark:text-gray-400 
                   file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                   file:text-sm file:font-semibold 
                   file:bg-blue-50 file:text-blue-700 
                   hover:file:bg-blue-100 
                   dark:file:bg-blue-900/20 dark:file:text-blue-400 
                   dark:hover:file:bg-blue-900/30
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      {uploading && (
        <p className="text-blue-600 dark:text-blue-400">Subiendo imagen(es)...</p>
      )}
      
      {error && (
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      )}
      
      {preview.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {preview.map((item, index) => (
            <img
              key={index}
              src={item.preview}
              alt={`Preview ${index}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
          ))}
        </div>
      )}
    </div>
  )
}