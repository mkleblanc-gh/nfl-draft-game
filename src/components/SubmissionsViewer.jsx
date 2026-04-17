import { useState, useEffect } from 'react'
import { getSubmissions, getTeams } from '../utils/api'

function SubmissionsViewer() {
  const [submissions, setSubmissions] = useState([])
  const [picksEntered, setPicksEntered] = useState(0)
  const [draftResults, setDraftResults] = useState([]) // actual draft results entered so far
  const [teams, setTeams] = useState([]) // ordered by pick_number, used as default team fallback
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subData, teamsData] = await Promise.all([getSubmissions(), getTeams()])
      const subs = subData.submissions || []
      subs.sort((a, b) => {
        const nameA = (a.name || a.email || '').toLowerCase()
        const nameB = (b.name || b.email || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
      setSubmissions(subs)
      setPicksEntered(subData.picksEntered || 0)
      setDraftResults(subData.draftResults || [])
      setTeams(teamsData)
      setError('')
    } catch (err) {
      setError('Failed to load submissions.')
    } finally {
      setLoading(false)
    }
  }

  // Returns the effective team for a pick: user's override or the default team for that slot
  const getTeamForPick = (pick, pickIndex) => {
    return pick.predictedTeam || teams[pickIndex]?.name || ''
  }

  // Returns { points, type } for a pick if that pick # has been entered, otherwise null
  const getPickScore = (pick, pickIndex) => {
    const pickNumber = pickIndex + 1
    const actual = draftResults.find(r => r.pick_number === pickNumber)
    if (!actual) return null

    const predictedPlayer = pick.playerName?.toLowerCase() || ''
    const predictedTeam = getTeamForPick(pick, pickIndex).toLowerCase()
    const actualPlayer = actual.player_name.toLowerCase()
    const actualTeam = actual.team_name.toLowerCase()
    const firstRoundPlayers = draftResults.map(r => r.player_name.toLowerCase())

    if (actualPlayer === predictedPlayer && actualTeam === predictedTeam) {
      return { points: 5, type: 'team' }
    } else if (actualPlayer === predictedPlayer) {
      return { points: 3, type: 'pick' }
    } else if (firstRoundPlayers.includes(predictedPlayer)) {
      return { points: 1, type: 'firstRound' }
    } else {
      return { points: 0, type: 'none' }
    }
  }

  const getTotalScore = (sub) => {
    const picks = sub.picks || []
    return picks.reduce((sum, pick, i) => {
      const score = getPickScore(pick, i)
      return sum + (score ? score.points : 0)
    }, 0)
  }

  const toggleExpanded = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }))
  }

  if (loading) {
    return (
      <div className="bg-dark-100 rounded-lg shadow-md p-6 text-center">
        <div className="text-lg text-gray-400">Loading submissions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark-100 rounded-lg shadow-md p-6 text-center">
        <div className="text-red-400">{error}</div>
        <button
          onClick={fetchSubmissions}
          className="mt-4 mx-auto block px-6 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-dark-100 rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-400">No submissions found.</div>
      </div>
    )
  }

  const draftComplete = picksEntered >= 32
  // next pick is 1-indexed; picks array is 0-indexed
  const nextPickIndex = picksEntered // 0-based index into picks array

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-white">All Submissions</h2>
        <span className="text-sm text-gray-400">{submissions.length} entries</span>
      </div>

      {submissions.map((sub, index) => {
        const isOpen = expanded[index]
        const tradesUp = (sub.trade_up || []).filter(t => t)
        const tradesDown = (sub.trade_down || []).filter(t => t)
        const picks = sub.picks || []

        // Next pick info for the header
        const nextPick = picks[nextPickIndex]
        const nextPickNumber = picksEntered + 1

        const totalScore = picksEntered > 0 ? getTotalScore(sub) : null

        return (
          <div key={sub.email || index} className="bg-dark-100 rounded-lg border border-dark-300 overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => toggleExpanded(index)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-dark-200 transition-colors text-left"
            >
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="font-medium text-white text-sm truncate">{sub.name || sub.email}</span>
                {draftComplete ? (
                  <span className="text-xs text-green-400">Draft complete</span>
                ) : nextPick ? (
                  <span className="text-xs text-gray-400">
                    Pick {nextPickNumber}:{' '}
                    <span className="text-gray-200">{nextPick.playerName}</span>
                    {getTeamForPick(nextPick, nextPickIndex) && (
                      <span className="text-gray-400"> · {getTeamForPick(nextPick, nextPickIndex)}</span>
                    )}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3 ml-2 shrink-0">
                {totalScore !== null && (
                  <span className="text-sm font-bold text-accent">Score: {totalScore}</span>
                )}
                <span className="text-gray-500 text-xs">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-dark-300 px-3 py-2">
                {/* Picks list */}
                <div className="space-y-0 mb-3">
                  {picks.map((pick, i) => {
                    const score = getPickScore(pick, i)
                    const scoreBadge = score === null ? null : score.points === 5
                      ? <span className="text-yellow-400 font-bold text-xs shrink-0">5</span>
                      : score.points === 3
                      ? <span className="text-blue-400 font-bold text-xs shrink-0">3</span>
                      : score.points === 1
                      ? <span className="text-gray-400 font-bold text-xs shrink-0">1</span>
                      : <span className="text-red-500/60 font-bold text-xs shrink-0">0</span>
                    return (
                      <div key={i} className="flex items-baseline gap-1.5 py-0.5 border-b border-dark-300/50 last:border-0">
                        <span className="text-gray-500 text-xs w-5 shrink-0 text-right">{i + 1}.</span>
                        <span className="text-white text-xs font-medium">{pick.playerName || '—'}</span>
                        {getTeamForPick(pick, i) && (
                          <span className="text-gray-400 text-[10px]">· {getTeamForPick(pick, i)}</span>
                        )}
                        {scoreBadge && <span className="ml-auto">{scoreBadge}</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Trades */}
                {(tradesUp.length > 0 || tradesDown.length > 0) && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-dark-300">
                    {tradesUp.map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-green-900/60 text-green-300 rounded">↑ {t}</span>
                    ))}
                    {tradesDown.map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-red-900/60 text-red-300 rounded">↓ {t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SubmissionsViewer
