import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from parent directory BEFORE importing routes
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Dynamic imports to ensure env vars are loaded first
async function setupRoutes() {
  const playersRouter = (await import('./players.js')).default
  const teamsRouter = (await import('./teams.js')).default
  const submissionsRouter = (await import('./submissions.js')).default
  const leaderboardRouter = (await import('./leaderboard.js')).default
  const gameStatusRouter = (await import('./game-status.js')).default
  const adminResultsRouter = (await import('./admin/results.js')).default
  const adminLockRouter = (await import('./admin/lock.js')).default
  const adminCalculateRouter = (await import('./admin/calculate.js')).default
  const adminDraftStateRouter = (await import('./admin/draft-state.js')).default
  const adminResetRouter = (await import('./admin/reset.js')).default

  // Routes
  app.use('/api/players', playersRouter)
  app.use('/api/teams', teamsRouter)
  app.use('/api/submissions', submissionsRouter)
  app.use('/api/leaderboard', leaderboardRouter)
  app.use('/api/game-status', gameStatusRouter)
  app.use('/api/admin/results', adminResultsRouter)
  app.use('/api/admin/lock', adminLockRouter)
  app.use('/api/admin/calculate-scores', adminCalculateRouter)
  app.use('/api/admin-draft-state', adminDraftStateRouter)
  app.use('/api/admin-reset', adminResetRouter)

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
}

setupRoutes().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

export default app
