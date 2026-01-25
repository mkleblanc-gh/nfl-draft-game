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

  // Actual trades state
  const [actualTradesUp, setActualTradesUp] = useState(['', '', ''])
  const [actualTradesDown, setActualTradesDown] = useState(['', '', ''])

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

  const handleTradeChange = (type, index, value) => {
    if (type === 'up') {
      const newTrades = [...actualTradesUp]
      newTrades[index] = value
      setActualTradesUp(newTrades)
    } else {
      const newTrades = [...actualTradesDown]
      newTrades[index] = value
      setActualTradesDown(newTrades)
    }
  }

  const handleSubmitResults = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const resultsToSubmit = draftResults
        .map((result, index) => ({
          pick_number: index + 1,
          team_name: result.team,
          player_name: result.player
        }))
        .filter(r => r.team_name && r.player_name)

      const tradesUp = actualTradesUp.filter(t => t !== '')
      const tradesDown = actualTradesDown.filter(t => t !== '')

      await submitDraftResults(password, resultsToSubmit, tradesUp, tradesDown)
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
      <div className="bg-dark-100 rounded-lg shadow-md p-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-dark-200 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white placeholder-gray-500"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-secondary text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-dark-100 rounded-lg shadow-md p-3">
      <h2 className="text-lg font-bold text-white mb-3">Admin Panel</h2>

      {message.text && (
        <div
          className={`mb-3 p-3 rounded text-sm border-l-4 ${
            message.type === 'success'
              ? 'bg-green-900/30 border-green-500 text-green-200'
              : 'bg-red-900/30 border-red-500 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b border-dark-300">
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-2 px-3 text-sm font-medium transition-colors ${
            activeTab === 'results'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Draft Results
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-3 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Draft Results Tab */}
      {activeTab === 'results' && (
        <form onSubmit={handleSubmitResults} className="space-y-3">
          <p className="text-xs text-gray-400 mb-3">
            Enter the actual draft results below. Scores will be calculated automatically.
          </p>

          {/* Actual Trades Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-dark-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-white mb-2">Teams That Traded Up</h3>
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <select
                    key={index}
                    value={actualTradesUp[index]}
                    onChange={(e) => handleTradeChange('up', index, e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white"
                  >
                    <option value="">Team {index + 1}...</option>
                    {teams.map((team) => (
                      <option key={team.name} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
            <div className="bg-dark-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-white mb-2">Teams That Traded Down</h3>
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <select
                    key={index}
                    value={actualTradesDown[index]}
                    onChange={(e) => handleTradeChange('down', index, e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white"
                  >
                    <option value="">Team {index + 1}...</option>
                    {teams.map((team) => (
                      <option key={team.name} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </div>

          {/* Draft Picks */}
          <h3 className="text-sm font-semibold text-white">Pick Results</h3>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {teams.map((team, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-dark-200 rounded">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-white">
                    #{index + 1}: {team.name}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={draftResults[index]?.player || searchTerms[index]}
                    onChange={(e) => handleResultChange(index, 'player', e.target.value)}
                    placeholder="Player name"
                    className="w-full px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white placeholder-gray-500"
                  />
                  {showDropdown[index] && (
                    <div className="absolute z-10 w-full mt-1 bg-dark-100 border border-dark-300 rounded shadow-lg max-h-40 overflow-y-auto">
                      {getFilteredPlayers(searchTerms[index]).map((player) => (
                        <button
                          key={player.name}
                          type="button"
                          onClick={() => selectPlayer(index, player.name)}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-dark-200 text-white"
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
                  className="px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white"
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
            className="w-full py-2 px-4 bg-secondary text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-600"
          >
            {loading ? 'Submitting...' : 'Submit Results & Calculate Scores'}
          </button>
        </form>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="p-3 bg-dark-200 rounded-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Submission Lock</h3>
            <p className="text-xs text-gray-400 mb-3">
              Lock submissions to prevent new entries (typically before the draft starts).
            </p>
            <button
              onClick={handleToggleLock}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                submissionsLocked
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:bg-gray-600`}
            >
              {submissionsLocked ? 'Unlock Submissions' : 'Lock Submissions'}
            </button>
            <div className="mt-2 text-xs">
              Status: <span className={submissionsLocked ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                {submissionsLocked ? 'LOCKED' : 'OPEN'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-dark-200 rounded-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Manual Score Calculation</h3>
            <p className="text-xs text-gray-400 mb-3">
              Recalculate all scores based on current draft results.
            </p>
            <button
              onClick={handleCalculateScores}
              disabled={loading}
              className="px-4 py-2 bg-secondary hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:bg-gray-600"
            >
              Calculate Scores
            </button>
          </div>

          <div className="p-3 bg-dark-300 rounded-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Admin Actions</h3>
            <ul className="text-xs text-gray-400 space-y-1">
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
