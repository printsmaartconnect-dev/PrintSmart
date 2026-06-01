'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Minus, Maximize2, Rotate3d, Layout, Check, Settings, FileText } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import FilePreviewSection from '../../components/customer/FilePreviewSection'

const PAPER_SIZES = ['A4', 'A3', 'A5', 'Legal', 'Letter', 'Executive', 'Ledger', 'Tabloid']
export default function ConfigurationPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const userId = searchParams.get('userId')
  const isShopkeeper = searchParams.get('shopkeeperAddOrder') === 'true'

  const [uploadedFiles, setUploadedFiles] = useState([])
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(isShopkeeper)

  const defaultConfig = {
    printType: 'BW',
    copies: 1,
    paperSize: 'A4',
    sides: 'SINGLE',
    orientation: 'PORTRAIT',
    pageRange: 'all'
  }

  useEffect(() => {
    // Load uploaded files from session/localStorage
    const filesStr = localStorage.getItem('uploadedFiles')
    if (filesStr) {
      try {
        const files = JSON.parse(filesStr)
        setUploadedFiles(files)
        setConfigs(files.map(() => ({ ...defaultConfig })))
      } catch (err) {
        console.error('Error loading files:', err)
      }
    }
  }, [])

  useEffect(() => {
    if (isShopkeeper) {
      setShowConfig(true)
    }
  }, [isShopkeeper])

  const handleConfigChange = (docIndex, key, value) => {
    setConfigs(prev => 
      prev.map((cfg, idx) => 
        idx === docIndex ? { ...cfg, [key]: value } : cfg
      )
    )
  }

  const handleContinue = async () => {
    if (uploadedFiles.length === 0) {
      alert(t('No files uploaded. Please upload files first.'))
      let uploadUrl = `/customer/upload?shopId=${shopId}&userId=${userId}`
      if (isShopkeeper) {
        uploadUrl += `&shopkeeperAddOrder=true`
      }
      router.push(uploadUrl)
      return
    }

    setLoading(true)
    try {
      // Store configuration in localStorage
      const fileConfigs = uploadedFiles.map((file, idx) => ({
        ...file,
        config: configs[idx] || defaultConfig
      }))
      
      localStorage.setItem('printConfigurations', JSON.stringify(fileConfigs))

      // Redirect to review page with shop and user info
      let nextUrl = `/customer/review?shopId=${shopId}&userId=${userId}`
      if (isShopkeeper) {
        nextUrl += `&shopkeeperAddOrder=true`
      }
      router.push(nextUrl)
    } catch (err) {
      console.error('Error saving configuration:', err)
      alert(t('Error saving configuration'))
    } finally {
      setLoading(false)
    }
  }

  const handleTalkFirst = async () => {
    if (uploadedFiles.length === 0) {
      alert(t('No files uploaded. Please upload files first.'))
      let uploadUrl = `/customer/upload?shopId=${shopId}&userId=${userId}`
      if (isShopkeeper) {
        uploadUrl += `&shopkeeperAddOrder=true`
      }
      router.push(uploadUrl)
      return
    }

    setLoading(true)
    try {
      // Store configuration in localStorage with variant 'talk'
      const fileConfigs = uploadedFiles.map((file, idx) => ({
        ...file,
        variant: 'talk',
        config: configs[idx] || defaultConfig
      }))
      
      localStorage.setItem('printConfigurations', JSON.stringify(fileConfigs))

      // Redirect to review page with shop and user info
      let nextUrl = `/customer/review?shopId=${shopId}&userId=${userId}`
      if (isShopkeeper) {
        nextUrl += `&shopkeeperAddOrder=true`
      }
      router.push(nextUrl)
    } catch (err) {
      console.error('Error saving configuration:', err)
      alert(t('Error saving configuration'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <BackButton />
        <span className="text-sm font-semibold text-gray-600">{t('Step 5 of 6')}</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-brand">{t('Print Configuration')}</h1>
            <p className="text-gray-600">{t('Customize print settings for your files')}</p>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600 mb-4 font-semibold">{t('No files uploaded yet')}</p>
              <button
                onClick={() => router.push(`/customer/upload?shopId=${shopId}&userId=${userId}`)}
                className="gradient-button text-white font-semibold py-2.5 px-6 rounded-lg transition"
              >
                {t('Go to Upload Page')}
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Top Option Selector */}
              {!isShopkeeper && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleTalkFirst}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-violet-200 bg-violet-50/50 hover:bg-violet-50 text-violet-800 font-bold transition-all transform hover:scale-[1.01] shadow-sm text-center w-full focus:outline-none"
                  >
                    <span className="text-2xl mb-1.5">💬</span>
                    <span className="text-sm font-extrabold">{t('I Want to Talk with Shopkeeper First')}</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">{t('Skip layout configuration & talk directly')}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowConfig(!showConfig)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.01] text-center w-full focus:outline-none ${
                      showConfig 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md' 
                        : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/60 text-indigo-700/80 hover:text-indigo-800 shadow-sm'
                    }`}
                  >
                    <span className="text-2xl mb-1.5">⚙️</span>
                    <span className="text-sm font-extrabold">{t('I Want to Configure Print Layout')}</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">{t('Set copies, color options, paper size, etc.')}</span>
                  </button>
                </div>
              )}

              {showConfig && (
                <>
                  {/* File-wise Configuration */}
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="max-w-5xl mx-auto rounded-[36px] bg-white shadow-xl border border-purple-100 p-8 md:p-10 backdrop-blur-sm mb-8">
                      {/* Reusable File Preview Section */}
                      <FilePreviewSection
                        file={file}
                        thumbnailUrl={file.thumbnailUrl}
                        isBW={configs[idx]?.printType === 'BW'}
                        isLoading={false}
                      />

                      {/* Settings Title Header */}
                      <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <Settings size={20} className="text-indigo-600 animate-spin-slow" />
                          {t('Document {{num}} Settings', { num: idx + 1 })}
                        </h3>
                      </div>

                      {/* Configuration Options */}
                      <div className="space-y-5">
                        {/* Print Type */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Print Type')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'printType', 'BW')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.printType === 'BW'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('Black & White')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'printType', 'COLOR')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.printType === 'COLOR'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('🎨 Color')}
                            </button>
                          </div>
                        </div>

                        {/* Number of Copies */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Copies')}
                          </label>
                          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg w-fit border border-gray-200">
                            <button
                              type="button"
                              onClick={() =>
                                handleConfigChange(idx, 'copies', Math.max(1, (configs[idx]?.copies || 1) - 1))
                              }
                              className="p-2 hover:bg-gray-200 rounded transition"
                            >
                              <Minus size={20} className="text-gray-700" />
                            </button>
                            <input
                              type="number"
                              value={configs[idx]?.copies || 1}
                              onChange={(e) => handleConfigChange(idx, 'copies', Math.max(1, parseInt(e.target.value) || 1))}
                              min="1"
                              max="999"
                              className="w-16 text-center text-2xl font-bold text-gray-900 bg-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleConfigChange(idx, 'copies', Math.min(999, (configs[idx]?.copies || 1) + 1))
                              }
                              className="p-2 hover:bg-gray-200 rounded transition"
                            >
                              <Plus size={20} className="text-gray-700" />
                            </button>
                          </div>
                        </div>

                        {/* Paper Size */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Paper Size')}
                          </label>
                          <select
                            value={configs[idx]?.paperSize || 'A4'}
                            onChange={(e) => handleConfigChange(idx, 'paperSize', e.target.value)}
                            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {PAPER_SIZES.map(size => (
                              <option key={size} value={size}>{t(size)}</option>
                            ))}
                          </select>
                        </div>

                        {/* Print Sides */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Print Sides')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'sides', 'SINGLE')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.sides === 'SINGLE'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('Single-sided')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'sides', 'DOUBLE')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.sides === 'DOUBLE'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('Double-sided')}
                            </button>
                          </div>
                        </div>

                        {/* Orientation */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Orientation')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'orientation', 'PORTRAIT')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 flex items-center justify-center gap-2 ${
                                configs[idx]?.orientation === 'PORTRAIT'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <Maximize2 size={18} />
                              {t('Portrait')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'orientation', 'LANDSCAPE')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 flex items-center justify-center gap-2 ${
                                configs[idx]?.orientation === 'LANDSCAPE'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <Rotate3d size={18} />
                              {t('Landscape')}
                            </button>
                          </div>
                        </div>

                        {/* Print Quality removed per requirement */}

                        {/* Page Range */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Pages to Print')}
                          </label>
                          <select
                            value={configs[idx]?.pageRange || 'all'}
                            onChange={(e) => handleConfigChange(idx, 'pageRange', e.target.value)}
                            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="all">{t('All Pages')}</option>
                            <option value="custom">{t('Custom Pages')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons */}
                  <div className="max-w-md mx-auto space-y-3 pt-4">
                    <button
                      onClick={handleContinue}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition shadow-md"
                    >
                      {loading ? t('Saving Settings...') : t('Continue to Review →')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        let uploadUrl = `/customer/upload?shopId=${shopId}&userId=${userId}`
                        if (isShopkeeper) {
                          uploadUrl += `&shopkeeperAddOrder=true`
                        }
                        router.push(uploadUrl)
                      }}
                      className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-xl transition"
                    >
                      {t('Back to Upload')}
                    </button>
                  </div>
                </>
              )}

              {/* Reusable FeedbackLink */}
              <div className="max-w-md mx-auto text-center mt-4">
                <FeedbackLink />
              </div>
            </div>
          )}
        </div>
      </main>

      <FeedbackButton />
    </div>
  )
}