import express from 'express'
import { resetResults } from '../utils/supabase.js'

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

    await resetResults()
    res.json({ success: true, message: 'Results reset successfully' })
  } catch (error) {
    console.error('Error resetting results:', error)
    res.status(500).json({ error: error.message || 'Failed to reset results' })
  }
})

export default router
