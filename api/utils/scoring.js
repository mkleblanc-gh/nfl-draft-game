/**
 * Calculate scores for a submission based on actual draft results
 *
 * Scoring rules:
 * - 5 points: correct player + pick number + team
 * - 3 points: correct player + pick number (wrong team)
 * - 3 points: correct player + team (wrong pick number)
 * - 1 point: player drafted in first round (wrong position and wrong team)
 * - 2 points per occurrence: team correctly predicted to trade up or down
 *
 * Note: Points don't stack — highest matching tier only.
 */
export function calculateScore(submission, draftResults, tradeData = { teamsUp: [], teamsDown: [] }) {
  let firstRoundPoints = 0
  let pickNumberPoints = 0
  let teamPoints = 0
  let tradePoints = 0

  // Get list of all players drafted in first round
  const firstRoundPlayers = draftResults.map(result => result.player_name.toLowerCase())

  // Build maps for quick lookup
  const playerToPickMap = {} // player -> pick number
  const pickToPlayerAndTeamMap = {} // pick -> { player, team }

  draftResults.forEach(result => {
    const playerLower = result.player_name.toLowerCase()
    playerToPickMap[playerLower] = result.pick_number
    pickToPlayerAndTeamMap[result.pick_number] = {
      player: playerLower,
      team: result.team_name.toLowerCase()
    }
  })

  // Calculate points for picks
  submission.picks.forEach((pick, index) => {
    const predictedPlayerLower = pick.playerName.toLowerCase()
    const pickNumber = index + 1

    // Check if player was drafted in first round
    const wasPickedInFirstRound = firstRoundPlayers.includes(predictedPlayerLower)

    // Get actual result for this pick number
    const actualResult = pickToPlayerAndTeamMap[pickNumber]

    if (!actualResult) return // No result for this pick yet

    const actualPlayer = actualResult.player
    const actualTeam = actualResult.team

    // Get predicted team: use user's selection if set, otherwise default team for this pick
    const predictedTeam = (pick.predictedTeam || getTeamForPick(pickNumber)).toLowerCase()

    // Check matches (no stacking - highest points only)
    if (actualPlayer === predictedPlayerLower && actualTeam === predictedTeam) {
      // Perfect match: correct player + pick + team = 5 points
      teamPoints += 5
    } else if (actualPlayer === predictedPlayerLower) {
      // Correct player and pick number (wrong team) = 3 points
      pickNumberPoints += 3
    } else if (wasPickedInFirstRound) {
      // Player drafted in first round at a different position
      // Check if the predicted team also matches where they were actually drafted
      const actualPickForPlayer = playerToPickMap[predictedPlayerLower]
      const actualResultForPlayer = pickToPlayerAndTeamMap[actualPickForPlayer]
      if (actualResultForPlayer && actualResultForPlayer.team === predictedTeam) {
        // Correct player + correct team, wrong position = 3 points
        pickNumberPoints += 3
      } else {
        // Correct player in first round, wrong position and wrong team = 1 point
        firstRoundPoints += 1
      }
    }
  })

  // Calculate trade points (field is trade_up/trade_down from Supabase)
  // A team can appear multiple times in actual trades (traded multiple times).
  // Award 2 pts per actual occurrence that the user predicted.
  const tradesUp = submission.trade_up || submission.tradesUp || []
  const tradesDown = submission.trade_down || submission.tradesDown || []

  const countOccurrences = (arr) => {
    const counts = {}
    arr.forEach(t => {
      const key = t.toLowerCase()
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }

  const actualUpCounts = countOccurrences(tradeData.teamsUp)
  tradesUp.forEach(team => {
    const key = team.toLowerCase()
    if (actualUpCounts[key]) {
      tradePoints += 2 * actualUpCounts[key]
    }
  })

  const actualDownCounts = countOccurrences(tradeData.teamsDown)
  tradesDown.forEach(team => {
    const key = team.toLowerCase()
    if (actualDownCounts[key]) {
      tradePoints += 2 * actualDownCounts[key]
    }
  })

  const totalScore = firstRoundPoints + pickNumberPoints + teamPoints + tradePoints

  return {
    email: submission.email,
    name: submission.name || null,
    firstRoundPoints,
    pickNumberPoints,
    teamPoints,
    tradePoints,
    totalScore,
    timestamp: submission.timestamp
  }
}

function getTeamForPick(pickNumber) {
  const teams = [
    "Tennessee Titans",
    "Cleveland Browns",
    "New York Giants",
    "New England Patriots",
    "Jacksonville Jaguars",
    "Las Vegas Raiders",
    "New York Jets",
    "Carolina Panthers",
    "New Orleans Saints",
    "Chicago Bears",
    "San Francisco 49ers",
    "Dallas Cowboys",
    "Miami Dolphins",
    "Indianapolis Colts",
    "Atlanta Falcons",
    "Arizona Cardinals",
    "Cincinnati Bengals",
    "Seattle Seahawks",
    "Tampa Bay Buccaneers",
    "Denver Broncos",
    "Pittsburgh Steelers",
    "Los Angeles Chargers",
    "Green Bay Packers",
    "Minnesota Vikings",
    "Houston Texans",
    "Los Angeles Rams",
    "Baltimore Ravens",
    "Detroit Lions",
    "Washington Commanders",
    "Buffalo Bills",
    "Kansas City Chiefs",
    "Philadelphia Eagles"
  ]

  return teams[pickNumber - 1] || ''
}
