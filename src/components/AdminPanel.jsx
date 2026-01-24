import { useState, useEffect } from 'react'
import { submitDraftResults, toggleLock, calculateScores, getTeams, getPlayers } from '../utils/api'

function AdminPanel({ onUpdate }) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('results') // 'results', 'settings'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Draft results state
  const [draftResults, setDraftResults] = useState(Array(32).fill({ team: '', player: '' }))
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [searchTerms, setSearchTerms] = useState(Array(32).fill(''))
  const [showDropdown, setShowDropdown] = useState(Array(32).fill(false))

  // Settings state
  const [submissionsLocked, setSubmissionsLocked] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [teamsData, playersData] = await Promise.all([
        getTeams(),
        getPlayers()
      ])
      setTeams(teamsData)
      setPlayers(playersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // Simple check - the backend will do the real validation
    if (password) {
      setIsAuthenticated(true)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleResultChange = (index, field, value) => {
    const newResults = [...draftResults]
    newResults[index] = { ...newResults[index], [field]: value }
    setDraftResults(newResults)

    if (field === 'player') {
      const newSearchTerms = [...searchTerms]
      newSearchTerms[index] = value
      setSearchTerms(newSearchTerms)

      const newShowDropdown = [...showDropdown]
      newShowDropdown[index] = value.length > 0
      setShowDropdown(newShowDropdown)
    }
  }

  const selectPlayer = (index, playerName) => {
    const newResults = [...draftResults]
    newResults[index] = { ...newResults[index], player: playerName }
    setDraftResults(newResults)

    const newSearchTerms = [...searchTerms]
    newSearchTerms[index] = playerName
    setSearchTerms(newSearchTerms)

    const newShowDropdown = [...showDropdown]
    newShowDropdown[index] = false
    setShowDropdown(newShowDropdown)
  }

  const getFilteredPlayers = (searchTerm) => {
    if (!searchTerm) return []
    return players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10)
  }

  const handleSubmitResults = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const resultsToSubmit = draftResults
        .map((result, index) => ({
          pick: index + 1,
          team: result.team,
          player: result.player
        }))
        .filter(r => r.team && r.player)

      await submitDraftResults(password, resultsToSubmit)
      showMessage('success', 'Draft results submitted successfully!')

      // Auto-calculate scores after submitting results
      setTimeout(async () => {
        try {
          await calculateScores(password)
          showMessage('success', 'Scores calculated successfully!')
          if (onUpdate) onUpdate()
        } catch (err) {
          showMessage('error', 'Results saved but scoring failed. Use the Calculate Scores button.')
        }
      }, 1000)
    } catch (err) {
      console.error('Error submitting results:', err)
      if (err.response?.status === 401) {
        showMessage('error', 'Invalid password')
        setIsAuthenticated(false)
      } else {
        showMessage('error', err.response?.data?.error || 'Failed to submit results')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLock = async () => {
    setLoading(true)
    try {
      const newLockState = !submissionsLocked
      await toggleLock(password, newLockState)
      setSubmissionsLocked(newLockState)
      showMessage('success', `Submissions ${newLockState ? 'locked' : 'unlocked'} successfully!`)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error toggling lock:', err)
      if (err.response?.status === 401) {
        showMessage('error', 'Invalid password')
        setIsAuthenticated(false)
      } else {
        showMessage('error', 'Failed to toggle lock')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateScores = async () => {
    setLoading(true)
    try {
      await calculateScores(password)
      showMessage('success', 'Scores calculated successfully!')
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error calculating scores:', err)
      if (err.response?.status === 401) {
        showMessage('error', 'Invalid password')
        setIsAuthenticated(false)
      } else {
        showMessage('error', 'Failed to calculate scores')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-secondary text-white rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Panel</h2>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg border-l-4 ${
            message.type === 'success'
              ? 'bg-green-100 border-green-500 text-green-700'
              : 'bg-red-100 border-red-500 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'results'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Draft Results
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Draft Results Tab */}
      {activeTab === 'results' && (
        <form onSubmit={handleSubmitResults} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Enter the actual draft results below. Scores will be calculated automatically.
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {teams.map((team, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">
                    Pick {index + 1}: {team.name}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={draftResults[index]?.player || searchTerms[index]}
                    onChange={(e) => handleResultChange(index, 'player', e.target.value)}
                    placeholder="Player name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showDropdown[index] && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {getFilteredPlayers(searchTerms[index]).map((player) => (
                        <button
                          key={player.name}
                          type="button"
                          onClick={() => selectPlayer(index, player.name)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50"
                        >
                          {player.name} ({player.position})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  value={draftResults[index]?.team || ''}
                  onChange={(e) => handleResultChange(index, 'team', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Actual team...</option>
                  {teams.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-secondary text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Results & Calculate Scores'}
          </button>
        </form>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Submission Lock</h3>
            <p className="text-sm text-gray-600 mb-4">
              Lock submissions to prevent new entries (typically before the draft starts).
            </p>
            <button
              onClick={handleToggleLock}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium ${
                submissionsLocked
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } disabled:bg-gray-400`}
            >
              {submissionsLocked ? 'Unlock Submissions' : 'Lock Submissions'}
            </button>
            <div className="mt-2 text-sm">
              Status: <span className={submissionsLocked ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {submissionsLocked ? 'LOCKED' : 'OPEN'}
              </span>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Manual Score Calculation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Recalculate all scores based on current draft results.
            </p>
            <button
              onClick={handleCalculateScores}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-400"
            >
              Calculate Scores
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Admin Actions</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Lock submissions before the draft starts</li>
              <li>• Enter draft results as picks are made</li>
              <li>• Scores calculate automatically when results are submitted</li>
              <li>• Use manual calculation if needed to refresh scores</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
