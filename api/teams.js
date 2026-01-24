import express from 'express'
import { getTeams } from './utils/sheets.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const teams = await getTeams()
    res.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error.message)
    console.error('Stack:', error.stack)
    // Return empty array instead of error
    res.json([])
  }
})

export default router
