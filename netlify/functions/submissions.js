import { saveSubmission, getGameSettings } from '../../api/utils/supabase.js'

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    // Check if submissions are locked
    const settings = await getGameSettings()
    if (settings.submission_locked === 'true') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Submissions are currently locked' })
      }
    }

    const submission = JSON.parse(event.body)

    // Validate submission - email required, name optional
    if (!submission.email || !submission.picks || submission.picks.length !== 32) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and 32 picks are required' })
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(submission.email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please enter a valid email address' })
      }
    }

    await saveSubmission(submission)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Submission saved successfully' })
    }
  } catch (error) {
    console.error('Error saving submission:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save submission' })
    }
  }
}
