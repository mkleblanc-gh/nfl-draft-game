// Show all players from Google Sheet
import dotenv from 'dotenv'
import { getPlayers } from './utils/sheets.js'

dotenv.config({ path: '../.env' })

async function showPlayers() {
  try {
    console.log('Fetching players from Google Sheet...\n')
    const players = await getPlayers()

    console.log(`✅ Found ${players.length} players:\n`)

    players.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name}`)
      console.log(`   Position: ${player.position}`)
      console.log(`   College: ${player.college}`)
      console.log(`   Projected Round: ${player.projectedRound}`)
      console.log('')
    })

    console.log('---')
    console.log('Note: If you see more than what you added to your Google Sheet,')
    console.log('it means the API is using fallback sample data.')
    console.log('')
    console.log('To fix this, add more players to the "Players" sheet in your')
    console.log('Google Spreadsheet with these columns:')
    console.log('  - PlayerName')
    console.log('  - Position')
    console.log('  - College')
    console.log('  - Projected Round')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

showPlayers()
