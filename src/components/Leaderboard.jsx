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
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-xl text-gray-600">Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-red-600 text-center">{error}</div>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 mx-auto block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (scores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-xl text-gray-600 mb-4">No submissions yet</div>
        <p className="text-gray-500">Be the first to make your predictions!</p>
      </div>
    )
  }

  const hasScores = scores.some(s => s.totalScore > 0)

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {!hasScores && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
          <p>Submissions received! Scores will appear after the draft results are entered.</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">
                1st Rd
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">
                Pick #
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">
                Team
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">
                Trades
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scores.map((score, index) => {
              const isWinner = hasScores && index === 0 && score.totalScore > 0
              return (
                <tr
                  key={score.name}
                  className={`hover:bg-gray-50 ${isWinner ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-4 py-3 text-sm">
                    {isWinner ? (
                      <span className="text-2xl">🏆</span>
                    ) : (
                      <span className="text-gray-600">{index + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{score.name}</div>
                    {score.timestamp && (
                      <div className="text-xs text-gray-500">
                        {new Date(score.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 hidden md:table-cell">
                    {score.firstRoundPoints || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 hidden md:table-cell">
                    {score.pickNumberPoints || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 hidden md:table-cell">
                    {score.teamPoints || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 hidden md:table-cell">
                    {score.tradePoints || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-lg text-blue-600">
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
      <div className="md:hidden mt-4 space-y-2">
        {scores.map((score, index) => (
          <div key={score.name} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">{score.name}</div>
                <div className="text-xs text-gray-500">Rank #{index + 1}</div>
              </div>
              <div className="font-bold text-lg text-blue-600">
                {score.totalScore || 0}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
              <div className="text-center">
                <div>1st Rd</div>
                <div className="font-semibold">{score.firstRoundPoints || 0}</div>
              </div>
              <div className="text-center">
                <div>Pick #</div>
                <div className="font-semibold">{score.pickNumberPoints || 0}</div>
              </div>
              <div className="text-center">
                <div>Team</div>
                <div className="font-semibold">{score.teamPoints || 0}</div>
              </div>
              <div className="text-center">
                <div>Trades</div>
                <div className="font-semibold">{score.tradePoints || 0}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboard
