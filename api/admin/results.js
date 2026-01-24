import express from 'express'
import { saveDraftResults } from '../utils/sheets.js'

const router = express.Router()

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

router.post('/', async (req, res) => {
  try {
    const { password, results } = req.body

    if (!verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Invalid results data' })
    }

    await saveDraftResults(results)
    res.json({ success: true, message: 'Draft results saved successfully' })
  } catch (error) {
    console.error('Error saving draft results:', error)
    res.status(500).json({ error: 'Failed to save draft results' })
  }
})

export default router
