import { PrismaClient, Stage, MatchStatus } from '@prisma/client'
import { addMinutes } from 'date-fns'

const prisma = new PrismaClient()
const API_KEY = process.env.FOOTBALL_DATA_API_KEY

// ── Noms français des équipes ────────────────────────────────────────
const FR_NAMES: Record<string, string> = {
  'France': 'France',
  'Brazil': 'Brésil',
  'Argentina': 'Argentine',
  'Germany': 'Allemagne',
  'Spain': 'Espagne',
  'Portugal': 'Portugal',
  'England': 'Angleterre',
  'Netherlands': 'Pays-Bas',
  'Belgium': 'Belgique',
  'Italy': 'Italie',
  'Mexico': 'Mexique',
  'United States': 'États-Unis',
  'USA': 'États-Unis',
  'Canada': 'Canada',
  'Morocco': 'Maroc',
  'Senegal': 'Sénégal',
  'Algeria': 'Algérie',
  'Tunisia': 'Tunisie',
  'Cameroon': 'Cameroun',
  'Nigeria': 'Nigeria',
  'Ghana': 'Ghana',
  'South Africa': 'Afrique du Sud',
  'Egypt': 'Égypte',
  'Japan': 'Japon',
  'South Korea': 'Corée du Sud',
  'Korea Republic': 'Corée du Sud',
  'Australia': 'Australie',
  'Saudi Arabia': 'Arabie Saoudite',
  'China PR': 'Chine',
  'Iran': 'Iran',
  'Iraq': 'Irak',
  'Uruguay': 'Uruguay',
  'Colombia': 'Colombie',
  'Ecuador': 'Équateur',
  'Chile': 'Chili',
  'Paraguay': 'Paraguay',
  'Bolivia': 'Bolivie',
  'Jamaica': 'Jamaïque',
  'Panama': 'Panama',
  'Honduras': 'Honduras',
  'Venezuela': 'Venezuela',
  'Costa Rica': 'Costa Rica',
  'Poland': 'Pologne',
  'Ukraine': 'Ukraine',
  'Croatia': 'Croatie',
  'Denmark': 'Danemark',
  'Switzerland': 'Suisse',
  'Austria': 'Autriche',
  'Turkey': 'Turquie',
  'Scotland': 'Écosse',
  'Wales': 'Pays de Galles',
  "Côte d'Ivoire": "Côte d'Ivoire",
  'Ivory Coast': "Côte d'Ivoire",
  'New Zealand': 'Nouvelle-Zélande',
  'Peru': 'Pérou',
  'Serbia': 'Serbie',
  'Czech Republic': 'République Tchèque',
  'Slovakia': 'Slovaquie',
  'Romania': 'Roumanie',
  'Greece': 'Grèce',
  'Hungary': 'Hongrie',
  'Slovenia': 'Slovénie',
  'Albania': 'Albanie',
  'Georgia': 'Géorgie',
  'Angola': 'Angola',
  'DR Congo': 'RD Congo',
  'Mali': 'Mali',
  'Mozambique': 'Mozambique',
  'Tanzania': 'Tanzanie',
  'Zimbabwe': 'Zimbabwe',
  'Zambia': 'Zambie',
  'Uganda': 'Ouganda',
  'Bahrain': 'Bahreïn',
  'Indonesia': 'Indonésie',
  'Thailand': 'Thaïlande',
  'Uzbekistan': 'Ouzbékistan',
  'Qatar': 'Qatar',
}

function frName(en: string): string {
  return FR_NAMES[en] ?? en
}

function mapStage(s: string): Stage {
  const m: Record<string, Stage> = {
    GROUP_STAGE: Stage.GROUP,
    ROUND_OF_32: Stage.R32,
    ROUND_OF_16: Stage.R16,
    QUARTER_FINALS: Stage.QF,
    SEMI_FINALS: Stage.SF,
    FINAL: Stage.FINAL,
    THIRD_PLACE: Stage.SF,
  }
  return m[s] ?? Stage.GROUP
}

function mapStatus(s: string): MatchStatus {
  if (s === 'IN_PLAY' || s === 'PAUSED') return MatchStatus.LIVE
  if (s === 'FINISHED') return MatchStatus.FINISHED
  return MatchStatus.SCHEDULED
}

async function apiFetch(path: string) {
  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': API_KEY! },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`football-data.org ${res.status}: ${body}`)
  }
  return res.json()
}

