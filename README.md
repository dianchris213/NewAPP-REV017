# Catatan Keuangan — Mini App

A mobile-first personal finance mini app built with TanStack Start, React 19, TypeScript, and Tailwind CSS. All data stays on the device (`localStorage`), so the app runs with no backend.

## Features

### Transactions — strict input sequence
`src/components/AddTransactionSheet.tsx` enforces a progressive, bank-grade input order. Each step stays disabled until the previous one is valid:

1. **Amount** — numeric only, > 0 and ≤ 1,000,000,000,000, formatted as `id-ID`
2. **Wallet account** — pick the account family (Tunai / Bank Utama / E-Wallet), then the registered account; expenses are blocked when the balance is insufficient
3. **Category** — chosen from the user's own categories (account-specific categories are marked with `•`)
4. **Date** — validated calendar date, defaults to today
5. **Note** — optional, max 80 characters

Saving is optimistic (pending state), the sheet is a focus-trapped `role="dialog"`, and `Esc` closes it.

- **All Transactions sheet** (`src/components/AllTransactionsSheet.tsx`): filter by month, week, type, category, keyword; reset filters; "current month" shortcut from the bottom navigation.
- **Transaction list** (`src/components/TransactionList.tsx`): inline edit and delete.

### Categories start empty
The app ships with **zero** categories. Users create them in **Settings → Kategori Transaksi**, per type (income/expense) and optionally scoped to a single wallet account. Duplicate names within the same type + account scope are rejected; names must be 2–24 characters.

### Wallet (`/wallet`)
- Combined balance across all accounts plus per-family grouping.
- **Card-based Add Wallet flow — no native `<select>`**: first choose one of three type cards (Tunai, Bank Utama, E-Wallet); selecting a type instantly reveals a responsive grid of provider cards (BCA, Mandiri, BNI, BRI, CIMB Niaga, Permata for banks; GoPay, OVO, DANA, ShopeePay, LinkAja for e-wallets; physical cash sources for Tunai). The provider selection auto-suggests the account name, and the sheet validates name length (2–30) and starting balance.
- **Per-account history sheet**: tapping a wallet card opens a drawer showing only the transactions that moved that account's balance, sorted newest first, with signed amounts and the account's current balance in the header.
- **Top Up** and **Transfer** sheets with balance checks and toast confirmation.
- **Wallet activity feed** filterable by Top Up / Transfer / All.

### App Lock
- Toggled in **Settings → App Lock**. Enabling it arms the lock immediately and it is restored on every app start.
- The **Wallet route is actively protected**: while App Lock is on and the session is locked, `/wallet` renders an unlock challenge screen and no financial data (balances, accounts, activity) is rendered at all until the user unlocks.

### Settings (`/settings`)
- Language toggle (ID / EN) — the whole settings screen is translated via `src/lib/i18n.ts`
- App Lock, push notifications, dark/light theme, cloud sync
- Category management (create/delete, per type and account)
- Local avatar upload (read as a data URL, never uploaded)
- Sign out and destructive account actions

### Other
- Analytics overview (`/analytics`)
- Telegram / Google style mock login (`/login`, `/signup`)
- Accessibility: `role="dialog"` + `aria-modal`, focus traps, `Esc` to close, `role="radiogroup"`/`aria-checked` on all card selectors, `role="alert"` inline errors, and body-level portals so sheets sit above the bottom navigation

## State

`src/lib/app-store.tsx` is a single React context store: user, transactions, wallets, wallet activity, categories, settings, language, lock state, and transaction filters. Persisted to `localStorage` (`tmab-state-v1`) with debounced writes.

## Development

```sh
npm i
npm run dev
```

## Built with

- TanStack Start (TanStack Router)
- TypeScript
- React 19
- Tailwind CSS
- sonner (toasts)
