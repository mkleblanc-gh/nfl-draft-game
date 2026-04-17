import axios from 'axios'

const API_BASE = '/api'

// Public endpoints
export const getPlayers = async () => {
  const response = await axios.get(`${API_BASE}/players`)
  return response.data
}

export const getTeams = async () => {
  const response = await axios.get(`${API_BASE}/teams`)
  return response.data
}

export const submitPrediction = async (data) => {
  const response = await axios.post(`${API_BASE}/submissions`, data, {
    timeout: 60000 // 60 second timeout for Google Sheets
  })
  return response.data
}

export const getSubmissions = async () => {
  const response = await axios.get(`${API_BASE}/submissions`)
  return response.data
}

export const getLeaderboard = async () => {
  const response = await axios.get(`${API_BASE}/leaderboard`)
  return response.data
}

export const getGameStatus = async () => {
  const response = await axios.get(`${API_BASE}/game-status`)
  return response.data
}

// Admin endpoints
export const submitDraftResults = async (password, results, tradesUp = [], tradesDown = []) => {
  const response = await axios.post(`${API_BASE}/admin-results`, {
    password,
    results,
    tradesUp,
    tradesDown
  })
  return response.data
}

export const toggleLock = async (password, locked) => {
  const response = await axios.post(`${API_BASE}/admin-lock`, {
    password,
    locked
  })
  return response.data
}

export const calculateScores = async (password) => {
  const response = await axios.post(`${API_BASE}/admin-calculate-scores`, {
    password
  })
  return response.data
}

export const getDraftState = async (password) => {
  const response = await axios.post(`${API_BASE}/admin-draft-state`, { password })
  return response.data
}

export const resetResults = async (password) => {
  const response = await axios.post(`${API_BASE}/admin-reset`, { password })
  return response.data
}
