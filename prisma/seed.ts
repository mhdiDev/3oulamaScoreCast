import { PrismaClient, Stage, MatchStatus } from '@prisma/client'
import { addMinutes } from 'date-fns'

const prisma = new PrismaClient()

// Mapping FIFA code → ISO 3166-1 alpha-2 pour flagcdn.com
const flagCode: Record<string, string> = {
  MEX: 'mx', ZAF: 'za', ECU: 'ec', POL: 'pl',
  USA: 'us', PAN: 'pa', BOL: 'bo', UKR: 'ua',
  CAN: 'ca', PER: 'pe', CRO: 'hr', HON: 'hn',
  ARG: 'ar', CHI: 'cl', JAM: 'jm', SEN: 'sn',
  FRA: 'fr', TUN: 'tn', URU: 'uy', AUS: 'au',
  ESP: 'es', POR: 'pt', EGY: 'eg', NZL: 'nz',
  BRA: 'br', MAR: 'ma', AUT: 'at', CMR: 'cm',
  ENG: 'gb-eng', TUR: 'tr', SUI: 'ch', ALG: 'dz',
  GER: 'de', NED: 'nl', JPN: 'jp', CIV: 'ci',
  BEL: 'be', ITA: 'it', DAN: 'dk', KOR: 'kr',
  PAR: 'py', NGA: 'ng', GHA: 'gh', IRI: 'ir',
  SAU: 'sa', CHN: 'cn', SCO: 'gb-sct', IRQ: 'iq',
}

