// Datos de ejemplo para validar el diseño del dashboard
// Ingreso total: $800.000 ARS + 500 USD × $1.200 = $1.400.000 ARS
// Necesidades (50%): $700.000 → gastado $580.000 (83%)
// Deseos     (30%): $420.000 → gastado $380.000 (90%) ⚠️
// Ahorro     (20%): $280.000 → aportado este mes $0

export const MOCK_DATA = {
  config: {
    exchangeRate: 1200,
    baseCurrency: 'ARS',
  },
  incomes: [
    { id: 'inc-1', month: '2026-06', amountARS: 800000, amountUSD: 500 },
  ],
  expenses: [
    // Necesidades
    { id: 'exp-1', amount: 350000, currency: 'ARS', category: 'alquiler', description: 'Alquiler junio', date: '2026-06-01' },
    { id: 'exp-2', amount: 45000, currency: 'ARS', category: 'servicios', description: 'Luz, gas, internet', date: '2026-06-05' },
    { id: 'exp-3', amount: 120000, currency: 'ARS', category: 'supermercado', description: 'Compra mensual', date: '2026-06-10' },
    { id: 'exp-4', amount: 35000, currency: 'ARS', category: 'transporte', description: 'SUBE y Uber', date: '2026-06-15' },
    { id: 'exp-5', amount: 30000, currency: 'ARS', category: 'salud', description: 'Prepaga', date: '2026-06-01' },
    // Deseos
    { id: 'exp-6', amount: 85000, currency: 'ARS', category: 'restaurantes', description: 'Salidas y delivery', date: '2026-06-20' },
    { id: 'exp-7', amount: 120000, currency: 'ARS', category: 'entretenimiento', description: 'Cine, Netflix, Spotify', date: '2026-06-18' },
    { id: 'exp-8', amount: 95000, currency: 'ARS', category: 'ropa', description: 'Zapatillas y remeras', date: '2026-06-22' },
    { id: 'exp-9', amount: 60000, currency: 'ARS', category: 'electronica', description: 'Accesorios varios', date: '2026-06-25' },
    { id: 'exp-10', amount: 20000, currency: 'ARS', category: 'otros_deseos', description: 'Varios', date: '2026-06-28' },
  ],
  budgets: [
    { id: 'bud-1', category: 'alquiler', monthlyLimit: 350000, currency: 'ARS' },
    { id: 'bud-2', category: 'servicios', monthlyLimit: 50000, currency: 'ARS' },
    { id: 'bud-3', category: 'supermercado', monthlyLimit: 150000, currency: 'ARS' },
    { id: 'bud-4', category: 'transporte', monthlyLimit: 40000, currency: 'ARS' },
    { id: 'bud-5', category: 'salud', monthlyLimit: 50000, currency: 'ARS' },
    { id: 'bud-6', category: 'restaurantes', monthlyLimit: 80000, currency: 'ARS' },
    { id: 'bud-7', category: 'entretenimiento', monthlyLimit: 100000, currency: 'ARS' },
    { id: 'bud-8', category: 'ropa', monthlyLimit: 80000, currency: 'ARS' },
    { id: 'bud-9', category: 'electronica', monthlyLimit: 70000, currency: 'ARS' },
    { id: 'bud-10', category: 'otros_deseos', monthlyLimit: 30000, currency: 'ARS' },
  ],
  goals: [
    {
      id: 'goal-1',
      name: 'Vacaciones en Chile',
      targetAmount: 200000,
      currency: 'ARS',
      deadline: '2026-12-01',
      contributions: [
        { id: 'cont-1', amount: 50000, date: '2026-04-01' },
        { id: 'cont-2', amount: 35000, date: '2026-05-15' },
      ],
    },
    {
      id: 'goal-2',
      name: 'Notebook nuevo',
      targetAmount: 2400000,
      currency: 'ARS',
      deadline: '2027-03-01',
      contributions: [
        { id: 'cont-3', amount: 300000, date: '2026-03-01' },
        { id: 'cont-4', amount: 300000, date: '2026-04-01' },
      ],
    },
  ],
  wishlist: [
    {
      id: 'wish-1',
      name: 'Auriculares Sony WH-1000XM5',
      estimatedPrice: 180000,
      currency: 'ARS',
      priority: 'alta',
      notes: 'Para home office',
      purchased: false,
      purchasedDate: null,
    },
    {
      id: 'wish-2',
      name: 'El inversor inteligente',
      estimatedPrice: 12000,
      currency: 'ARS',
      priority: 'media',
      notes: 'Benjamin Graham',
      purchased: false,
      purchasedDate: null,
    },
    {
      id: 'wish-3',
      name: 'Mochila Samsonite',
      estimatedPrice: 95000,
      currency: 'ARS',
      priority: 'baja',
      notes: '',
      purchased: false,
      purchasedDate: null,
    },
  ],
}
