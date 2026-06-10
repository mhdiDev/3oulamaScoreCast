import { PrismaClient, Stage, MatchStatus } from '@prisma/client'
import { addMinutes } from 'date-fns'

const prisma = new PrismaClient()

// ── 48 équipes CM 2026 ──────────────────────────────────────────
const teams = [
  // Groupe A
  { code: 'USA', name: 'États-Unis', nameEn: 'United States', group: 'A', fifaRanking: 13 },
  { code: 'MEX', name: 'Mexique',    nameEn: 'Mexico',        group: 'A', fifaRanking: 16 },
  { code: 'CAN', name: 'Canada',     nameEn: 'Canada',        group: 'A', fifaRanking: 49 },
  { code: 'PAN', name: 'Panama',     nameEn: 'Panama',        group: 'A', fifaRanking: 82 },
  // Groupe B
  { code: 'ARG', name: 'Argentine',  nameEn: 'Argentina',     group: 'B', fifaRanking: 1  },
  { code: 'CHI', name: 'Chili',      nameEn: 'Chile',         group: 'B', fifaRanking: 42 },
  { code: 'PER', name: 'Pérou',      nameEn: 'Peru',          group: 'B', fifaRanking: 64 },
  { code: 'AUS', name: 'Australie',  nameEn: 'Australia',     group: 'B', fifaRanking: 23 },
  // Groupe C
  { code: 'BRA', name: 'Brésil',     nameEn: 'Brazil',        group: 'C', fifaRanking: 5  },
  { code: 'COL', name: 'Colombie',   nameEn: 'Colombia',      group: 'C', fifaRanking: 9  },
  { code: 'PAR', name: 'Paraguay',   nameEn: 'Paraguay',      group: 'C', fifaRanking: 66 },
  { code: 'AHO', name: 'Curaçao',    nameEn: 'Curaçao',       group: 'C', fifaRanking: 80 },
  // Groupe D
  { code: 'URU', name: 'Uruguay',    nameEn: 'Uruguay',       group: 'D', fifaRanking: 7  },
  { code: 'ECU', name: 'Équateur',   nameEn: 'Ecuador',       group: 'D', fifaRanking: 45 },
  { code: 'BOL', name: 'Bolivie',    nameEn: 'Bolivia',       group: 'D', fifaRanking: 85 },
  { code: 'JAM', name: 'Jamaïque',   nameEn: 'Jamaica',       group: 'D', fifaRanking: 55 },
  // Groupe E
  { code: 'FRA', name: 'France',     nameEn: 'France',        group: 'E', fifaRanking: 2  },
  { code: 'MAR', name: 'Maroc',      nameEn: 'Morocco',       group: 'E', fifaRanking: 14 },
  { code: 'ALG', name: 'Algérie',    nameEn: 'Algeria',       group: 'E', fifaRanking: 36 },
  { code: 'TUN', name: 'Tunisie',    nameEn: 'Tunisia',       group: 'E', fifaRanking: 30 },
  // Groupe F
  { code: 'ESP', name: 'Espagne',    nameEn: 'Spain',         group: 'F', fifaRanking: 6  },
  { code: 'POR', name: 'Portugal',   nameEn: 'Portugal',      group: 'F', fifaRanking: 6  },
  { code: 'SEN', name: 'Sénégal',    nameEn: 'Senegal',       group: 'F', fifaRanking: 18 },
  { code: 'TGO', name: 'Togo',       nameEn: 'Togo',          group: 'F', fifaRanking: 94 },
  // Groupe G
  { code: 'GER', name: 'Allemagne',  nameEn: 'Germany',       group: 'G', fifaRanking: 16 },
  { code: 'NED', name: 'Pays-Bas',   nameEn: 'Netherlands',   group: 'G', fifaRanking: 8  },
  { code: 'AUT', name: 'Autriche',   nameEn: 'Austria',       group: 'G', fifaRanking: 25 },
  { code: 'TUR', name: 'Turquie',    nameEn: 'Turkey',        group: 'G', fifaRanking: 40 },
  // Groupe H
  { code: 'ENG', name: 'Angleterre', nameEn: 'England',       group: 'H', fifaRanking: 4  },
  { code: 'IRI', name: 'Iran',       nameEn: 'Iran',          group: 'H', fifaRanking: 22 },
  { code: 'WAL', name: 'Pays de Galles', nameEn: 'Wales',     group: 'H', fifaRanking: 26 },
  { code: 'IRQ', name: 'Irak',       nameEn: 'Iraq',          group: 'H', fifaRanking: 63 },
  // Groupe I
  { code: 'JPN', name: 'Japon',      nameEn: 'Japan',         group: 'I', fifaRanking: 17 },
  { code: 'KOR', name: 'Corée du Sud', nameEn: 'South Korea', group: 'I', fifaRanking: 23 },
  { code: 'SAU', name: 'Arabie Saoudite', nameEn: 'Saudi Arabia', group: 'I', fifaRanking: 56 },
  { code: 'CHN', name: 'Chine',      nameEn: 'China',         group: 'I', fifaRanking: 88 },
  // Groupe J
  { code: 'BEL', name: 'Belgique',   nameEn: 'Belgium',       group: 'J', fifaRanking: 3  },
  { code: 'ITA', name: 'Italie',     nameEn: 'Italy',         group: 'J', fifaRanking: 9  },
  { code: 'SUI', name: 'Suisse',     nameEn: 'Switzerland',   group: 'J', fifaRanking: 19 },
  { code: 'UKR', name: 'Ukraine',    nameEn: 'Ukraine',       group: 'J', fifaRanking: 21 },
  // Groupe K
  { code: 'CRO', name: 'Croatie',    nameEn: 'Croatia',       group: 'K', fifaRanking: 10 },
  { code: 'DAN', name: 'Danemark',   nameEn: 'Denmark',       group: 'K', fifaRanking: 13 },
  { code: 'SCO', name: 'Écosse',     nameEn: 'Scotland',      group: 'K', fifaRanking: 39 },
  { code: 'CIV', name: "Côte d'Ivoire", nameEn: 'Ivory Coast', group: 'K', fifaRanking: 50 },
  // Groupe L
  { code: 'PT2', name: 'Portugal B', nameEn: 'Portugal B',   group: 'L', fifaRanking: 6  },
  { code: 'MX2', name: 'Mexique B',  nameEn: 'Mexico B',     group: 'L', fifaRanking: 16 },
  { code: 'NGA', name: 'Nigeria',    nameEn: 'Nigeria',       group: 'L', fifaRanking: 30 },
  { code: 'GHA', name: 'Ghana',      nameEn: 'Ghana',         group: 'L', fifaRanking: 60 },
]

