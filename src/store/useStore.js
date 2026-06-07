import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_DATA } from '../data/mockData'
import { fetchBnaRate } from '../utils/bnaRate'

const useStore = create(
  persist(
    (set, get) => ({
      ...MOCK_DATA,

      // ── Config ────────────────────────────────────────────────────────────
      updateConfig: (updates) =>
        set(state => ({ config: { ...state.config, ...updates } })),

      fetchAndUpdateBnaRate: async (force = false) => {
        const { config } = get()
        const today = new Date().toISOString().split('T')[0]
        if (!force && config.bnaRateDate === today) return
        const rate = await fetchBnaRate()
        if (rate !== null) {
          set(state => ({
            config: { ...state.config, bnaRate: Math.round(rate), bnaRateDate: today },
          }))
        }
      },

      // ── Depósitos (entradas de dinero) ────────────────────────────────────
      addDeposit: (deposit) =>
        set(state => ({
          deposits: [
            ...state.deposits,
            { ...deposit, id: `dep-${Date.now()}` },
          ],
        })),

      updateDeposit: (id, updates) =>
        set(state => ({
          deposits: state.deposits.map(d =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      deleteDeposit: (id) =>
        set(state => ({
          deposits: state.deposits.filter(d => d.id !== id),
        })),

      // ── Gastos ────────────────────────────────────────────────────────────
      addExpense: (expense) =>
        set(state => {
          const { installments, ...base } = expense

          if (!installments) {
            return { expenses: [...state.expenses, { ...base, id: `exp-${Date.now()}` }] }
          }

          // Tarjeta de crédito: primer débito = 1ro del mes siguiente a la compra
          const N = installments
          const perAmount = N === 1 ? base.amount : Math.round(base.amount / N)
          const groupId = N > 1 ? `ig-${Date.now()}` : null
          const [y, mo] = base.date.split('-').map(Number)
          let firstMonth = mo + 1
          let firstYear = y
          if (firstMonth > 12) { firstMonth = 1; firstYear++ }

          const now = Date.now()
          const newExpenses = Array.from({ length: N }, (_, i) => {
            let month = firstMonth + i
            let year = firstYear
            while (month > 12) { month -= 12; year++ }
            const e = {
              ...base,
              id: groupId ? `exp-${now}-${i}` : `exp-${now}`,
              amount: perAmount,
              date: `${year}-${String(month).padStart(2, '0')}-01`,
              isCreditCard: true,
            }
            if (groupId) {
              e.installmentGroupId = groupId
              e.installmentNumber = i + 1
              e.installmentTotal = N
            }
            return e
          })

          return { expenses: [...state.expenses, ...newExpenses] }
        }),

      updateExpense: (id, updates) =>
        set(state => ({
          expenses: state.expenses.map(e =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteExpense: (id) =>
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id),
        })),

      deleteExpenseGroup: (groupId) =>
        set(state => ({
          expenses: state.expenses.filter(e => e.installmentGroupId !== groupId),
        })),

      // ── Presupuestos ──────────────────────────────────────────────────────
      setBudget: (category, monthlyLimit, currency = 'ARS') =>
        set(state => {
          const idx = state.budgets.findIndex(b => b.category === category)
          if (idx >= 0) {
            const budgets = [...state.budgets]
            budgets[idx] = { ...budgets[idx], monthlyLimit, currency }
            return { budgets }
          }
          return {
            budgets: [
              ...state.budgets,
              { id: `bud-${Date.now()}`, category, monthlyLimit, currency },
            ],
          }
        }),

      deleteBudget: (category) =>
        set(state => ({
          budgets: state.budgets.filter(b => b.category !== category),
        })),

      // ── Objetivos ─────────────────────────────────────────────────────────
      addGoal: (goal) =>
        set(state => ({
          goals: [
            ...state.goals,
            {
              priority: 'media',
              status: 'activo',
              ...goal,
              id: `goal-${Date.now()}`,
              contributions: [],
            },
          ],
        })),

      updateGoal: (id, updates) =>
        set(state => ({
          goals: state.goals.map(g =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      deleteGoal: (id) =>
        set(state => ({
          goals: state.goals.filter(g => g.id !== id),
        })),

      // contribution: { amount, currency, date, type: 'mensual'|'extraordinario', note? }
      addContribution: (goalId, contribution) =>
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? {
                  ...g,
                  contributions: [
                    ...g.contributions,
                    { id: `cont-${Date.now()}`, note: '', ...contribution },
                  ],
                }
              : g
          ),
        })),

      // entries: [{ goalId, amount, currency, note }] — todos registrados como extraordinario
      addExtraContributions: (entries, date) =>
        set(state => {
          const now = Date.now()
          return {
            goals: state.goals.map(g => {
              const entry = entries.find(e => e.goalId === g.id)
              if (!entry || !(Number(entry.amount) > 0)) return g
              return {
                ...g,
                contributions: [
                  ...g.contributions,
                  {
                    id: `cont-${now}-${g.id}`,
                    amount: Number(entry.amount),
                    currency: entry.currency,
                    date,
                    type: 'extraordinario',
                    note: entry.note || '',
                  },
                ],
              }
            }),
          }
        }),

      // ── Wishlist ──────────────────────────────────────────────────────────
      addWishlistItem: (item) =>
        set(state => ({
          wishlist: [
            ...state.wishlist,
            { ...item, id: `wish-${Date.now()}`, purchased: false, purchasedDate: null },
          ],
        })),

      updateWishlistItem: (id, updates) =>
        set(state => ({
          wishlist: state.wishlist.map(w =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      deleteWishlistItem: (id) =>
        set(state => ({
          wishlist: state.wishlist.filter(w => w.id !== id),
        })),

      markWishlistPurchased: (id) =>
        set(state => ({
          wishlist: state.wishlist.map(w =>
            w.id === id
              ? { ...w, purchased: true, purchasedDate: new Date().toISOString().split('T')[0] }
              : w
          ),
        })),

      // ── Exportar ──────────────────────────────────────────────────────────
      exportData: () => {
        const { config, deposits, expenses, budgets, goals, wishlist } = get()
        return JSON.stringify({ config, deposits, expenses, budgets, goals, wishlist }, null, 2)
      },
    }),
    {
      name: 'gestor-gastos-store',
      version: 3,
      migrate: (persisted, version) => {
        if (version < 2) {
          const fix = (arr) => arr.map(x => x.currency ? x : { ...x, currency: 'ARS' })
          persisted = {
            ...persisted,
            deposits: fix(persisted.deposits ?? []),
            expenses: fix(persisted.expenses ?? []),
          }
        }
        if (version < 3) {
          persisted = {
            ...persisted,
            config: {
              ...persisted.config,
              monthlyIncomeUSD: persisted.config?.monthlyIncomeUSD ?? 0,
              arsPercent: persisted.config?.arsPercent ?? 80,
              bnaRate: persisted.config?.bnaRate ?? persisted.config?.exchangeRate ?? 1200,
              bnaRateDate: persisted.config?.bnaRateDate ?? null,
            },
          }
        }
        return persisted
      },
    }
  )
)

export default useStore
