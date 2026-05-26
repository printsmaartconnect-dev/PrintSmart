'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function FeedbackButton() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    rating: 0
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get user ID from localStorage or session
      const userStr = localStorage.getItem('customerSession')
      const userId = userStr ? JSON.parse(userStr).userId : null

      if (!userId) {
        alert(t('Please log in to submit feedback'))
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject: formData.subject,
          message: formData.message,
          rating: formData.rating || null
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ subject: '', message: '', rating: 0 })
        setTimeout(() => {
          setSubmitted(false)
          setIsOpen(false)
        }, 2000)
      } else {
        alert(t('Failed to submit feedback'))
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert(t('Error submitting feedback'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all hover:scale-110"
        aria-label={t("Feedback & Help")}
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline text-sm font-semibold">{t('Feedback & Help')}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('Feedback & Help')}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-4xl mb-2">✓</div>
                <p className="text-gray-700 font-semibold">{t('Thank you for your feedback!')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('We appreciate your input')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Subject')}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t('e.g., Quality Issue, Feature Request')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Message')}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('Tell us what you think...')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Rate your experience (optional)')}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`text-2xl transition-transform hover:scale-125 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {loading ? t('Submitting...') : t('Submit Feedback')}
                </button>

                {/* Link to external form */}
                <div className="text-center text-xs text-gray-500 border-t pt-3 mt-3">
                  <p>{t('Need more help?')}</p>
                  <a
                    href="https://forms.gle/VBK48SwGSWm7prgUA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {t('Visit Help Center')}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
