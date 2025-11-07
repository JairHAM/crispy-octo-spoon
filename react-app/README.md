# 🍽️ POS Restaurant - React + Vite

Versión React del sistema POS para restaurante.

## 🚀 Setup

```bash
npm install
npm run dev
```

## 📦 Build

```bash
npm run build
```

## 📂 Estructura

```
src/
├── modules/        # Módulos reutilizables
│   ├── api.js      # Llamadas a API
│   └── audio.js    # Web Audio API
├── store/          # Zustand store
│   └── store.js    # Estado global
├── pages/          # Páginas principales
│   ├── AdminPage.jsx
│   ├── CocinaPage.jsx
│   └── MeseroPage.jsx
├── App.jsx         # Router principal
├── main.jsx        # Punto de entrada
└── index.css       # Estilos
```

## 🌐 URLs

- Admin: `/admin`
- Cocina: `/cocina`
- Mesero: `/` (default)

## 🔧 Tecnologías

- React 18
- Vite 5
- React Router 6
- Zustand
- Vanilla CSS
