import express from 'express'
import { getScores } from './utils/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const scores = await getScores()
    res.json(scores)
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message)
    // Return empty array instead of error
    res.json([])
  }
})

export default router
