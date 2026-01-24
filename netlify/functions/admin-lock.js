import { updateGameSettings } from '../../api/utils/sheets.js'

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { password, locked } = JSON.parse(event.body)

    if (!verifyPassword(password)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' })
      }
    }

    await updateGameSettings('submission_locked', locked ? 'true' : 'false')
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: `Submissions ${locked ? 'locked' : 'unlocked'}` })
    }
  } catch (error) {
    console.error('Error toggling lock:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to toggle lock' })
    }
  }
}
