// src/lib/hooks/useCloudinary.js
import { useState } from 'react'

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const uploadImage = async (file, preset = 'products', folder = 'productos') => {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', preset)
      formData.append('folder', folder)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Error uploading image')
      }

      const data = await response.json()
      
      return {
        public_id: data.public_id,
        secure_url: data.secure_url,
        width: data.width,
        height: data.height,
        format: data.format,
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  const uploadMultipleImages = async (files, preset = 'products', folder = 'productos') => {
    const uploadPromises = Array.from(files).map(file => 
      uploadImage(file, preset, folder)
    )
    
    return Promise.all(uploadPromises)
  }

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    error,
  }
}