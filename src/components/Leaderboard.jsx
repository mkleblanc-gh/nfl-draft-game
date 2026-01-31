import { useState, useEffect, useRef } from 'react'
import { getLeaderboard, getGameStatus } from '../utils/api'

function Leaderboard() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [picksEntered, setPicksEntered] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchAll()

    // Set up auto-refresh interval (every 30 seconds)
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchAll(true) // silent refresh (no loading spinner)
      }, 30000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh])

  const fetchAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      const [leaderboardData, statusData] = await Promise.all([
        getLeaderboard(),
        getGameStatus()
      ])

      setScores(leaderboardData)
      setPicksEntered(statusData.picksEntered || 0)
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      console.error('Error fetching data:', err)
      if (!silent) setError('Failed to load leaderboard. Please try again.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    fetchAll()
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return ''
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get display name: use name if provided, otherwise show email
  const getDisplayName = (score) => {
    if (score.name) return score.name
    if (score.email) return score.email
    return 'Anonymous'
  }

  if (loading) {
    return (
      <div className="bg-dark-100 rounded-lg shadow-md p-6 text-center">
        <div className="text-lg text-gray-400">Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark-100 rounded-lg shadow-md p-6">
        <div className="text-red-400 text-center">{error}</div>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 mx-auto block px-6 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (scores.length === 0) {
    return (
      <div className="bg-dark-100 rounded-lg shadow-md p-6 text-center">
        <div className="text-lg text-gray-300 mb-2">No submissions yet</div>
        <p className="text-gray-500 text-sm">Be the first to make your predictions!</p>
      </div>
    )
  }

  const hasScores = scores.some(s => s.totalScore > 0)

  return (
    <div className="bg-dark-100 rounded-lg shadow-md p-3">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Leaderboard</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              className="px-3 py-1.5 text-xs bg-dark-200 hover:bg-dark-300 text-gray-300 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Pick count and auto-refresh status */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">
              Picks: <span className={`font-semibold ${picksEntered === 32 ? 'text-green-400' : 'text-accent'}`}>
                {picksEntered}/32
              </span>
            </span>
            {lastUpdated && (
              <span className="text-gray-500">
                Updated {formatLastUpdated()}
              </span>
            )}
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3 h-3 rounded"
            />
            <span className="text-gray-400">Auto-refresh</span>
          </label>
        </div>
      </div>

      {!hasScores && (
        <div className="mb-3 p-3 bg-blue-900/30 border-l-4 border-blue-500 text-blue-200 rounded text-sm">
          <p>Submissions received! Scores will appear after the draft results are entered.</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Rank</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Name</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 hidden md:table-cell">
                1st Rd
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 hidden md:table-cell">
                Pick #
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 hidden md:table-cell">
                Team
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 hidden md:table-cell">
                Trades
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-300">
            {scores.map((score, index) => {
              const isWinner = hasScores && index === 0 && score.totalScore > 0
              return (
                <tr
                  key={score.email || score.name || index}
                  className={`hover:bg-dark-200 ${isWinner ? 'bg-yellow-900/20' : ''}`}
                >
                  <td className="px-3 py-2 text-sm">
                    {isWinner ? (
                      <span className="text-lg">🏆</span>
                    ) : (
                      <span className="text-gray-400">{index + 1}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-white text-sm">{getDisplayName(score)}</div>
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-400 hidden md:table-cell">
                    {score.firstRoundPoints || 0}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-400 hidden md:table-cell">
                    {score.pickNumberPoints || 0}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-400 hidden md:table-cell">
                    {score.teamPoints || 0}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-400 hidden md:table-cell">
                    {score.tradePoints || 0}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="font-bold text-accent">
                      {score.totalScore || 0}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view - show breakdown */}
      <div className="md:hidden mt-3 space-y-2">
        {scores.map((score, index) => (
          <div key={score.email || score.name || index} className="p-2 bg-dark-200 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="font-medium text-white text-sm">{getDisplayName(score)}</div>
                <div className="text-xs text-gray-500">Rank #{index + 1}</div>
              </div>
              <div className="font-bold text-accent">
                {score.totalScore || 0}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs text-gray-400">
              <div className="text-center">
                <div>1st Rd</div>
                <div className="font-semibold text-gray-300">{score.firstRoundPoints || 0}</div>
              </div>
              <div className="text-center">
                <div>Pick #</div>
                <div className="font-semibold text-gray-300">{score.pickNumberPoints || 0}</div>
              </div>
              <div className="text-center">
                <div>Team</div>
                <div className="font-semibold text-gray-300">{score.teamPoints || 0}</div>
              </div>
              <div className="text-center">
                <div>Trades</div>
                <div className="font-semibold text-gray-300">{score.tradePoints || 0}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboard
