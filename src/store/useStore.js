import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_DATA } from '../data/mockData'

const useStore = create(
  persist(
    (set, get) => ({
      ...MOCK_DATA,

      // ── Config ────────────────────────────────────────────────────────────
      updateConfig: (updates) =>
        set(state => ({ config: { ...state.config, ...updates } })),

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
        set(state => ({
          expenses: [
            ...state.expenses,
            { ...expense, id: `exp-${Date.now()}` },
          ],
        })),

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
            { ...goal, id: `goal-${Date.now()}`, contributions: [] },
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

      addContribution: (goalId, amount, date) =>
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? {
                  ...g,
                  contributions: [
                    ...g.contributions,
                    { id: `cont-${Date.now()}`, amount, date },
                  ],
                }
              : g
          ),
        })),

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
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) {
          // Asignar currency: 'ARS' a depósitos y gastos que no lo tengan
          const fix = (arr) => arr.map(x => x.currency ? x : { ...x, currency: 'ARS' })
          return {
            ...persisted,
            deposits: fix(persisted.deposits ?? []),
            expenses: fix(persisted.expenses ?? []),
          }
        }
        return persisted
      },
    }
  )
)

export default useStore
