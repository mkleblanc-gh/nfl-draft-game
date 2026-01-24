import { useState, useEffect } from 'react'
import DraftPicks from './components/DraftPicks'
import TradePredictions from './components/TradePredictions'
import SubmissionForm from './components/SubmissionForm'
import Leaderboard from './components/Leaderboard'
import AdminPanel from './components/AdminPanel'
import { getGameStatus } from './utils/api'

function App() {
  const [currentView, setCurrentView] = useState('predict') // 'predict', 'leaderboard', 'admin'
  const [picks, setPicks] = useState(Array(32).fill(null))
  const [tradesUp, setTradesUp] = useState(['', '', ''])
  const [tradesDown, setTradesDown] = useState(['', '', ''])
  const [playerName, setPlayerName] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            NFL Draft Game 2026
          </h1>
          <p className="text-center mt-2 text-blue-200">
            Predict all 32 first-round picks and win!
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-1 md:space-x-4 py-3">
            <button
              onClick={() => setCurrentView('predict')}
              className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'predict'
                  ? 'bg-secondary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Make Picks
            </button>
            <button
              onClick={() => setCurrentView('leaderboard')}
              className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'leaderboard'
                  ? 'bg-secondary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'admin'
                  ? 'bg-secondary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLocked && currentView === 'predict' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">Submissions are closed</p>
            <p>The draft has started. Check the leaderboard for results!</p>
          </div>
        )}

        {currentView === 'predict' && !isLocked && (
          <div className="space-y-8">
            <DraftPicks picks={picks} onPickChange={handlePickChange} />
            <TradePredictions
              tradesUp={tradesUp}
              tradesDown={tradesDown}
              onTradeChange={handleTradeChange}
            />
            <SubmissionForm
              playerName={playerName}
              setPlayerName={setPlayerName}
              picks={picks}
              tradesUp={tradesUp}
              tradesDown={tradesDown}
              onSubmitSuccess={checkGameStatus}
            />
          </div>
        )}

        {currentView === 'leaderboard' && (
          <Leaderboard />
        )}

        {currentView === 'admin' && (
          <AdminPanel onUpdate={checkGameStatus} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Rules:</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• One point for each player picked who is drafted in the first round</li>
              <li>• Three points for correct player and pick number</li>
              <li>• Five points for correct player, selection, and team</li>
              <li>• Two points for each correct team that trades (up or down)</li>
              <li>• Winner takes all. Ties get split.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