// Helper : kickoffAt → cutoffAt = kickoffAt - 5min
function cutoff(d: Date): Date {
  return addMinutes(d, -5)
}

// ── Matchs phase de groupes (simplifié — 72 matchs, 6 par groupe) ──
// Pour chaque groupe de 4 équipes : 6 matchs (round-robin)
// Dates fictives à partir du 11 juin 2026
function groupMatches(
  groupLetter: string,
  teamCodes: string[],
  baseDate: Date,
): Array<{
  externalId: string
  homeCode: string
  awayCode: string
  kickoffAt: Date
  stage: Stage
  group: string
  stadium: string
  city: string
}> {
  const pairs = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ] as [number, number][]

  const stadiums: Record<string, { stadium: string; city: string }> = {
    A: { stadium: 'SoFi Stadium',           city: 'Los Angeles' },
    B: { stadium: 'MetLife Stadium',         city: 'New York' },
    C: { stadium: 'AT&T Stadium',            city: 'Dallas' },
    D: { stadium: 'NRG Stadium',             city: 'Houston' },
    E: { stadium: 'Levi\'s Stadium',         city: 'San Francisco' },
    F: { stadium: 'Hard Rock Stadium',       city: 'Miami' },
    G: { stadium: 'Arrowhead Stadium',       city: 'Kansas City' },
    H: { stadium: 'Lincoln Financial Field', city: 'Philadelphie' },
    I: { stadium: 'Estadio Azteca',          city: 'Mexico City' },
    J: { stadium: 'Estadio BBVA',            city: 'Monterrey' },
    K: { stadium: 'Estadio Akron',           city: 'Guadalajara' },
    L: { stadium: 'BC Place',               city: 'Vancouver' },
  }

  return pairs.map(([i, j], idx) => {
    const kickoffAt = new Date(baseDate)
    kickoffAt.setDate(kickoffAt.getDate() + idx * 3)
    kickoffAt.setHours(21, 0, 0, 0)
    return {
      externalId: `WC2026-GRP-${groupLetter}${idx + 1}`,
      homeCode:   teamCodes[i],
      awayCode:   teamCodes[j],
      kickoffAt,
      stage:      Stage.GROUP,
      group:      groupLetter,
      ...stadiums[groupLetter],
    }
  })
}

