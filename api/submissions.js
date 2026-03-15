import express from 'express'
import { saveSubmission, getLatestSubmissionPerEmail, getDraftResults, getGameSettings } from './utils/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const settings = await getGameSettings()
    const isLocked = settings.submission_locked?.toLowerCase() === 'true'
    if (!isLocked) {
      return res.status(403).json({ error: 'Submissions are not yet visible' })
    }
    const [submissions, draftResults] = await Promise.all([
      getLatestSubmissionPerEmail(),
      getDraftResults()
    ])
    res.json({ submissions, picksEntered: draftResults.length })
  } catch (error) {
    console.error('❌ Error fetching submissions:', error)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
})

router.post('/', async (req, res) => {
  try {
    console.log('📝 Received submission request from:', req.body.email)

    // Check if submissions are locked
    const settings = await getGameSettings()
    const isLocked = settings.submission_locked?.toLowerCase() === 'true'
    if (isLocked) {
      console.log('❌ Submissions are locked')
      return res.status(403).json({ error: 'Submissions are currently locked' })
    }

    const submission = req.body

    // Validate submission
    if (!submission.email || !submission.picks || submission.picks.length !== 32) {
      console.log('❌ Invalid submission data')
      return res.status(400).json({ error: 'Invalid submission data' })
    }

    console.log('💾 Saving submission...')
    await saveSubmission(submission)
    console.log('✅ Submission saved successfully!')

    res.json({ success: true, message: 'Submission saved successfully' })
  } catch (error) {
    console.error('❌ Error saving submission:', error)
    console.error('Error details:', error.stack)
    res.status(500).json({ error: 'Failed to save submission' })
  }
})

export default router
