'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown, Plus, Minus, Maximize2, Rotate3D, ArrowLeft } from 'lucide-react'

export default function ConfigurationPage() {
  const router = useRouter()
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [documents, setDocuments] = useState([])
  const [multiConfigs, setMultiConfigs] = useState([])

  const defaultConfig = {
    printType: 'bw',
    copies: 2,
    paperSize: 'A4',
    pages: 'all',
    sides: 'single',
    orientation: 'portrait',
  }
  const [config, setConfig] = useState({
    ...defaultConfig,
  })

  useEffect(() => {
    const uploadedFilesRaw = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
    const uploadedFiles = Array.isArray(uploadedFilesRaw) ? uploadedFilesRaw : []
    setDocuments(uploadedFiles)

    if (uploadedFiles.length > 1) {
      setMultiConfigs(
        uploadedFiles.map(() => ({ ...defaultConfig, identityName: '' }))
      )
    }
  }, [])

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleContinue = () => {
    if (documents.length > 1) {
      const payload = multiConfigs.map((c, i) => ({
        ...defaultConfig,
        ...c,
        fileName: documents[i] || `Document ${i + 1}`,
        identityName: (c?.identityName || '').trim(),
      }))
      localStorage.setItem('printConfig', JSON.stringify(payload))
    } else {
      localStorage.setItem('printConfig', JSON.stringify(config))
    }
    router.push('/customer/review')
  }

  const handleDirectTalk = () => {
    // For now always redirect to My Orders & Scratch page.
    router.push('/customer/orders')
  }

  const handleMultiConfigChange = (docIndex, key, value) => {
    setMultiConfigs((prev) =>
      prev.map((c, i) => (i === docIndex ? { ...c, [key]: value } : c))
    )
  }

  const effectiveDocCount = documents.length > 0 ? documents.length : 1

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mb-8">
        <div className="step-header">
          <div className="step-number">4</div>
          <div>
            <h1 className="text-3xl font-bold text-black">Print Configuration</h1>
            <p className="text-gray-600">Choose your print options and preferences.</p>
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
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleDirectTalk}
          className="w-full py-3 px-4 rounded-xl font-semibold transition text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
        >
          Directly Talk with Shopkeeper
        </button>

        <button
          type="button"
          onClick={() => setShowPrintOptions(true)}
          className={`w-full mt-4 py-3 px-4 rounded-xl font-semibold transition border-2 ${
            showPrintOptions
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100'
          }`}
        >
          Print Options
        </button>

        {showPrintOptions && (
          <>
            <h3 className="text-2xl font-bold text-black text-center mt-8 mb-8">Print Options</h3>

            {effectiveDocCount > 1 ? (
              <div className="space-y-6">
                {(documents.length > 0 ? documents : Array.from({ length: effectiveDocCount })).map(
                  (fileName, index) => {
                    const docConfig = multiConfigs[index] || { ...defaultConfig, identityName: '' }
                    return (
                      <div key={index} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="mb-4">
                          <p className="text-gray-900 font-bold truncate">
                            {typeof fileName === 'string' && fileName.trim().length > 0
                              ? fileName
                              : `Document ${index + 1}`}
                          </p>
                          <p className="text-gray-500 text-xs">Configure this document separately</p>
                        </div>

                        <div className="mb-5">
                          <label className="block text-gray-700 font-semibold mb-2">
                            Identity name (optional)
                          </label>
                          <input
                            value={docConfig.identityName || ''}
                            onChange={(e) =>
                              handleMultiConfigChange(index, 'identityName', e.target.value)
                            }
                            placeholder="e.g., Kid notes, Old receipt, Office file"
                            autoCorrect="on"
                            spellCheck={true}
                            autoCapitalize="words"
                            className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium cursor-text hover:border-gray-400 transition outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-6">
                          {/* Print Type */}
                          <div>
                            <label className="block text-gray-700 font-semibold mb-3">Print Type</label>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleMultiConfigChange(index, 'printType', 'bw')}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition border-2 ${
                                  docConfig.printType === 'bw'
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                              >
                                Black & White
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMultiConfigChange(index, 'printType', 'color')}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition border-2 ${
                                  docConfig.printType === 'color'
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                              >
                                Color
                              </button>
                            </div>
                          </div>

                          {/* Copies */}
                          <div>
                            <label className="block text-gray-700 font-semibold mb-3">Copies</label>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-lg w-fit border border-gray-200">
                              <button
                                type="button"
                                onClick={() =>
                                  handleMultiConfigChange(
                                    index,
                                    'copies',
                                    Math.max(1, (docConfig.copies || 2) - 1)
                                  )
                                }
                                className="p-2 hover:bg-gray-50 rounded transition"
                              >
                                <Minus size={20} className="text-gray-700" />
                              </button>
                              <span className="text-2xl font-bold text-gray-700 min-w-8 text-center">
                                {docConfig.copies || 2}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleMultiConfigChange(
                                    index,
                                    'copies',
                                    Math.min(99, (docConfig.copies || 2) + 1)
                                  )
                                }
                                className="p-2 hover:bg-gray-50 rounded transition"
                              >
                                <Plus size={20} className="text-gray-700" />
                              </button>
                            </div>
                          </div>

                          {/* Paper Size */}
                          <div>
                            <label className="block text-gray-700 font-semibold mb-3">Paper Size</label>
                            <select
                              value={docConfig.paperSize}
                              onChange={(e) =>
                                handleMultiConfigChange(index, 'paperSize', e.target.value)
                              }
                              className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 transition appearance-none"
                            >
                              <option>A4</option>
                              <option>A3</option>
                              <option>Legal</option>
                            </select>
                          </div>

                          {/* Pages */}
                          <div>
                            <label className="block text-gray-700 font-semibold mb-3">Pages to Print</label>
                            <select
                              value={docConfig.pages}
                              onChange={(e) => handleMultiConfigChange(index, 'pages', e.target.value)}
                              className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 transition appearance-none"
                            >
                              <option value="all">All Pages</option>
                              <option value="custom">Custom pages</option>
                            </select>
                          </div>

                          {/* Print Sides */}
                          <div>
                            <label className="block text-gray-700 font-semibold mb-3">Print Sides</label>
                            <select
                              value={docConfig.sides}
                              onChange={(e) => handleMultiConfigChange(index, 'sides', e.target.value)}
                              className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 transition appearance-none"
                            >
                              <option value="single">Single Side</option>
                              <option value="double">Double Side</option>
                            </select>
                          </div>

                          {/* Orientation */}
                          <div>
                            <label className="block text-gray-700 font-semibold mb-3">Orientation</label>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleMultiConfigChange(index, 'orientation', 'portrait')}
                                className={`flex-1 py-4 px-4 rounded-lg font-semibold transition border-2 flex items-center justify-center gap-2 ${
                                  docConfig.orientation === 'portrait'
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                              >
                                <Maximize2 size={20} />
                                Portrait
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMultiConfigChange(index, 'orientation', 'landscape')}
                                className={`flex-1 py-4 px-4 rounded-lg font-semibold transition border-2 flex items-center justify-center gap-2 ${
                                  docConfig.orientation === 'landscape'
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                              >
                                <Rotate3D size={20} />
                                Landscape
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Print Type */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Print Type</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleConfigChange('printType', 'bw')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition border-2 ${
                        config.printType === 'bw'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Black & White
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfigChange('printType', 'color')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition border-2 ${
                        config.printType === 'color'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Color
                    </button>
                  </div>
                </div>

                {/* Copies */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Copies</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg w-fit">
                    <button
                      type="button"
                      onClick={() =>
                        handleConfigChange('copies', Math.max(1, config.copies - 1))
                      }
                      className="p-2 hover:bg-white rounded transition"
                    >
                      <Minus size={20} className="text-gray-700" />
                    </button>
                    <span className="text-2xl font-bold text-gray-700 min-w-8 text-center">
                      {config.copies}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleConfigChange('copies', Math.min(99, config.copies + 1))
                      }
                      className="p-2 hover:bg-white rounded transition"
                    >
                      <Plus size={20} className="text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Paper Size */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Paper Size</label>
                  <select
                    value={config.paperSize}
                    onChange={(e) => handleConfigChange('paperSize', e.target.value)}
                    className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 transition appearance-none"
                  >
                    <option>A4</option>
                    <option>A3</option>
                    <option>Legal</option>
                  </select>
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Pages to Print</label>
                  <select
                    value={config.pages}
                    onChange={(e) => handleConfigChange('pages', e.target.value)}
                    className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 transition appearance-none"
                  >
                    <option value="all">All Pages</option>
                    <option value="custom">Custom pages</option>
                  </select>
                </div>

                {/* Print Sides */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Print Sides</label>
                  <select
                    value={config.sides}
                    onChange={(e) => handleConfigChange('sides', e.target.value)}
                    className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 transition appearance-none"
                  >
                    <option value="single">Single Side</option>
                    <option value="double">Double Side</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Orientation</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleConfigChange('orientation', 'portrait')}
                      className={`flex-1 py-4 px-4 rounded-lg font-semibold transition border-2 flex items-center justify-center gap-2 ${
                        config.orientation === 'portrait'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Maximize2 size={20} />
                      Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfigChange('orientation', 'landscape')}
                      className={`flex-1 py-4 px-4 rounded-lg font-semibold transition border-2 flex items-center justify-center gap-2 ${
                        config.orientation === 'landscape'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Rotate3D size={20} />
                      Landscape
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {showPrintOptions && (
          <button
            onClick={handleContinue}
            className="w-full gradient-button py-3 px-4 rounded-xl font-semibold transition mt-8 text-white"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  )
}