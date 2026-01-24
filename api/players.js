import express from 'express'
import { getPlayers } from './utils/sheets.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const players = await getPlayers()
    res.json(players)
  } catch (error) {
    console.error('Error fetching players:', error.message)
    console.error('Stack:', error.stack)
    // Return empty array instead of error
    res.json([])
  }
})

export default router
