import { useState, useEffect } from 'react'
import { submitDraftResults, toggleLock, calculateScores, getTeams, getPlayers, getDraftState, resetResults } from '../utils/api'

function AdminPanel({ onUpdate }) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('live') // 'live', 'results', 'settings'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Draft results state
  const [draftResults, setDraftResults] = useState(Array(32).fill({ team: '', player: '' }))
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [searchTerms, setSearchTerms] = useState(Array(32).fill(''))
  const [showDropdown, setShowDropdown] = useState(Array(32).fill(false))

  // Actual trades state (start with 3, can add more)
  const [actualTradesUp, setActualTradesUp] = useState(['', '', ''])
  const [actualTradesDown, setActualTradesDown] = useState(['', '', ''])

  const addTradeSlot = (type) => {
    if (type === 'up') {
      setActualTradesUp([...actualTradesUp, ''])
    } else {
      setActualTradesDown([...actualTradesDown, ''])
    }
  }

  const removeTradeSlot = (type, index) => {
    if (type === 'up' && actualTradesUp.length > 1) {
      setActualTradesUp(actualTradesUp.filter((_, i) => i !== index))
    } else if (type === 'down' && actualTradesDown.length > 1) {
      setActualTradesDown(actualTradesDown.filter((_, i) => i !== index))
    }
  }

  // Settings state
  const [submissionsLocked, setSubmissionsLocked] = useState(false)

  // Live mode quick entry state
  const [quickPickNumber, setQuickPickNumber] = useState(1)
  const [quickPlayer, setQuickPlayer] = useState('')
  const [quickTeam, setQuickTeam] = useState('')
  const [quickPlayerSearch, setQuickPlayerSearch] = useState('')
  const [showQuickDropdown, setShowQuickDropdown] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name))

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

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password) return

    try {
      const state = await getDraftState(password)

      // Populate draft results
      if (state.draftResults && state.draftResults.length > 0) {
        const newResults = Array(32).fill(null).map(() => ({ team: '', player: '' }))
        const newSearchTerms = Array(32).fill('')
        state.draftResults.forEach(r => {
          const idx = r.pick_number - 1
          newResults[idx] = { team: r.team_name, player: r.player_name }
          newSearchTerms[idx] = r.player_name
        })
        setDraftResults(newResults)
        setSearchTerms(newSearchTerms)

        // Advance live mode to next empty pick
        const nextEmpty = newResults.findIndex(r => !r.player || !r.team)
        const nextPick = nextEmpty === -1 ? 32 : nextEmpty + 1
        setQuickPickNumber(nextPick)
      }

      // Populate actual trades
      if (state.actualTrades) {
        const up = state.actualTrades.tradesUp || []
        const down = state.actualTrades.tradesDown || []
        setActualTradesUp(up.length > 0 ? up : ['', '', ''])
        setActualTradesDown(down.length > 0 ? down : ['', '', ''])
      }

      setIsAuthenticated(true)
    } catch (err) {
      if (err.response?.status === 401) {
        showMessage('error', 'Invalid password')
      } else {
        // Still log in even if state fetch fails — don't block access
        console.error('Error loading draft state:', err)
        setIsAuthenticated(true)
      }
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

  const handleAutoFill = () => {
    if (teams.length === 0 || players.length === 0) return

    // Auto-fill with first 32 players and default teams
    const newResults = teams.slice(0, 32).map((team, index) => ({
      team: team.name,
      player: players[index]?.name || ''
    }))
    setDraftResults(newResults)

    const newSearchTerms = newResults.map(r => r.player)
    setSearchTerms(newSearchTerms)

    // Set some sample trades
    if (teams.length >= 10) {
      setActualTradesUp([teams[5]?.name || '', teams[8]?.name || '', ''])
      setActualTradesDown([teams[2]?.name || '', teams[4]?.name || '', ''])
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

  const [resetConfirm, setResetConfirm] = useState(false)

  const handleResetResults = async () => {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }
    setLoading(true)
    setResetConfirm(false)
    try {
      await resetResults(password)
      // Clear local state
      setDraftResults(Array(32).fill({ team: '', player: '' }))
      setSearchTerms(Array(32).fill(''))
      setActualTradesUp(['', '', ''])
      setActualTradesDown(['', '', ''])
      setQuickPickNumber(1)
      setQuickPlayer('')
      setQuickTeam('')
      setQuickPlayerSearch('')
      showMessage('success', 'Results reset successfully. Submissions are now unlocked.')
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error resetting results:', err)
      showMessage('error', err.response?.data?.error || 'Failed to reset results')
    } finally {
      setLoading(false)
    }
  }

  // Quick pick entry for live mode
  const handleQuickPickSubmit = async () => {
    if (!quickPlayer || !quickTeam) {
      showMessage('error', 'Please select both a player and team')
      return
    }

    setLoading(true)
    try {
      // Update the draft results array with the new pick
      const newResults = [...draftResults]
      newResults[quickPickNumber - 1] = { team: quickTeam, player: quickPlayer }
      setDraftResults(newResults)

      // Update search terms too
      const newSearchTerms = [...searchTerms]
      newSearchTerms[quickPickNumber - 1] = quickPlayer
      setSearchTerms(newSearchTerms)

      // Submit all results (including partial)
      const resultsToSubmit = newResults
        .map((result, index) => ({
          pick_number: index + 1,
          team_name: result.team,
          player_name: result.player
        }))
        .filter(r => r.team_name && r.player_name)

      const tradesUp = actualTradesUp.filter(t => t !== '')
      const tradesDown = actualTradesDown.filter(t => t !== '')

      await submitDraftResults(password, resultsToSubmit, tradesUp, tradesDown)

      // Auto-calculate scores
      await calculateScores(password)

      showMessage('success', `Pick #${quickPickNumber} saved! Scores updated.`)
      if (onUpdate) onUpdate()

      // Auto-advance to next pick
      if (quickPickNumber < 32) {
        setQuickPickNumber(quickPickNumber + 1)
        setQuickPlayer('')
        setQuickTeam(teams[quickPickNumber]?.name || '') // Default to next team
        setQuickPlayerSearch('')
      }
    } catch (err) {
      console.error('Error submitting quick pick:', err)
      showMessage('error', 'Failed to save pick')
    } finally {
      setLoading(false)
    }
  }

  const selectQuickPlayer = (playerName) => {
    setQuickPlayer(playerName)
    setQuickPlayerSearch(playerName)
    setShowQuickDropdown(false)
  }

  const getNextPickNumber = () => {
    // Find first empty pick
    for (let i = 0; i < 32; i++) {
      if (!draftResults[i]?.player || !draftResults[i]?.team) {
        return i + 1
      }
    }
    return 32
  }

  const getFilledPickCount = () => {
    return draftResults.filter(r => r?.player && r?.team).length
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
          onClick={() => setActiveTab('live')}
          className={`pb-2 px-3 text-sm font-medium transition-colors ${
            activeTab === 'live'
              ? 'border-b-2 border-green-500 text-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          🔴 Live Mode
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-2 px-3 text-sm font-medium transition-colors ${
            activeTab === 'results'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All Results
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

      {/* Live Mode Tab */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-green-400">Quick Pick Entry</h3>
              <div className="text-sm text-gray-300">
                {getFilledPickCount()} / 32 picks entered
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Pick Number */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Pick #</label>
                <select
                  value={quickPickNumber}
                  onChange={(e) => {
                    const num = parseInt(e.target.value)
                    setQuickPickNumber(num)
                    setQuickTeam(teams[num - 1]?.name || '')
                  }}
                  className="w-full px-3 py-2 text-sm bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white"
                >
                  {Array.from({ length: 32 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      #{i + 1} {draftResults[i]?.player ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player Search */}
              <div className="relative">
                <label className="block text-xs text-gray-400 mb-1">Player</label>
                <input
                  type="text"
                  value={quickPlayerSearch}
                  onChange={(e) => {
                    setQuickPlayerSearch(e.target.value)
                    setShowQuickDropdown(e.target.value.length > 0)
                  }}
                  placeholder="Search player..."
                  className="w-full px-3 py-2 text-sm bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white placeholder-gray-500"
                />
                {showQuickDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-dark-100 border border-dark-300 rounded shadow-lg max-h-48 overflow-y-auto">
                    {getFilteredPlayers(quickPlayerSearch).map((player) => (
                      <button
                        key={player.name}
                        type="button"
                        onClick={() => selectQuickPlayer(player.name)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-dark-200 text-white"
                      >
                        {player.name} <span className="text-gray-400">({player.position})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Team */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Team</label>
                <select
                  value={quickTeam}
                  onChange={(e) => setQuickTeam(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white"
                >
                  <option value="">Select team...</option>
                  {sortedTeams.map((team) => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleQuickPickSubmit}
                  disabled={loading || !quickPlayer || !quickTeam}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-semibold rounded transition-colors"
                >
                  {loading ? 'Saving...' : 'Add Pick & Update Scores'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Picks Display */}
          <div className="bg-dark-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-white mb-2">Entered Picks</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {draftResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs ${
                    result?.player && result?.team
                      ? 'bg-green-900/30 border border-green-700'
                      : 'bg-dark-300 border border-dark-400'
                  }`}
                >
                  <div className="font-semibold text-white">#{index + 1}</div>
                  {result?.player ? (
                    <>
                      <div className="text-green-400 truncate">{result.player}</div>
                      <div className="text-gray-400 truncate">{result.team}</div>
                    </>
                  ) : (
                    <div className="text-gray-500">—</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trades Section (compact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-dark-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-white mb-2">Teams Traded Up</h4>
              <div className="flex flex-wrap gap-1">
                {actualTradesUp.filter(t => t).map((team, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                    {team}
                  </span>
                ))}
                <button
                  onClick={() => setActiveTab('results')}
                  className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                >
                  + Edit
                </button>
              </div>
            </div>
            <div className="bg-dark-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-white mb-2">Teams Traded Down</h4>
              <div className="flex flex-wrap gap-1">
                {actualTradesDown.filter(t => t).map((team, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-900/50 text-orange-300 text-xs rounded">
                    {team}
                  </span>
                ))}
                <button
                  onClick={() => setActiveTab('results')}
                  className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                >
                  + Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Results Tab */}
      {activeTab === 'results' && (
        <form onSubmit={handleSubmitResults} className="space-y-3">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-gray-400">
              Enter the actual draft results below. Scores will be calculated automatically.
            </p>
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              Auto-Fill (Test)
            </button>
          </div>

          {/* Actual Trades Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-dark-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-white mb-2">Teams That Traded Up</h3>
              <div className="space-y-2">
                {actualTradesUp.map((trade, index) => (
                  <div key={index} className="flex gap-1">
                    <select
                      value={trade}
                      onChange={(e) => handleTradeChange('up', index, e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white"
                    >
                      <option value="">Team {index + 1}...</option>
                      {sortedTeams.map((team) => (
                        <option key={team.name} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    {actualTradesUp.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTradeSlot('up', index)}
                        className="px-2 text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTradeSlot('up')}
                  className="w-full px-2 py-1 text-xs bg-dark-100 border border-dashed border-dark-300 rounded text-gray-400 hover:text-white hover:border-gray-400"
                >
                  + Add Team
                </button>
              </div>
            </div>
            <div className="bg-dark-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-white mb-2">Teams That Traded Down</h3>
              <div className="space-y-2">
                {actualTradesDown.map((trade, index) => (
                  <div key={index} className="flex gap-1">
                    <select
                      value={trade}
                      onChange={(e) => handleTradeChange('down', index, e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white"
                    >
                      <option value="">Team {index + 1}...</option>
                      {sortedTeams.map((team) => (
                        <option key={team.name} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    {actualTradesDown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTradeSlot('down', index)}
                        className="px-2 text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTradeSlot('down')}
                  className="w-full px-2 py-1 text-xs bg-dark-100 border border-dashed border-dark-300 rounded text-gray-400 hover:text-white hover:border-gray-400"
                >
                  + Add Team
                </button>
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
                  {sortedTeams.map((t) => (
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

          <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg">
            <h3 className="font-semibold text-sm text-red-300 mb-2">Fully Reset Results</h3>
            <p className="text-xs text-gray-400 mb-3">
              Deletes all scores and draft results, unlocks submissions, and clears trades. Submissions are preserved.
            </p>
            <button
              onClick={handleResetResults}
              disabled={loading}
              className={`px-4 py-2 text-sm rounded-lg font-medium disabled:bg-gray-600 text-white transition-colors ${
                resetConfirm
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-red-900 hover:bg-red-700'
              }`}
            >
              {resetConfirm ? 'Click again to confirm reset' : 'Reset All Results'}
            </button>
            {resetConfirm && (
              <button
                onClick={() => setResetConfirm(false)}
                className="ml-2 px-3 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            )}
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
