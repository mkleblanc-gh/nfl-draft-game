import { useState, useEffect, useRef } from 'react'
import DraftPicks from './components/DraftPicks'
import TradePredictions from './components/TradePredictions'
import SubmissionForm from './components/SubmissionForm'
import SubmissionsViewer from './components/SubmissionsViewer'
import Leaderboard from './components/Leaderboard'
import AdminPanel from './components/AdminPanel'
import { getGameStatus, getPlayers, getTeams } from './utils/api'

function App() {
  const [currentView, setCurrentView] = useState('predict') // 'predict', 'leaderboard', 'rules', 'admin'
  const [picks, setPicks] = useState(Array(32).fill(null))
  const [teamSelections, setTeamSelections] = useState(Array(32).fill(null)) // Custom team for each pick slot
  const [tradesUp, setTradesUp] = useState(['', '', ''])
  const [tradesDown, setTradesDown] = useState(['', '', ''])
  const [playerName, setPlayerName] = useState('')
  const [playerEmail, setPlayerEmail] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const draftPicksRef = useRef(null)

  useEffect(() => {
    checkGameStatus()
  }, [])

  const checkGameStatus = async () => {
    try {
      const status = await getGameStatus()
      setIsLocked(status.locked)
    } catch (error) {
      console.error('Error fetching game status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePickChange = (index, player) => {
    const newPicks = [...picks]
    newPicks[index] = player
    setPicks(newPicks)
  }

  const handleTradeChange = (type, index, team) => {
    if (type === 'up') {
      const newTrades = [...tradesUp]
      newTrades[index] = team
      setTradesUp(newTrades)
    } else {
      const newTrades = [...tradesDown]
      newTrades[index] = team
      setTradesDown(newTrades)
    }
  }

  const handleTeamChange = (index, teamName) => {
    const newSelections = [...teamSelections]
    newSelections[index] = teamName
    setTeamSelections(newSelections)
  }

  const handleAutoFill = async () => {
    try {
      const [playersData, teamsData] = await Promise.all([
        getPlayers(),
        getTeams()
      ])

      // Shuffle players and pick first 32
      const shuffled = [...playersData].sort(() => Math.random() - 0.5)
      const randomPicks = shuffled.slice(0, 32)
      setPicks(randomPicks)

      // Shuffle teams and pick 6 for trades
      const shuffledTeams = [...teamsData].sort(() => Math.random() - 0.5)
      setTradesUp([shuffledTeams[0]?.name || '', shuffledTeams[1]?.name || '', shuffledTeams[2]?.name || ''])
      setTradesDown([shuffledTeams[3]?.name || '', shuffledTeams[4]?.name || '', shuffledTeams[5]?.name || ''])

      // Update search terms in DraftPicks component
      if (draftPicksRef.current?.updateSearchTerms) {
        draftPicksRef.current.updateSearchTerms(randomPicks.map(p => p?.name || ''))
      }
    } catch (error) {
      console.error('Error auto-filling:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-dark-100 text-white shadow-lg border-b border-dark-200">
        <div className="container mx-auto px-3 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">NFL Draft Game 2026</h1>
            <p className="mt-0.5 text-sm text-gray-400">Predict all 32 first-round picks, ya dog</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-dark-100 shadow-md sticky top-0 z-10 border-b border-dark-200">
        <div className="container mx-auto px-3">
          <div className="flex justify-center space-x-1 md:space-x-3 py-2">
            <button
              onClick={() => setCurrentView('predict')}
              className={`px-3 md:px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'predict'
                  ? 'bg-secondary text-white'
                  : 'text-gray-400 hover:bg-dark-200'
              }`}
            >
              {isLocked ? 'Submissions' : 'Make Picks'}
            </button>
            <button
              onClick={() => setCurrentView('leaderboard')}
              className={`px-3 md:px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'leaderboard'
                  ? 'bg-secondary text-white'
                  : 'text-gray-400 hover:bg-dark-200'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setCurrentView('rules')}
              className={`px-3 md:px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'rules'
                  ? 'bg-secondary text-white'
                  : 'text-gray-400 hover:bg-dark-200'
              }`}
            >
              Rules
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 md:px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'admin'
                  ? 'bg-secondary text-white'
                  : 'text-gray-400 hover:bg-dark-200'
              }`}
            >
              Commish
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-3 py-4">
        {currentView === 'predict' && isLocked && (
          <SubmissionsViewer />
        )}

        {currentView === 'predict' && !isLocked && (
          <div className="space-y-4">
            <DraftPicks
              ref={draftPicksRef}
              picks={picks}
              onPickChange={handlePickChange}
              teamSelections={teamSelections}
              onTeamChange={handleTeamChange}
            />
            <TradePredictions
              tradesUp={tradesUp}
              tradesDown={tradesDown}
              onTradeChange={handleTradeChange}
            />
            <SubmissionForm
              playerName={playerName}
              setPlayerName={setPlayerName}
              playerEmail={playerEmail}
              setPlayerEmail={setPlayerEmail}
              picks={picks}
              teamSelections={teamSelections}
              tradesUp={tradesUp}
              tradesDown={tradesDown}
              onSubmitSuccess={checkGameStatus}
            />
          </div>
        )}

        {currentView === 'leaderboard' && (
          <Leaderboard />
        )}

        {currentView === 'rules' && (
          <div className="bg-dark-100 rounded-lg shadow-md p-4 max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-white mb-4">Scoring Rules</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-4">
                <span className="text-yellow-400 font-bold text-base w-14 text-right shrink-0">5 pts</span>
                <span className="text-gray-300 text-sm">Correct player, pick number, <em>and</em> team</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-blue-400 font-bold text-base w-14 text-right shrink-0">3 pts</span>
                <span className="text-gray-300 text-sm">Correct player and pick number (wrong team)</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-gray-300 font-bold text-base w-14 text-right shrink-0">1 pt</span>
                <span className="text-gray-300 text-sm">Player drafted in the first round (wrong position)</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-green-400 font-bold text-base w-14 text-right shrink-0">2 pts</span>
                <span className="text-gray-300 text-sm">Correct team predicted to trade up or down</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-dark-300 text-xs text-gray-500">
              Winner takes all. Ties get split.
            </div>
          </div>
        )}

        {currentView === 'admin' && (
          <AdminPanel onUpdate={checkGameStatus} />
        )}
      </main>

    </div>
  )
}

export default App
