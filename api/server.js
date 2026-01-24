import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Import routes
import playersRouter from './players.js'
import teamsRouter from './teams.js'
import submissionsRouter from './submissions.js'
import leaderboardRouter from './leaderboard.js'
import gameStatusRouter from './game-status.js'
import adminResultsRouter from './admin/results.js'
import adminLockRouter from './admin/lock.js'
import adminCalculateRouter from './admin/calculate.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/players', playersRouter)
app.use('/api/teams', teamsRouter)
app.use('/api/submissions', submissionsRouter)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/game-status', gameStatusRouter)
app.use('/api/admin/results', adminResultsRouter)
app.use('/api/admin/lock', adminLockRouter)
app.use('/api/admin/calculate-scores', adminCalculateRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Start server (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

export default app
