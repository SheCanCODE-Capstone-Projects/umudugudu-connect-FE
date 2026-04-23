# Umudugudu Connect — Frontend (Next.js)

## Structure
```
src/
├── app/            App Router pages (one folder per route)
├── components/     ui/ layout/ forms/ charts/ shared/
├── hooks/          useAppSelector, useAppDispatch
├── lib/api/        Axios client + typed API functions
├── lib/utils/      formatRwf, formatDate, formatPhone
├── store/slices/   authSlice, uiSlice
└── types/          All TypeScript interfaces
```

## Commands
```bash
npm install && npm run dev          # start dev server :3000
npm run build                       # production build
npm run lint && npm run type-check  # lint + TypeScript
```

## State management
- **Redux Toolkit** — auth state (user, isAuth)
- **React Query**   — server state (activities, penalties, etc.)
- **useState**      — local UI state (modals, forms)
