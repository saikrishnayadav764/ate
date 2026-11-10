# Agent Workflow & Operating Instructions

## Quick Reference Commands
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Run unit tests**: `npm test`
- **Run Playwright e2e tests**: `npx playwright test`
- **Type-check**: `npx tsc --noEmit`
- **Build production bundle**: `npm run build`

## Project Structure Conventions
```
src/
├── components/          # Reusable UI components
│   ├── CreateLinkModal.tsx
│   ├── PaymentLinksTable.tsx
│   ├── MetricsBar.tsx
│   ├── FilterBar.tsx
│   ├── StatusBadge.tsx
│   └── SimulatePaymentModal.tsx
├── hooks/               # Custom hooks for state and storage
│   ├── usePaymentLinks.ts
│   └── useClipboard.ts
├── types/               # Strict TypeScript definitions
│   └── paymentLink.ts
├── utils/               # Formatting and validation helpers
│   ├── formatters.ts    # Currency (INR) and date formatting
│   ├── validators.ts    # Email, phone, amount validation
│   └── mockData.ts      # Initial seed dataset
├── App.tsx              # Main dashboard view
└── main.tsx             # React entry point
```

## Quality Checklist Before Declaring Any Task Done
1. **Zero TypeScript Errors**: `npx tsc --noEmit` must pass with zero errors.
2. **Deterministic Tests**: All unit and integration tests must pass cleanly.
3. **No Console Errors/Warnings**: Clean browser console, no missing keys in lists, no unhandled exceptions.
4. **Clean Commits**: Commit cleanly after completing each section milestone with semantic commit messages.

## Section 4 Requirement Adaptation Rules
1. **Defensive Input Restriction**: Never rely on submission-time validation alone. Strip invalid characters in real-time (`customerPhone` restricted to max 10 digits; `amount` blocks `e`, `+`, `-` with max ₹1 Cr and 2 decimal precision).
2. **Immediate Inline Validation**: Validate on `onBlur` and dynamic correction on `onChange` to give users instant feedback before form submission.
3. **Communicative State Handling**: When zero items are returned, never leave the user stranded. Always identify the filter/search criteria and provide a one-click recovery action (`Clear Filters`).

