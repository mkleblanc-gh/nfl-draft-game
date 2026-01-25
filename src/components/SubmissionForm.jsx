import { useState } from 'react'
import { submitPrediction } from '../utils/api'

function SubmissionForm({ playerName, setPlayerName, picks, teamSelections, tradesUp, tradesDown, onSubmitSuccess }) {
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
          college: player?.college || '',
          predictedTeam: teamSelections?.[index] || null // Include custom team prediction if set
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
    <div className="bg-dark-100 rounded-lg shadow-md p-3">
      <h2 className="text-lg font-bold text-white mb-3">Submit Your Predictions</h2>

      {success && (
        <div className="mb-3 p-3 bg-green-900/50 border-l-4 border-green-500 text-green-200 rounded text-sm">
          <p className="font-bold">Success!</p>
          <p>Your predictions have been submitted. Good luck!</p>
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded text-sm">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="playerName" className="block text-xs font-medium text-gray-300 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 text-sm bg-dark-200 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white placeholder-gray-500"
            disabled={submitting || success}
          />
        </div>

        <div className="bg-dark-200 p-3 rounded-lg">
          <h3 className="font-semibold text-sm text-white mb-2">Summary</h3>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Draft picks selected:</span>
              <span className={filledPicks === 32 ? 'text-green-400 font-semibold' : 'text-red-400'}>
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
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-colors ${
            submitting || success
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-secondary hover:bg-blue-700'
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
