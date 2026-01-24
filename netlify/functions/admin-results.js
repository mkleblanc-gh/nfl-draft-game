import { saveDraftResults } from '../../api/utils/sheets.js'

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { password, results } = JSON.parse(event.body)

    if (!verifyPassword(password)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' })
      }
    }

    if (!results || !Array.isArray(results)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid results data' })
      }
    }

    await saveDraftResults(results)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Draft results saved successfully' })
    }
  } catch (error) {
    console.error('Error saving draft results:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save draft results' })
    }
  }
}
