import { prisma } from '@/lib/prisma'

export default async function RulesPage() {
  const rule = await prisma.scoringRule.findUnique({ where: { id: 1 } })

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Règles du jeu</h1>

      {/* Scoring */}
      <section className="bg-[#0a2540] border border-[#334155] rounded-2xl p-5 mb-5">
        <h2 className="font-bold mb-4 text-[#fbbf24]">⚽ Système de points</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#451a03] border border-[#d97706] flex items-center justify-center font-bold text-[#fde68a] text-lg">
              {rule?.exactScore ?? 3}
            </span>
            <div>
              <div className="font-semibold text-sm">Score exact</div>
              <div className="text-xs text-[#64748b]">Vous avez trouvé le score exact</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#14532d] border border-[#16a34a] flex items-center justify-center font-bold text-[#4ade80] text-lg">
              {rule?.closeResult ?? 2}
            </span>
            <div>
              <div className="font-semibold text-sm">Bon résultat + proche</div>
              <div className="text-xs text-[#64748b]">Bon vainqueur, avec le score exact d'une équipe ou le bon écart de buts</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#1e3a5f] border border-[#3b82f6] flex items-center justify-center font-bold text-[#93c5fd] text-lg">
              {rule?.correctResult ?? 1}
            </span>
            <div>
              <div className="font-semibold text-sm">Bon résultat</div>
              <div className="text-xs text-[#64748b]">Vous avez trouvé le bon vainqueur ou le nul</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center font-bold text-[#64748b] text-lg">
              {rule?.wrongPrediction ?? 0}
            </span>
            <div>
              <div className="font-semibold text-sm">Faux</div>
              <div className="text-xs text-[#64748b]">Mauvais résultat</div>
            </div>
          </div>
        </div>
      </section>

      {/* Predictions rules */}
      <section className="bg-[#0a2540] border border-[#334155] rounded-2xl p-5 mb-5">
        <h2 className="font-bold mb-4 text-[#3b82f6]">📋 Règles des pronostics</h2>
        <ul className="space-y-2 text-sm text-[#94a3b8]">
          <li className="flex gap-2"><span>⏱</span><span>Les pronostics se ferment <strong className="text-white">5 minutes avant le coup d'envoi</strong></span></li>
          <li className="flex gap-2"><span>✏️</span><span>Vous pouvez modifier votre pronostic autant de fois que vous voulez avant la coupure</span></li>
          <li className="flex gap-2"><span>👁</span><span>Les pronostics des autres membres de votre groupe ne sont visibles qu'<strong className="text-white">après la coupure</strong></span></li>
          <li className="flex gap-2"><span>🔒</span><span>Une fois le match commencé, votre pronostic est définitivement verrouillé</span></li>
        </ul>
      </section>

      {/* Calendar overview */}
      <section className="bg-[#0a2540] border border-[#334155] rounded-2xl p-5">
        <h2 className="font-bold mb-4 text-[#22c55e]">🏆 Format de la compétition</h2>
        <ul className="space-y-2 text-sm text-[#94a3b8]">
          <li className="flex gap-2"><span>🌎</span><span><strong className="text-white">48 équipes</strong> de 12 groupes (A à L)</span></li>
          <li className="flex gap-2"><span>📅</span><span><strong className="text-white">104 matchs</strong> du 11 juin au 19 juillet 2026</span></li>
          <li className="flex gap-2"><span>🇺🇸</span><span>Organisé aux <strong className="text-white">États-Unis, Canada et Mexique</strong></span></li>
          <li className="flex gap-2"><span>⚽</span><span>Phase de groupes → Tour préliminaire → 8e → Quarts → Demis → Finale</span></li>
        </ul>
      </section>
    </div>
  )
}