// ── 48 équipes CM 2026 (tirage au sort du 5 déc. 2024) ──────────────
// Nations hôtes dans des groupes séparés : Mexique (A), USA (B), Canada (C)
const teams = [
  // Groupe A — Mexique (hôte) · 1er match = MEX vs ZAF le 11 juin
  { code: 'MEX', name: 'Mexique',          nameEn: 'Mexico',         group: 'A', fifaRanking: 16 },
  { code: 'ZAF', name: 'Afrique du Sud',   nameEn: 'South Africa',   group: 'A', fifaRanking: 61 },
  { code: 'ECU', name: 'Équateur',         nameEn: 'Ecuador',        group: 'A', fifaRanking: 45 },
  { code: 'POL', name: 'Pologne',          nameEn: 'Poland',         group: 'A', fifaRanking: 28 },
  // Groupe B — États-Unis (hôte)
  { code: 'USA', name: 'États-Unis',       nameEn: 'United States',  group: 'B', fifaRanking: 13 },
  { code: 'PAN', name: 'Panama',           nameEn: 'Panama',         group: 'B', fifaRanking: 82 },
  { code: 'BOL', name: 'Bolivie',          nameEn: 'Bolivia',        group: 'B', fifaRanking: 85 },
  { code: 'UKR', name: 'Ukraine',          nameEn: 'Ukraine',        group: 'B', fifaRanking: 21 },
  // Groupe C — Canada (hôte)
  { code: 'CAN', name: 'Canada',           nameEn: 'Canada',         group: 'C', fifaRanking: 49 },
  { code: 'PER', name: 'Pérou',            nameEn: 'Peru',           group: 'C', fifaRanking: 64 },
  { code: 'CRO', name: 'Croatie',          nameEn: 'Croatia',        group: 'C', fifaRanking: 10 },
  { code: 'HON', name: 'Honduras',         nameEn: 'Honduras',       group: 'C', fifaRanking: 88 },
  // Groupe D
  { code: 'ARG', name: 'Argentine',        nameEn: 'Argentina',      group: 'D', fifaRanking: 1  },
  { code: 'CHI', name: 'Chili',            nameEn: 'Chile',          group: 'D', fifaRanking: 42 },
  { code: 'JAM', name: 'Jamaïque',         nameEn: 'Jamaica',        group: 'D', fifaRanking: 55 },
  { code: 'SEN', name: 'Sénégal',          nameEn: 'Senegal',        group: 'D', fifaRanking: 18 },
  // Groupe E
  { code: 'FRA', name: 'France',           nameEn: 'France',         group: 'E', fifaRanking: 2  },
  { code: 'TUN', name: 'Tunisie',          nameEn: 'Tunisia',        group: 'E', fifaRanking: 30 },
  { code: 'URU', name: 'Uruguay',          nameEn: 'Uruguay',        group: 'E', fifaRanking: 7  },
  { code: 'AUS', name: 'Australie',        nameEn: 'Australia',      group: 'E', fifaRanking: 23 },
  // Groupe F
  { code: 'ESP', name: 'Espagne',          nameEn: 'Spain',          group: 'F', fifaRanking: 6  },
  { code: 'POR', name: 'Portugal',         nameEn: 'Portugal',       group: 'F', fifaRanking: 6  },
  { code: 'EGY', name: 'Égypte',           nameEn: 'Egypt',          group: 'F', fifaRanking: 33 },
  { code: 'NZL', name: 'Nouvelle-Zélande', nameEn: 'New Zealand',    group: 'F', fifaRanking: 99 },
  // Groupe G — Brésil + Maroc
  { code: 'BRA', name: 'Brésil',           nameEn: 'Brazil',         group: 'G', fifaRanking: 5  },
  { code: 'MAR', name: 'Maroc',            nameEn: 'Morocco',        group: 'G', fifaRanking: 14 },
  { code: 'AUT', name: 'Autriche',         nameEn: 'Austria',        group: 'G', fifaRanking: 25 },
  { code: 'CMR', name: 'Cameroun',         nameEn: 'Cameroon',       group: 'G', fifaRanking: 43 },
  // Groupe H
  { code: 'ENG', name: 'Angleterre',       nameEn: 'England',        group: 'H', fifaRanking: 4  },
  { code: 'TUR', name: 'Turquie',          nameEn: 'Turkey',         group: 'H', fifaRanking: 40 },
  { code: 'SUI', name: 'Suisse',           nameEn: 'Switzerland',    group: 'H', fifaRanking: 19 },
  { code: 'ALG', name: 'Algérie',          nameEn: 'Algeria',        group: 'H', fifaRanking: 36 },
  // Groupe I
  { code: 'GER', name: 'Allemagne',        nameEn: 'Germany',        group: 'I', fifaRanking: 16 },
  { code: 'NED', name: 'Pays-Bas',         nameEn: 'Netherlands',    group: 'I', fifaRanking: 8  },
  { code: 'JPN', name: 'Japon',            nameEn: 'Japan',          group: 'I', fifaRanking: 17 },
  { code: 'CIV', name: "Côte d'Ivoire",    nameEn: 'Ivory Coast',    group: 'I', fifaRanking: 50 },
  // Groupe J
  { code: 'BEL', name: 'Belgique',         nameEn: 'Belgium',        group: 'J', fifaRanking: 3  },
  { code: 'ITA', name: 'Italie',           nameEn: 'Italy',          group: 'J', fifaRanking: 9  },
  { code: 'DAN', name: 'Danemark',         nameEn: 'Denmark',        group: 'J', fifaRanking: 13 },
  { code: 'KOR', name: 'Corée du Sud',     nameEn: 'South Korea',    group: 'J', fifaRanking: 23 },
  // Groupe K
  { code: 'PAR', name: 'Paraguay',         nameEn: 'Paraguay',       group: 'K', fifaRanking: 66 },
  { code: 'NGA', name: 'Nigeria',          nameEn: 'Nigeria',        group: 'K', fifaRanking: 30 },
  { code: 'GHA', name: 'Ghana',            nameEn: 'Ghana',          group: 'K', fifaRanking: 60 },
  { code: 'IRI', name: 'Iran',             nameEn: 'Iran',           group: 'K', fifaRanking: 22 },
  // Groupe L
  { code: 'SAU', name: 'Arabie Saoudite',  nameEn: 'Saudi Arabia',   group: 'L', fifaRanking: 56 },
  { code: 'CHN', name: 'Chine',            nameEn: 'China',          group: 'L', fifaRanking: 88 },
  { code: 'SCO', name: 'Écosse',           nameEn: 'Scotland',       group: 'L', fifaRanking: 39 },
  { code: 'IRQ', name: 'Irak',             nameEn: 'Iraq',           group: 'L', fifaRanking: 63 },
]

