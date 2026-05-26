'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Cloud, X, FileText, ArrowLeft } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [documentName, setDocumentName] = useState('')

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  })

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleContinue = async () => {
    const name = documentName.trim()
    if (!name) return

    setUploading(true)
    const storedNames = files.length > 0 ? files.map((f) => f.name) : [name]
    const fileUrls = {}

    try {
      // Upload each file to the backend
      for (const file of files) {
        const formDataPayload = new FormData()
        formDataPayload.append('file', file)

        const response = await fetch('http://localhost:5000/api/files/upload', {
          method: 'POST',
          body: formDataPayload,
        })

        if (response.ok) {
          const result = await response.json()
          fileUrls[file.name] = result.fileUrl
        }
      }
      
      localStorage.setItem('uploadedFiles', JSON.stringify(storedNames))
      localStorage.setItem('uploadedFileUrls', JSON.stringify(fileUrls))
      router.push('/customer/configuration')
    } catch (err) {
      console.warn('Backend upload failed, continuing with mock upload flow:', err)
      localStorage.setItem('uploadedFiles', JSON.stringify(storedNames))
      localStorage.setItem('uploadedFileUrls', JSON.stringify({}))
      router.push('/customer/configuration')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mb-8">
        <div className="step-header">
          <div className="step-number">3</div>
          <div>
            <h1 className="text-3xl font-bold text-black">Upload Document</h1>
            <p className="text-gray-600">Upload your file (PDF, Image, Word, etc.)</p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-4xl p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="mac-dots">
              <div className="mac-dot red"></div>
              <div className="mac-dot yellow"></div>
              <div className="mac-dot green"></div>
            </div>
            <h2 className="text-xl font-bold text-black">Printsmart</h2>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        </div>

        <h3 className="text-2xl font-bold text-black text-center mb-2">Upload Document</h3>
        <p className="text-center text-gray-600 text-sm mb-1">Supported: PDF, JPG, PNG, Word</p>
        <p className="text-center text-gray-500 text-xs mb-6">(Testing mode: upload is optional)</p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 lg:p-12 text-center transition cursor-pointer ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Cloud size={48} className="mx-auto mb-4 text-blue-500" />
          <p className="text-gray-700 font-medium mb-1">Drag & Drop your file here</p>
          <p className="text-gray-500 text-sm mb-4">or</p>
          <button className="gradient-button py-2 px-6 text-sm text-white font-semibold">
            Choose File
          </button>
        </div>

        {/* Document Name (Required) */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Document name <span className="text-red-500">*</span>
          </label>
          <input
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="e.g., College Assignment, Resume, Project Report"
            autoCorrect="on"
            spellCheck={true}
            autoCapitalize="words"
            className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-700 font-medium outline-none focus:border-blue-500 transition"
          />
          <p className="mt-2 text-xs text-gray-500">Required to continue, even if you don’t upload a file.</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Uploaded Files:</p>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText size={24} className="text-red-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Security Message */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Your files are 100% secure and auto-deleted after printing.
        </p>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={documentName.trim().length === 0 || uploading}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition mt-6 ${
            documentName.trim().length > 0
              ? 'gradient-button'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}