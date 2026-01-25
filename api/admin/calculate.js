import express from 'express'
import { getSubmissions, getDraftResults, saveScores } from '../utils/supabase.js'
import { calculateScore } from '../utils/scoring.js'

const router = express.Router()

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

router.post('/', async (req, res) => {
  try {
    const { password } = req.body

    if (!verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Get submissions and draft results
    const submissions = await getSubmissions()
    const draftResults = await getDraftResults()

    if (draftResults.length === 0) {
      return res.status(400).json({ error: 'No draft results available. Please enter results first.' })
    }

    // Calculate scores for each submission
    const scores = submissions.map(submission => {
      return calculateScore(submission, draftResults, {
        teamsUp: [], // TODO: Track actual trades if needed
        teamsDown: []
      })
    })

    // Save scores
    await saveScores(scores)

    res.json({
      success: true,
      message: `Scores calculated for ${scores.length} submissions`,
      scoresCount: scores.length
    })
  } catch (error) {
    console.error('Error calculating scores:', error)
    res.status(500).json({ error: 'Failed to calculate scores' })
  }
})

export default router