async function main() {
  // ── Scoring rule (toujours) ──────────────────────────────────────
  await prisma.scoringRule.upsert({
    where:  { id: 1 },
    update: {},
    create: { id: 1, exactScore: 3, correctResult: 1, wrongPrediction: 0 },
  })

  if (!API_KEY) {
    console.warn('⚠️  FOOTBALL_DATA_API_KEY absent — import calendrier ignoré')
    return
  }

  console.log('🌱 Import calendrier officiel CM 2026 depuis football-data.org…')

  // ── 1. Récupérer tous les matchs ────────────────────────────────
  const data = await apiFetch('/competitions/WC/matches')
  const matches: any[] = data.matches ?? []

  if (matches.length === 0) {
    console.warn('⚠️  Aucun match retourné par l\'API')
    return
  }
  console.log(`📥 ${matches.length} matchs récupérés`)

  // ── 2. Collecter les équipes uniques depuis les matchs ──────────
  const teamsMap = new Map<number, any>()
  for (const m of matches) {
    if (m.homeTeam?.id && m.homeTeam.tla) teamsMap.set(m.homeTeam.id, m.homeTeam)
    if (m.awayTeam?.id && m.awayTeam.tla) teamsMap.set(m.awayTeam.id, m.awayTeam)
  }

  // ── 3. Upsert équipes ───────────────────────────────────────────
  for (const t of teamsMap.values()) {
    const nameEn = t.shortName ?? t.name ?? t.tla
    await prisma.team.upsert({
      where:  { code: t.tla },
      update: {
        name:     frName(nameEn),
        nameEn:   nameEn,
        flagUrl:  t.crest ?? null,
      },
      create: {
        code:        t.tla,
        name:        frName(nameEn),
        nameEn:      nameEn,
        flagUrl:     t.crest ?? null,
        group:       null,
        fifaRanking: 0,
      },
    })
  }
  console.log(`✓ ${teamsMap.size} équipes importées`)

  // ── 4. Groupes des équipes (depuis les matchs de groupe) ────────
  const teamGroups = new Map<string, string>()
  for (const m of matches) {
    if (m.stage !== 'GROUP_STAGE' || !m.group) continue
    const g = (m.group as string).replace('GROUP_', '')
    if (m.homeTeam?.tla) teamGroups.set(m.homeTeam.tla, g)
    if (m.awayTeam?.tla) teamGroups.set(m.awayTeam.tla, g)
  }
  for (const [code, group] of teamGroups) {
    await prisma.team.updateMany({ where: { code }, data: { group } })
  }

  // ── 5. Nettoyer les anciens matchs fictifs (extId WC2026-GRP-*) ─
  await prisma.prediction.deleteMany({
    where: { match: { externalId: { startsWith: 'WC2026-GRP-' } } },
  })
  await prisma.match.deleteMany({
    where: { externalId: { startsWith: 'WC2026-GRP-' } },
  })

  // ── 6. Upsert matchs ────────────────────────────────────────────
  let created = 0
  let updated = 0

  for (const m of matches) {
    if (!m.homeTeam?.tla || !m.awayTeam?.tla) continue // TBA (knockout non joués)

    const homeTeam = await prisma.team.findUnique({ where: { code: m.homeTeam.tla } })
    const awayTeam = await prisma.team.findUnique({ where: { code: m.awayTeam.tla } })
    if (!homeTeam || !awayTeam) continue

    const kickoffAt = new Date(m.utcDate)
    const cutoffAt  = addMinutes(kickoffAt, -5)
    const group     = m.group ? (m.group as string).replace('GROUP_', '') : null

    const existing = await prisma.match.findUnique({ where: { externalId: String(m.id) } })

    if (existing) {
      await prisma.match.update({
        where: { externalId: String(m.id) },
        data: {
          status:    mapStatus(m.status),
          homeScore: m.score?.fullTime?.home ?? null,
          awayScore: m.score?.fullTime?.away ?? null,
          kickoffAt,
          cutoffAt,
        },
      })
      updated++
    } else {
      await prisma.match.create({
        data: {
          externalId: String(m.id),
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          kickoffAt,
          cutoffAt,
          stage:     mapStage(m.stage),
          group,
          stadium:   m.venue ?? '',
          city:      '',
          status:    mapStatus(m.status),
          homeScore: m.score?.fullTime?.home ?? null,
          awayScore: m.score?.fullTime?.away ?? null,
        },
      })
      created++
    }
  }

  console.log(`✓ ${created} matchs créés, ${updated} mis à jour`)
  console.log('✅ Seed terminé')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
