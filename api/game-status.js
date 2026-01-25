import express from 'express'
import { getGameSettings } from './utils/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const settings = await getGameSettings()
    const isLocked = settings.submission_locked?.toLowerCase() === 'true'
    res.json({
      locked: isLocked,
      deadline: settings.deadline || null
    })
  } catch (error) {
    console.error('Error fetching game status:', error.message)
    // Return default values instead of 500 error
    res.json({
      locked: false,
      deadline: null
    })
  }
})

export default router
