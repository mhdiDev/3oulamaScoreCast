const BASE = 'https://api.football-data.org/v4'
const COMPETITION = 'WC' // World Cup

export interface ApiMatch {
  id: number
  status: 'SCHEDULED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'CANCELLED' | 'POSTPONED'
  score: {
    fullTime: { home: number | null; away: number | null }
  }
}

export async function fetchLiveAndFinishedMatches(): Promise<ApiMatch[]> {
  const res = await fetch(
    `${BASE}/competitions/${COMPETITION}/matches?status=IN_PLAY,PAUSED,FINISHED`,
    {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY! },
      next: { revalidate: 0 },
    },
  )
  if (!res.ok) throw new Error(`football-data.org error: ${res.status}`)
  const data = await res.json()
  return data.matches ?? []
}

export function mapApiStatus(apiStatus: ApiMatch['status']): 'SCHEDULED' | 'LIVE' | 'FINISHED' {
  if (apiStatus === 'IN_PLAY' || apiStatus === 'PAUSED') return 'LIVE'
  if (apiStatus === 'FINISHED') return 'FINISHED'
  return 'SCHEDULED'
}
