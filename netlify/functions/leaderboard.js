import { getScores } from '../../api/utils/sheets.js'

export async function handler(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const scores = await getScores()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scores)
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch leaderboard' })
    }
  }
}
