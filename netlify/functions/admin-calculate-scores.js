import { getSubmissions, getDraftResults, saveScores, getActualTrades } from '../../api/utils/supabase.js'
import { calculateScore } from '../../api/utils/scoring.js'

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { password } = JSON.parse(event.body)

    if (!verifyPassword(password)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' })
      }
    }

    // Get submissions, draft results, and actual trades
    const [submissions, draftResults, actualTrades] = await Promise.all([
      getSubmissions(),
      getDraftResults(),
      getActualTrades()
    ])

    if (draftResults.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No draft results available. Please enter results first.' })
      }
    }

    // Calculate scores for each submission
    const scores = submissions.map(submission => {
      return calculateScore(submission, draftResults, {
        teamsUp: actualTrades.tradesUp || [],
        teamsDown: actualTrades.tradesDown || []
      })
    })

    // Save scores
    await saveScores(scores)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: `Scores calculated for ${scores.length} submissions`,
        scoresCount: scores.length
      })
    }
  } catch (error) {
    console.error('Error calculating scores:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to calculate scores' })
    }
  }
}