// Helper : kickoffAt → cutoffAt = kickoffAt - 5min
function cutoff(d: Date): Date {
  return addMinutes(d, -5)
}

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
  // Round-robin : 6 matchs pour 4 équipes
  const pairs = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ] as [number, number][]

  const stadiums: Record<string, { stadium: string; city: string }> = {
    A: { stadium: 'Estadio Azteca',           city: 'Mexico City' },
    B: { stadium: 'MetLife Stadium',          city: 'New York/NJ' },
    C: { stadium: 'BC Place',                city: 'Vancouver' },
    D: { stadium: 'SoFi Stadium',            city: 'Los Angeles' },
    E: { stadium: 'AT&T Stadium',            city: 'Dallas' },
    F: { stadium: 'Hard Rock Stadium',       city: 'Miami' },
    G: { stadium: 'NRG Stadium',             city: 'Houston' },
    H: { stadium: 'Lincoln Financial Field', city: 'Philadelphie' },
    I: { stadium: 'Allianz Field',           city: 'Minneapolis' },
    J: { stadium: 'Arrowhead Stadium',       city: 'Kansas City' },
    K: { stadium: 'Estadio BBVA',            city: 'Monterrey' },
    L: { stadium: 'Estadio Akron',           city: 'Guadalajara' },
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

  // Upsert teams avec les bons codes ISO pour les drapeaux
  for (const t of teams) {
    const iso = flagCode[t.code] ?? t.code.toLowerCase().slice(0, 2)
    await prisma.team.upsert({
      where:  { code: t.code },
      update: {
        name:        t.name,
        nameEn:      t.nameEn,
        flagUrl:     `https://flagcdn.com/w80/${iso}.png`,
        group:       t.group,
        fifaRanking: t.fifaRanking,
      },
      create: {
        name:        t.name,
        nameEn:      t.nameEn,
        code:        t.code,
        flagUrl:     `https://flagcdn.com/w80/${iso}.png`,
        group:       t.group,
        fifaRanking: t.fifaRanking,
      },
    })
  }
  console.log(`✓ ${teams.length} équipes créées/mises à jour`)

  // Group matches — tirage CM 2026
  const groups: Record<string, string[]> = {
    A: ['MEX', 'ZAF', 'ECU', 'POL'],  // MEX hôte — 1er match : MEX vs ZAF
    B: ['USA', 'PAN', 'BOL', 'UKR'],  // USA hôte
    C: ['CAN', 'PER', 'CRO', 'HON'],  // CAN hôte
    D: ['ARG', 'CHI', 'JAM', 'SEN'],
    E: ['FRA', 'TUN', 'URU', 'AUS'],
    F: ['ESP', 'POR', 'EGY', 'NZL'],
    G: ['BRA', 'MAR', 'AUT', 'CMR'],  // BRA vs MAR = 1er match groupe G
    H: ['ENG', 'TUR', 'SUI', 'ALG'],
    I: ['GER', 'NED', 'JPN', 'CIV'],
    J: ['BEL', 'ITA', 'DAN', 'KOR'],
    K: ['PAR', 'NGA', 'GHA', 'IRI'],
    L: ['SAU', 'CHN', 'SCO', 'IRQ'],
  }

  const groupStartDates: Record<string, Date> = {
    A: new Date('2026-06-11'), B: new Date('2026-06-11'),
    C: new Date('2026-06-12'), D: new Date('2026-06-13'),
    E: new Date('2026-06-14'), F: new Date('2026-06-15'),
    G: new Date('2026-06-16'), H: new Date('2026-06-17'),
    I: new Date('2026-06-18'), J: new Date('2026-06-19'),
    K: new Date('2026-06-20'), L: new Date('2026-06-21'),
  }

  // Supprimer les anciens matchs de groupe pour reseed propre
  await prisma.prediction.deleteMany()
  await prisma.match.deleteMany()

  let matchCount = 0
  for (const [g, codes] of Object.entries(groups)) {
    const matches = groupMatches(g, codes, groupStartDates[g])
    for (const m of matches) {
      const homeTeam = await prisma.team.findUniqueOrThrow({ where: { code: m.homeCode } })
      const awayTeam = await prisma.team.findUniqueOrThrow({ where: { code: m.awayCode } })
      await prisma.match.create({
        data: {
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

  // Scoring rule
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
