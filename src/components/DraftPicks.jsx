import { useState, useEffect } from 'react'
import { getPlayers, getTeams } from '../utils/api'

function DraftPicks({ picks, onPickChange }) {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerms, setSearchTerms] = useState(Array(32).fill(''))
  const [showDropdown, setShowDropdown] = useState(Array(32).fill(false))

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [playersData, teamsData] = await Promise.all([
        getPlayers(),
        getTeams()
      ])
      setPlayers(playersData)
      setTeams(teamsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (index, value) => {
    const newSearchTerms = [...searchTerms]
    newSearchTerms[index] = value
    setSearchTerms(newSearchTerms)

    const newShowDropdown = [...showDropdown]
    newShowDropdown[index] = value.length > 0
    setShowDropdown(newShowDropdown)
  }

  const selectPlayer = (index, player) => {
    onPickChange(index, player)
    const newSearchTerms = [...searchTerms]
    newSearchTerms[index] = player.name
    setSearchTerms(newSearchTerms)

    const newShowDropdown = [...showDropdown]
    newShowDropdown[index] = false
    setShowDropdown(newShowDropdown)
  }

  const getFilteredPlayers = (searchTerm) => {
    if (!searchTerm) return []
    return players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.college.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10)
  }

  const clearPick = (index) => {
    onPickChange(index, null)
    const newSearchTerms = [...searchTerms]
    newSearchTerms[index] = ''
    setSearchTerms(newSearchTerms)
  }

  if (loading) {
    return <div className="text-center py-8">Loading players and teams...</div>
  }

  const filledPicks = picks.filter(p => p !== null).length

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Draft Picks</h2>
        <div className="text-sm text-gray-600">
          {filledPicks} / 32 picks selected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-gray-700">
                  Pick {index + 1}
                </div>
                <div className="text-sm text-gray-500">{team.name}</div>
              </div>
              {picks[index] && (
                <button
                  onClick={() => clearPick(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={picks[index] ? picks[index].name : searchTerms[index]}
                onChange={(e) => handleSearchChange(index, e.target.value)}
                placeholder="Search player..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {showDropdown[index] && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {getFilteredPlayers(searchTerms[index]).length > 0 ? (
                    getFilteredPlayers(searchTerms[index]).map((player) => (
                      <button
                        key={player.name}
                        onClick={() => selectPlayer(index, player)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:outline-none focus:bg-blue-50"
                      >
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {player.position} - {player.college}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No players found
                    </div>
                  )}
                </div>
              )}

              {picks[index] && (
                <div className="mt-2 text-sm text-gray-600">
                  {picks[index].position} - {picks[index].college}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DraftPicks
