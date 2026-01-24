// Set up Submissions sheet with all required headers
import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

dotenv.config({ path: '../.env' })

async function setupSubmissionsSheet() {
  try {
    console.log('Setting up Submissions sheet headers...\n')

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)
    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[0] // Sheet 1: Submissions

    // Build all headers
    const headers = ['Name', 'Timestamp']

    // Add 32 picks (Player, Position, College for each)
    for (let i = 1; i <= 32; i++) {
      headers.push(`Pick${i}_Player`)
      headers.push(`Pick${i}_Position`)
      headers.push(`Pick${i}_College`)
    }

    // Add trades
    headers.push('TradeUp1', 'TradeUp2', 'TradeUp3')
    headers.push('TradeDown1', 'TradeDown2', 'TradeDown3')

    console.log(`Setting ${headers.length} headers...`)

    // Resize sheet to fit all columns
    await sheet.resize({ columnCount: headers.length, rowCount: 1000 })
    console.log('Resized sheet to fit columns...')

    await sheet.setHeaderRow(headers)

    console.log('✅ Submissions sheet is now set up!')
    console.log(`\nHeaders created: ${headers.length}`)
    console.log('  - Name, Timestamp')
    console.log('  - Pick1_Player through Pick32_Player (plus Position and College)')
    console.log('  - TradeUp1, TradeUp2, TradeUp3')
    console.log('  - TradeDown1, TradeDown2, TradeDown3')
    console.log('\nYou can now submit predictions!')

  } catch (error) {
    console.error('❌ Error setting up sheet:', error.message)
  }
}

setupSubmissionsSheet()
