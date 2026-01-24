import { useState, useEffect } from 'react'
import { getTeams } from '../utils/api'

function TradePredictions({ tradesUp, tradesDown, onTradeChange }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const teamsData = await getTeams()
      setTeams(teamsData)
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading teams...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Trade Predictions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teams Trading Up */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Teams Trading Up (3 teams)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Select teams that will trade UP to get a higher pick
          </p>
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team {index + 1}
                </label>
                <select
                  value={tradesUp[index]}
                  onChange={(e) => onTradeChange('up', index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Trading Down */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Teams Trading Down (3 teams)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Select teams that will trade DOWN to get a lower pick
          </p>
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team {index + 1}
                </label>
                <select
                  value={tradesDown[index]}
                  onChange={(e) => onTradeChange('down', index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
        <strong>Scoring:</strong> You get 2 points for each team you correctly predict trades (either up or down).
      </div>
    </div>
  )
}

export default TradePredictions
