import { NFL_TEAMS } from '../utils/nflTeams'

function TradePredictions({ tradesUp, tradesDown, onTradeChange }) {
  const teams = NFL_TEAMS

  return (
    <div className="bg-dark-100 rounded-lg shadow-md p-3">
      <h2 className="text-lg font-bold text-white mb-3">Trade Predictions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teams Trading Up */}
        <div className="bg-dark-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-white mb-2">
            Teams Trading Up
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            Select teams that will trade UP to get a higher pick
          </p>
          <div className="space-y-2">
            {[0, 1, 2].map((index) => {
              const otherUpSelections = new Set(
                tradesUp.filter((t, i) => t && i !== index)
              )
              return (
                <select
                  key={index}
                  value={tradesUp[index]}
                  onChange={(e) => onTradeChange('up', index, e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white"
                >
                  <option value="">Team {index + 1}...</option>
                  {teams
                    .filter((team) => !otherUpSelections.has(team))
                    .map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                </select>
              )
            })}
          </div>
        </div>

        {/* Teams Trading Down */}
        <div className="bg-dark-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-white mb-2">
            Teams Trading Down
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            Select teams that will trade DOWN to get a lower pick
          </p>
          <div className="space-y-2">
            {[0, 1, 2].map((index) => {
              const otherDownSelections = new Set(
                tradesDown.filter((t, i) => t && i !== index)
              )
              return (
                <select
                  key={index}
                  value={tradesDown[index]}
                  onChange={(e) => onTradeChange('down', index, e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white"
                >
                  <option value="">Team {index + 1}...</option>
                  {teams
                    .filter((team) => !otherDownSelections.has(team))
                    .map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                </select>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 p-2 bg-dark-200 rounded text-xs text-gray-400">
        <strong className="text-gray-300">Scoring:</strong> 2 points for each correct trade prediction
      </div>
    </div>
  )
}

export default TradePredictions
