import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

let doc = null
let isConnecting = false
let connectionPromise = null

async function getDoc() {
  if (doc) return doc

  // If already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    return connectionPromise
  }

  isConnecting = true

  connectionPromise = (async () => {
    try {
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })

      const newDoc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)

      // Add timeout to loadInfo
      const loadPromise = newDoc.loadInfo()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Google Sheets connection timeout')), 10000)
      )

      await Promise.race([loadPromise, timeoutPromise])

      doc = newDoc
      isConnecting = false
      return doc
    } catch (error) {
      doc = null // Reset doc on error
      isConnecting = false
      connectionPromise = null
      throw error
    }
  })()

  return connectionPromise
}

export async function getSheet(index) {
  const document = await getDoc()
  return document.sheetsByIndex[index]
}

export async function getPlayers() {
  const sheet = await getSheet(1) // Sheet 2: Players
  const rows = await sheet.getRows()

  return rows.map(row => ({
    name: row.get('PlayerName') || '',
    position: row.get('Position') || '',
    college: row.get('College') || '',
    projectedRound: row.get('Projected Round') || ''
  }))
}

export async function getTeams() {
  try {
    const sheet = await getSheet(0) // Sheet 1: Teams (from Submissions sheet structure)
    // For now, return hardcoded teams with 2025 draft order
    // In production, this could be a separate sheet
    return getDefaultTeams()
  } catch (error) {
    console.error('Error getting teams:', error)
    return getDefaultTeams()
  }
}

export async function saveSubmission(submission) {
  try {
    const sheet = await getSheet(0) // Sheet 1: Submissions

    // Build row data
    const rowData = {
      Name: submission.name,
      Timestamp: submission.timestamp
    }

    // Add all 32 picks
    submission.picks.forEach((pick, index) => {
      rowData[`Pick${index + 1}_Player`] = pick.playerName
      rowData[`Pick${index + 1}_Position`] = pick.position
      rowData[`Pick${index + 1}_College`] = pick.college
    })

    // Add trades
    submission.tradesUp.forEach((team, index) => {
      rowData[`TradeUp${index + 1}`] = team
    })
    submission.tradesDown.forEach((team, index) => {
      rowData[`TradeDown${index + 1}`] = team
    })

    await sheet.addRow(rowData)
    return { success: true }
  } catch (error) {
    console.error('Error saving submission:', error)
    throw error
  }
}

export async function getSubmissions() {
  try {
    const sheet = await getSheet(0) // Sheet 1: Submissions
    const rows = await sheet.getRows()

    return rows.map(row => {
      const picks = []
      for (let i = 1; i <= 32; i++) {
        picks.push({
          pick: i,
          playerName: row.get(`Pick${i}_Player`) || '',
          position: row.get(`Pick${i}_Position`) || '',
          college: row.get(`Pick${i}_College`) || ''
        })
      }

      const tradesUp = []
      const tradesDown = []
      for (let i = 1; i <= 3; i++) {
        const tradeUp = row.get(`TradeUp${i}`)
        const tradeDown = row.get(`TradeDown${i}`)
        if (tradeUp) tradesUp.push(tradeUp)
        if (tradeDown) tradesDown.push(tradeDown)
      }

      return {
        name: row.get('Name') || '',
        timestamp: row.get('Timestamp') || '',
        picks,
        tradesUp,
        tradesDown,
        rowIndex: row.rowNumber
      }
    })
  } catch (error) {
    console.error('Error getting submissions:', error)
    return []
  }
}

export async function getDraftResults() {
  try {
    const sheet = await getSheet(2) // Sheet 3: Draft Results
    const rows = await sheet.getRows()

    return rows.map(row => ({
      pick: parseInt(row.get('Pick')) || 0,
      team: row.get('Team') || '',
      player: row.get('ActualPlayer') || ''
    }))
  } catch (error) {
    console.error('Error getting draft results:', error)
    return []
  }
}