async function main() {
  console.log('🌱 Seeding database…')

  // Upsert teams
  for (const t of teams) {
    await prisma.team.upsert({
      where:  { code: t.code },
      update: {},
      create: {
        name:        t.name,
        nameEn:      t.nameEn,
        code:        t.code,
        flagUrl:     `https://flagcdn.com/w80/${t.code.toLowerCase().slice(0,2)}.png`,
        group:       t.group,
        fifaRanking: t.fifaRanking,
      },
    })
  }
  console.log(`✓ ${teams.length} équipes créées`)

  // Group matches
  const groups: Record<string, string[]> = {
    A: ['USA', 'MEX', 'CAN', 'PAN'],
    B: ['ARG', 'CHI', 'PER', 'AUS'],
    C: ['BRA', 'COL', 'PAR', 'AHO'],
    D: ['URU', 'ECU', 'BOL', 'JAM'],
    E: ['FRA', 'MAR', 'ALG', 'TUN'],
    F: ['ESP', 'POR', 'SEN', 'TGO'],
    G: ['GER', 'NED', 'AUT', 'TUR'],
    H: ['ENG', 'IRI', 'WAL', 'IRQ'],
    I: ['JPN', 'KOR', 'SAU', 'CHN'],
    J: ['BEL', 'ITA', 'SUI', 'UKR'],
    K: ['CRO', 'DAN', 'SCO', 'CIV'],
    L: ['NGA', 'GHA', 'PT2', 'MX2'],
  }

  const groupStartDates: Record<string, Date> = {
    A: new Date('2026-06-11'), B: new Date('2026-06-12'),
    C: new Date('2026-06-13'), D: new Date('2026-06-14'),
    E: new Date('2026-06-15'), F: new Date('2026-06-16'),
    G: new Date('2026-06-17'), H: new Date('2026-06-18'),
    I: new Date('2026-06-19'), J: new Date('2026-06-20'),
    K: new Date('2026-06-21'), L: new Date('2026-06-22'),
  }

  let matchCount = 0
  for (const [g, codes] of Object.entries(groups)) {
    const matches = groupMatches(g, codes, groupStartDates[g])
    for (const m of matches) {
      const homeTeam = await prisma.team.findUniqueOrThrow({ where: { code: m.homeCode } })
      const awayTeam = await prisma.team.findUniqueOrThrow({ where: { code: m.awayCode } })
      await prisma.match.upsert({
        where:  { externalId: m.externalId },
        update: {},
        create: {
          externalId: m.externalId,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          kickoffAt:  m.kickoffAt,
          cutoffAt:   cutoff(m.kickoffAt),
          stage:      m.stage,
          group:      m.group,
          stadium:    m.stadium,
          city:       m.city,
          status:     MatchStatus.SCHEDULED,
        },
      })
      matchCount++
    }
  }

  console.log(`✓ ${matchCount} matchs de groupe créés`)

  // Scoring rule (1 seule ligne)
  await prisma.scoringRule.upsert({
    where:  { id: 1 },
    update: {},
    create: { id: 1, exactScore: 3, correctResult: 1, wrongPrediction: 0 },
  })
  console.log('✓ ScoringRule initialisée (3/1/0)')

  console.log('✅ Seed terminé')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
