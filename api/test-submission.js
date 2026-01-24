// Test submission to Google Sheet
import dotenv from 'dotenv'
import { saveSubmission } from './utils/sheets.js'

dotenv.config({ path: '../.env' })

async function testSubmission() {
  try {
    console.log('Testing submission...\n')

    const testData = {
      name: 'Test User',
      picks: Array(32).fill(null).map((_, i) => ({
        pick: i + 1,
        playerName: 'Travis Hunter',
        position: 'CB/WR',
        college: 'Colorado'
      })),
      tradesUp: ['Tennessee Titans', 'Cleveland Browns', 'New York Giants'],
      tradesDown: ['Buffalo Bills', 'Kansas City Chiefs', 'Philadelphia Eagles'],
      timestamp: new Date().toISOString()
    }

    console.log('Submitting test data...')
    await saveSubmission(testData)
    console.log('✅ Test submission successful!')
    console.log('\nCheck your Google Sheet "Submissions" tab - you should see a new row with:')
    console.log('  Name: Test User')
    console.log('  32 picks (all Travis Hunter for testing)')
    console.log('  Trade predictions')

  } catch (error) {
    console.error('❌ Test submission failed!')
    console.error('Error:', error.message)
    console.error('\nFull error:')
    console.error(error)
  }
}

testSubmission()
