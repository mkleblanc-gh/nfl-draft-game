import express from 'express'
import { getDraftResults, getActualTrades } from '../utils/supabase.js'

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

    const [draftResults, actualTrades] = await Promise.all([
      getDraftResults(),
      getActualTrades()
    ])

    res.json({ draftResults, actualTrades })
  } catch (error) {
    console.error('Error fetching draft state:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch draft state' })
  }
})

export default router
