import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { getPlayers, getTeams } from '../utils/api'
import { getTeamLogoUrl } from '../utils/teamLogos'
import { NFL_TEAMS } from '../utils/nflTeams'

const DraftPicks = forwardRef(function DraftPicks({ picks, onPickChange, teamSelections, onTeamChange }, ref) {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerms, setSearchTerms] = useState(Array(32).fill(''))
  const [showDropdown, setShowDropdown] = useState(Array(32).fill(false))
  const [showTeamDropdown, setShowTeamDropdown] = useState(Array(32).fill(false))

  useImperativeHandle(ref, () => ({
    updateSearchTerms: (newTerms) => {
      setSearchTerms(newTerms)
    }
  }))

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

  const getFilteredPlayers = (searchTerm, currentIndex) => {
    if (!searchTerm) return []
    const selectedNames = new Set(
      picks
        .filter((p, i) => p !== null && i !== currentIndex)
        .map(p => p.name)
    )
    return players.filter(player =>
      !selectedNames.has(player.name) && (
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.college.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).slice(0, 10)
  }

  const clearPick = (index) => {
    onPickChange(index, null)
    const newSearchTerms = [...searchTerms]
    newSearchTerms[index] = ''
    setSearchTerms(newSearchTerms)
  }

  const toggleTeamDropdown = (index) => {
    const newShowTeamDropdown = Array(32).fill(false)
    newShowTeamDropdown[index] = !showTeamDropdown[index]
    setShowTeamDropdown(newShowTeamDropdown)
  }

  const selectTeam = (index, teamName) => {
    if (onTeamChange) {
      // Normalize: if selecting the original/default team, clear the custom selection
      onTeamChange(index, teamName === teams[index]?.name ? null : teamName)
    }
    const newShowTeamDropdown = [...showTeamDropdown]
    newShowTeamDropdown[index] = false
    setShowTeamDropdown(newShowTeamDropdown)
  }

  const resetTeam = (index) => {
    if (onTeamChange) {
      onTeamChange(index, null)
    }
  }

  const getSelectedTeam = (index) => {
    if (teamSelections && teamSelections[index]) {
      return teamSelections[index]
    }
    return teams[index]?.name || ''
  }

  const getSelectedTeamForLogo = (index) => {
    const selectedName = getSelectedTeam(index)
    return selectedName || teams[index]?.name || ''
  }


  if (loading) {
    return <div className="text-center py-4 text-gray-400">Loading players and teams...</div>
  }

  const filledPicks = picks.filter(p => p !== null).length

  return (
    <div className="bg-dark-100 rounded-lg shadow-md p-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-white">Draft Picks</h2>
        <div className="text-xs text-gray-400">
          {filledPicks} / 32 picks
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {teams.map((team, index) => (
          <div key={index} className="bg-dark-200 rounded-lg p-2 hover:bg-dark-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 relative">
                <img
                  src={getTeamLogoUrl(getSelectedTeamForLogo(index))}
                  alt={getSelectedTeam(index)}
                  className="w-6 h-6 object-contain"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div>
                  <div className="text-xs font-semibold text-white">
                    #{index + 1}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleTeamDropdown(index)}
                      className={`flex items-center gap-0.5 text-xs text-left ${
                        teamSelections && teamSelections[index] && teamSelections[index] !== team.name
                          ? 'text-yellow-400 font-medium'
                          : 'text-gray-400'
                      } hover:text-white`}
                      title="Click to change team (if you think there's a trade)"
                    >
                      <span>{getSelectedTeam(index)}</span>
                      <span className="flex-shrink-0">▾</span>
                    </button>
                    {teamSelections && teamSelections[index] && teamSelections[index] !== team.name && (
                      <button
                        type="button"
                        onClick={() => resetTeam(index)}
                        className="text-gray-500 hover:text-gray-300 text-xs leading-none"
                        title={`Reset to ${team.name}`}
                      >
                        ↺
                      </button>
                    )}
                  </div>
                </div>
                {showTeamDropdown[index] && (
                  <div className="absolute z-30 left-0 top-full mt-1 w-48 bg-dark-100 border border-dark-300 rounded shadow-lg max-h-48 overflow-y-auto">
                    {NFL_TEAMS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => selectTeam(index, t)}
                        className={`w-full text-left px-2 py-1.5 text-xs hover:bg-dark-200 ${
                          getSelectedTeam(index) === t ? 'bg-dark-300 text-accent' : 'text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {picks[index] && (
                <button
                  onClick={() => clearPick(index)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={picks[index] ? picks[index].name : searchTerms[index]}
                onChange={(e) => handleSearchChange(index, e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1.5 text-xs bg-dark-100 border border-dark-300 rounded focus:outline-none focus:ring-1 focus:ring-accent text-white placeholder-gray-500"
              />

              {showDropdown[index] && (
                <div className="absolute z-20 w-full mt-1 bg-dark-100 border border-dark-300 rounded shadow-lg max-h-48 overflow-y-auto">
                  {getFilteredPlayers(searchTerms[index], index).length > 0 ? (
                    getFilteredPlayers(searchTerms[index], index).map((player) => (
                      <button
                        key={player.name}
                        onClick={() => selectPlayer(index, player)}
                        className="w-full text-left px-2 py-1.5 hover:bg-dark-200 focus:outline-none focus:bg-dark-200"
                      >
                        <div className="text-xs font-medium text-white">{player.name}</div>
                        <div className="text-xs text-gray-400">
                          {player.position} - {player.college}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-gray-500 text-xs">
                      No players found
                    </div>
                  )}
                </div>
              )}

              {picks[index] && (
                <div className="mt-1 text-xs text-accent">
                  {picks[index].position} - {picks[index].college}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

export default DraftPicks