export async function saveDraftResults(results) {
  try {
    const sheet = await getSheet(2) // Sheet 3: Draft Results

    // Clear existing data
    await sheet.clear()

    // Set headers
    await sheet.setHeaderRow(['Pick', 'Team', 'ActualPlayer'])

    // Add results
    for (const result of results) {
      await sheet.addRow({
        Pick: result.pick,
        Team: result.team,
        ActualPlayer: result.player
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving draft results:', error)
    throw error
  }
}

export async function saveScores(scores) {
  try {
    const sheet = await getSheet(3) // Sheet 4: Scores

    // Clear existing data
    await sheet.clear()

    // Set headers
    await sheet.setHeaderRow([
      'Name',
      'FirstRoundPoints',
      'PickNumberPoints',
      'TeamPoints',
      'TradePoints',
      'TotalScore',
      'Timestamp'
    ])

    // Add scores
    for (const score of scores) {
      await sheet.addRow({
        Name: score.name,
        FirstRoundPoints: score.firstRoundPoints,
        PickNumberPoints: score.pickNumberPoints,
        TeamPoints: score.teamPoints,
        TradePoints: score.tradePoints,
        TotalScore: score.totalScore,
        Timestamp: score.timestamp
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving scores:', error)
    throw error
  }
}

export async function getScores() {
  try {
    const sheet = await getSheet(3) // Sheet 4: Scores
    const rows = await sheet.getRows()

    return rows.map(row => ({
      name: row.get('Name') || '',
      firstRoundPoints: parseInt(row.get('FirstRoundPoints')) || 0,
      pickNumberPoints: parseInt(row.get('PickNumberPoints')) || 0,
      teamPoints: parseInt(row.get('TeamPoints')) || 0,
      tradePoints: parseInt(row.get('TradePoints')) || 0,
      totalScore: parseInt(row.get('TotalScore')) || 0,
      timestamp: row.get('Timestamp') || ''
    })).sort((a, b) => b.totalScore - a.totalScore)
  } catch (error) {
    console.error('Error getting scores:', error)
    // Return submissions without scores if scoring hasn't been done
    const submissions = await getSubmissions()
    return submissions.map(sub => ({
      name: sub.name,
      firstRoundPoints: 0,
      pickNumberPoints: 0,
      teamPoints: 0,
      tradePoints: 0,
      totalScore: 0,
      timestamp: sub.timestamp
    }))
  }
}

export async function getGameSettings() {
  try {
    const sheet = await getSheet(4) // Sheet 5: Settings
    const rows = await sheet.getRows()

    const settings = {}
    rows.forEach(row => {
      const key = row.get('Key')
      const value = row.get('Value')
      if (key) settings[key] = value
    })

    return settings
  } catch (error) {
    console.error('Error getting game settings:', error)
    return { submission_locked: 'false' }
  }
}

export async function updateGameSettings(key, value) {
  try {
    const sheet = await getSheet(4) // Sheet 5: Settings
    const rows = await sheet.getRows()

    // Find existing row
    let row = rows.find(r => r.get('Key') === key)

    if (row) {
      row.set('Value', value.toString())
      await row.save()
    } else {
      await sheet.addRow({ Key: key, Value: value.toString() })
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating game settings:', error)
    throw error
  }
}

// Helper function for default teams (2025 NFL Draft order)
function getDefaultTeams() {
  // 2025 NFL Draft order (approximate)
  return [
    { pick: 1, name: "Tennessee Titans" },
    { pick: 2, name: "Cleveland Browns" },
    { pick: 3, name: "New York Giants" },
    { pick: 4, name: "New England Patriots" },
    { pick: 5, name: "Jacksonville Jaguars" },
    { pick: 6, name: "Las Vegas Raiders" },
    { pick: 7, name: "New York Jets" },
    { pick: 8, name: "Carolina Panthers" },
    { pick: 9, name: "New Orleans Saints" },
    { pick: 10, name: "Chicago Bears" },
    { pick: 11, name: "San Francisco 49ers" },
    { pick: 12, name: "Dallas Cowboys" },
    { pick: 13, name: "Miami Dolphins" },
    { pick: 14, name: "Indianapolis Colts" },
    { pick: 15, name: "Atlanta Falcons" },
    { pick: 16, name: "Arizona Cardinals" },
    { pick: 17, name: "Cincinnati Bengals" },
    { pick: 18, name: "Seattle Seahawks" },
    { pick: 19, name: "Tampa Bay Buccaneers" },
    { pick: 20, name: "Denver Broncos" },
    { pick: 21, name: "Pittsburgh Steelers" },
    { pick: 22, name: "Los Angeles Chargers" },
    { pick: 23, name: "Green Bay Packers" },
    { pick: 24, name: "Minnesota Vikings" },
    { pick: 25, name: "Houston Texans" },
    { pick: 26, name: "Los Angeles Rams" },
    { pick: 27, name: "Baltimore Ravens" },
    { pick: 28, name: "Detroit Lions" },
    { pick: 29, name: "Washington Commanders" },
    { pick: 30, name: "Buffalo Bills" },
    { pick: 31, name: "Kansas City Chiefs" },
    { pick: 32, name: "Philadelphia Eagles" }
  ]
}
