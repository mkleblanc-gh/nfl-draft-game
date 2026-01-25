// NFL Team abbreviations for logo URLs
// Using ESPN CDN: https://a.espncdn.com/i/teamlogos/nfl/500/{abbr}.png

const teamAbbreviations = {
  'Tennessee Titans': 'ten',
  'Cleveland Browns': 'cle',
  'New York Giants': 'nyg',
  'New England Patriots': 'ne',
  'Jacksonville Jaguars': 'jax',
  'Las Vegas Raiders': 'lv',
  'New York Jets': 'nyj',
  'Carolina Panthers': 'car',
  'New Orleans Saints': 'no',
  'Chicago Bears': 'chi',
  'San Francisco 49ers': 'sf',
  'Dallas Cowboys': 'dal',
  'Miami Dolphins': 'mia',
  'Indianapolis Colts': 'ind',
  'Atlanta Falcons': 'atl',
  'Arizona Cardinals': 'ari',
  'Cincinnati Bengals': 'cin',
  'Seattle Seahawks': 'sea',
  'Tampa Bay Buccaneers': 'tb',
  'Denver Broncos': 'den',
  'Pittsburgh Steelers': 'pit',
  'Los Angeles Chargers': 'lac',
  'Green Bay Packers': 'gb',
  'Minnesota Vikings': 'min',
  'Houston Texans': 'hou',
  'Los Angeles Rams': 'lar',
  'Baltimore Ravens': 'bal',
  'Detroit Lions': 'det',
  'Washington Commanders': 'wsh',
  'Buffalo Bills': 'buf',
  'Kansas City Chiefs': 'kc',
  'Philadelphia Eagles': 'phi'
}

export function getTeamLogoUrl(teamName) {
  const abbr = teamAbbreviations[teamName]
  if (!abbr) return null
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`
}

export function getTeamAbbr(teamName) {
  return teamAbbreviations[teamName]?.toUpperCase() || ''
}
