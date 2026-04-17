import { saveSubmission, getLatestSubmissionPerEmail, getDraftResults, getGameSettings, getActualTrades } from '../../api/utils/supabase.js'

export async function handler(event, context) {
  if (event.httpMethod === 'GET') {
    try {
      const settings = await getGameSettings()
      if (settings.submission_locked !== 'true') {
        return { statusCode: 403, body: JSON.stringify({ error: 'Submissions are not yet visible' }) }
      }
      const [submissions, draftResults, actualTrades] = await Promise.all([
        getLatestSubmissionPerEmail(),
        getDraftResults(),
        getActualTrades()
      ])
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions, picksEntered: draftResults.length, draftResults, actualTrades })
      }
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch submissions' }) }
    }
  }

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

    // Validate submission
    if (!submission.name || !submission.picks || submission.picks.length !== 32) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid submission data' })
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
