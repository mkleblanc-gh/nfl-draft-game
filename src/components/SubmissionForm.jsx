import { useState } from 'react'
import { submitPrediction } from '../utils/api'

function SubmissionForm({ playerName, setPlayerName, picks, tradesUp, tradesDown, onSubmitSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateSubmission = () => {
    if (!playerName.trim()) {
      return 'Please enter your name'
    }

    const filledPicks = picks.filter(p => p !== null).length
    if (filledPicks < 32) {
      return `Please complete all 32 picks (${filledPicks}/32 selected)`
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateSubmission()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const submission = {
        name: playerName.trim(),
        picks: picks.map((player, index) => ({
          pick: index + 1,
          playerName: player?.name || '',
          position: player?.position || '',
          college: player?.college || ''
        })),
        tradesUp: tradesUp.filter(t => t !== ''),
        tradesDown: tradesDown.filter(t => t !== ''),
        timestamp: new Date().toISOString()
      }

      console.log('Submitting:', submission) // Debug log

      await submitPrediction(submission)
      setSuccess(true)
      setError('')

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })

      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (err) {
      console.error('Submission error:', err)
      setError(err.response?.data?.error || 'Failed to submit prediction. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filledPicks = picks.filter(p => p !== null).length

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit Your Predictions</h2>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          <p className="font-bold">Success!</p>
          <p>Your predictions have been submitted. Good luck!</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting || success}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Draft picks selected:</span>
              <span className={filledPicks === 32 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                {filledPicks} / 32
              </span>
            </div>
            <div className="flex justify-between">
              <span>Teams trading up:</span>
              <span>{tradesUp.filter(t => t !== '').length} / 3</span>
            </div>
            <div className="flex justify-between">
              <span>Teams trading down:</span>
              <span>{tradesDown.filter(t => t !== '').length} / 3</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || success}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            submitting || success
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-secondary hover:bg-blue-600'
          }`}
        >
          {submitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Predictions'}
        </button>

        {!success && (
          <p className="text-xs text-gray-500 text-center">
            You can submit multiple times. Your latest submission will be used.
          </p>
        )}
      </form>
    </div>
  )
}

export default SubmissionForm
