import express from 'express'
import { updateSetting } from '../utils/supabase.js'

const router = express.Router()

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

router.post('/', async (req, res) => {
  try {
    const { password, locked } = req.body

    if (!verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    await updateSetting('submission_locked', locked ? 'true' : 'false')
    res.json({ success: true, message: `Submissions ${locked ? 'locked' : 'unlocked'}` })
  } catch (error) {
    console.error('Error toggling lock:', error)
    res.status(500).json({ error: 'Failed to toggle lock' })
  }
})

export default router
