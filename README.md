# Gestor de Gastos Personales

App web responsive (mobile-first) para gestionar finanzas personales con la regla 50/30/20.

- 100% estática — todos los datos se guardan en localStorage
- Funciona offline
- Soporte ARS + USD con tipo de cambio configurable

## Stack

| Capa       | Tecnología                      |
|------------|---------------------------------|
| UI         | React 18 + Vite                 |
| Estilos    | Tailwind CSS v3                 |
| Estado     | Zustand (persiste en localStorage) |
| Routing    | React Router v6 (hash routing)  |
| Deploy     | GitHub Pages via GitHub Actions |

## Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/gestor-gastos/` en el navegador.

## Build de producción

```bash
npm run build      # genera /dist
npm run preview    # sirve /dist localmente
```

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` se ejecuta automáticamente en cada push a `main`.

**Activar GitHub Pages por primera vez:**

1. Ir a **Settings → Pages** del repositorio
2. En *Source* seleccionar **GitHub Actions**
3. El próximo push a `main` hará el deploy automático

La URL resultante será: `https://<usuario>.github.io/gestor-gastos/`

## Modelo de datos (localStorage)

```
gestor-gastos-store
├── config         — tipo de cambio, moneda base
├── incomes[]      — ingresos mensuales en ARS y USD
├── expenses[]     — gastos con categoría, monto, moneda, fecha
├── budgets[]      — techo mensual por categoría
├── goals[]        — objetivos de ahorro con aportes
└── wishlist[]     — productos deseados con precio y prioridad
```

## Exportar datos

En **Ajustes → Descargar backup** se genera un JSON con todos los datos.
