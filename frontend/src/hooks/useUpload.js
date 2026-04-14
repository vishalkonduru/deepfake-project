import { useState, useCallback } from 'react'
import client from '../api/client'

const MAX_SIZE_MB = 50
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi']
const ALLOWED_EXTS = ['.mp4', '.mov', '.avi']

function validateFile(file) {
  if (!file) return 'No file selected'

  const ext = '.' + file.name.split('.').pop().toLowerCase()
  const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext)
  if (!isValidType) {
    return `Invalid file type. Please upload an MP4, MOV, or AVI video.`
  }

  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > MAX_SIZE_MB) {
    return `File too large (${sizeMB.toFixed(1)}MB). Maximum size is ${MAX_SIZE_MB}MB.`
  }

  return null
}

export function useUpload() {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const selectFile = useCallback((selectedFile) => {
    setUploadError(null)
    const err = validateFile(selectedFile)
    if (err) {
      setFileError(err)
      setFile(null)
    } else {
      setFileError(null)
      setFile(selectedFile)
    }
  }, [])

  const clearFile = useCallback(() => {
    setFile(null)
    setFileError(null)
    setUploadError(null)
  }, [])

  const upload = useCallback(async (fileToUpload) => {
    const target = fileToUpload || file
    if (!target) return null

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', target)
      const { data } = await client.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.job_id
    } catch (err) {
      setUploadError(err.message)
      return null
    } finally {
      setUploading(false)
    }
  }, [file])

  return { file, fileError, uploading, uploadError, selectFile, clearFile, upload }
}
