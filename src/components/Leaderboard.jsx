import { useState, useEffect } from 'react'
import { getLeaderboard } from '../utils/api'

function Leaderboard() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const data = await getLeaderboard()
      setScores(data)
      setError('')
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Failed to load leaderboard. Please try again.')
    } finally {
      setLoading(false)
    }
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
        <button
          onClick={fetchLeaderboard}
          className="px-3 py-1.5 text-xs bg-dark-200 hover:bg-dark-300 text-gray-300 rounded-lg transition-colors"
        >
          Refresh
        </button>
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
                  key={score.name}
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
                    <div className="font-medium text-white text-sm">{score.name}</div>
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
          <div key={score.name} className="p-2 bg-dark-200 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="font-medium text-white text-sm">{score.name}</div>
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
