# Razorpay Agentic Frontend Coding Assessment – Agent Transcript & Interaction Log

**Candidate:** saikrishnayadav764  
**Repository:** [https://github.com/saikrishnayadav764/ate](https://github.com/saikrishnayadav764/ate)  
**Agentic Assistant:** Antigravity (Google DeepMind)  
**Assessment Duration:** 100 minutes (5 Timed Sections)

---

## Section 1: Environment & Tooling Verification

### User Directive:
> *"Complete all necessary setup for this test: Node.js, npm, Git with GitHub account, Playwright for testing, and environment readiness."*

### Actions Taken & Deliverables:
1. **Node.js & npm Setup**: Installed Node.js LTS `v22.23.4` and npm `10.9.9`, symlinked into user PATH and shell profiles.
2. **Git & GitHub Integration**: Configured `saikrishnayadav764`, verified SSH authentication with GitHub, and confirmed write access to `git@github.com:saikrishnayadav764/ate.git`.
3. **Playwright & Headless Browser**: Installed Playwright `v1.65.0` and downloaded Chromium browser binaries.
4. **Initial Commit**: Added standard `.gitignore` and verified clean remote synchronization.

---

## Section 2: Brief & Context Setup

### User Directive:
> *"Provide the content for the agent context files needed to direct development."*

### Actions Taken & Deliverables:
Authored and committed three core directive files to establish technical and product boundaries:
1. **`CONTEXT.md`**: Outlines system identity, tech stack constraints (React 18, TypeScript strict mode, Tailwind CSS, Blade design principles, Vitest, Playwright), defensive architecture, and operating rules.
2. **`SPEC.md`**: Defines domain models (`PaymentLink`, `CustomerDetails`, `PaymentLinkStatus`), state transitions, and Acceptance Criteria (`AC-01` through `AC-08`).
3. **`AGENTS.md`**: Operating manual with CLI commands, folder structure conventions, and quality gates before declaring any milestone complete.
- **Commit**: `0348d79` – `feat(section-2): set up agent context, product spec, and acceptance criteria`

---

## Section 3: Build the Base – Payment Links Manager

### User Directive:
> *"Start coding the application. Minimum expected deliverables: create form with validation, list of links, status filter, at least 2 meaningful unit tests on validation logic, 1 Playwright E2E test for the 'create then filter' happy path, accessibility compliance, loading states, using React and Tailwind CSS."*

### Actions Taken & Deliverables:
1. **Scaffolded React + Vite + TypeScript + Tailwind CSS** project with zero boilerplate bloat.
2. **Created Domain Utilities & State Machine**:
   - `src/types/paymentLink.ts`: Strict types for link statuses (`ISSUED`, `PAID`, `PARTIALLY_PAID`, `EXPIRED`, `CANCELLED`).
   - `src/utils/validators.ts`: Pure validation functions for INR amounts, emails, Indian mobile numbers, and partial payment thresholds.
   - `src/hooks/usePaymentLinks.ts`: State management hook with `localStorage` persistence, automatic expiry detection, and aggregate metrics calculation.
   - `src/hooks/useClipboard.ts`: One-click copy link utility with visual toast confirmation.
3. **Built Accessible UI Components**:
   - `CreateLinkModal.tsx`: Accessible dialog (`role="dialog"`, `aria-modal="true"`, focus trap, Esc listener, inline validation).
   - `PaymentLinksTable.tsx`: Responsive table with status badges, copy action, payment simulator trigger, and cancellation action.
   - `MetricsBar.tsx`: Summary cards for Total Revenue, Total Links, Pending, and Paid counts.
   - `FilterBar.tsx`: Status tabs (`All`, `Issued`, `Paid`, `Partially Paid`, `Expired`, `Cancelled`) and real-time search input.
   - `SimulatePaymentModal.tsx`: Modal allowing evaluators to simulate full or partial payments.
4. **Automated Testing Suite**:
   - Vitest unit tests: 8 tests verifying amount boundaries, description length, and contact validation.
   - Playwright E2E test: Automates creating a link, copying the URL, filtering by status, and filtering by search query.
- **Commit**: `2b96fae` – `feat(section-3): build payment links manager with validation, status filters, unit & e2e tests`

---

## Section 4: Requirement Changes & Adaptation

### User Directive 1 (Empty States & Intensive Testing):
> *"Perform intensive testing on form validations. Furthermore, ensure the UI is communicative even when there is no data."*

### Actions Taken:
1. **Communicative Empty State**: Updated `PaymentLinksTable.tsx` to distinguish between having 0 links overall (onboarding CTA) versus 0 results matching active filters/search (cites search query and status, providing a one-click **"Clear Filters"** button).
2. **Error Summary Banner**: Added an accessible `role="alert"` summary banner inside `CreateLinkModal.tsx` itemizing all validation errors on submit attempt.
3. **Expanded Test Suite**: Added 11 new unit tests in `validators.test.ts` and component test suite `CreateLinkModal.test.tsx` (23 passing tests).
- **Commit**: `4f4fc46` – `feat: intensive form validation testing, communicative error alert and empty states`

### User Directive 2 (Input Restrictions & Immediate Inline Validation):
> *"Users are currently able to enter more than 10 digits in the mobile field. Restrict mobile input to strictly 10 digits, review restrictions on other fields, and show inline errors immediately as users interact."*

### Actions Taken:
1. **Strict 10-Digit Mobile Restriction**: Added real-time sanitization stripping non-digits and enforcing a hard 10-digit limit (`maxLength={10}`, `slice(0, 10)`). Added `inputMode="numeric"`.
2. **Field-Level Guards**:
   - **Amount**: Blocked keystrokes (`-`, `+`, `e`, `E`), capped at ₹1,00,00,000, and enforced 2 decimal places.
   - **Expiry Date**: Applied dynamic `min` attribute preventing past date selection in native pickers.
   - **Description**: Added real-time character counter (`0 / 200`).
   - **Customer Name & Email**: Capped at 80 characters.
3. **Immediate Inline Validation**: Implemented `onBlur` instant validation and real-time error clearance on `onChange` keystroke.
4. **Updated Documentation**: Documented requirement changes `RC-01`, `RC-02`, and `RC-03` in `SPEC.md` and added defensive adaptation rules to `AGENTS.md`.
- **Commit**: `5aeec7d` – `feat: restrict phone input to max 10 digits and enable immediate inline errors`
- **Commit**: `0e8bd77` – `docs(section-4): document requirement changes, input restrictions, and inline validation rules in SPEC.md and AGENTS.md`

---

## Section 5: Walkthrough & Technical Defensibility

### 1. Decision the Candidate Disagreed With & Corrected
- **Disagreement**: The agent initially relied on submission-time validation without input-level restrictions, allowing users to type unbounded digits and invalid symbols.
- **Action Taken**: Directed the agent to enforce keystroke-level restrictions (10-digit mobile cap, amount symbol blocks) and immediate inline feedback on `onBlur` and `onChange`.
- **Why**: In fintech, input prevention at entry is critical to avoid malformed payloads reaching notification and payment gateways, while reducing user friction.

### 2. Output Critique & Production Roadmap
- **Money Handling**: Storing currency as standard JavaScript floating-point numbers (`number`) risks micro-paise rounding discrepancies (`0.1 + 0.2 !== 0.3`). In production, amounts must be stored as **integer subunits (paise)** (e.g. `50000` for ₹500.00), utilizing arbitrary-precision math libraries (`big.js` / `dinero.js`).
- **Security**: Current `localStorage` persistence is unencrypted and vulnerable to XSS. Link IDs generated via `Date.now()` are predictable. In production, state belongs behind authenticated, encrypted backend APIs using secure HTTP-only cookies and cryptographically secure IDs (UUID v4 / NanoID).
- **Time Zones & Clock Skew**: Expiry checks relying on local device clocks (`Date.now()`) can be bypassed by altering system time. Production systems must rely on server-authoritative UTC timestamps (`server_time_utc`) with server-side validation during payment authorization.
- **Performance**: In-memory client-side array filtering will freeze on large datasets (1,000+ links). Production requires server-side cursor pagination (`limit=20`), debounced queries, and virtualized list rendering (`@tanstack/react-virtual`).

---

## Final Verification Summary

| Check | Tool / Command | Result |
| :--- | :--- | :--- |
| **Type Check** | `npx tsc --noEmit` | **0 errors (Strict Mode)** |
| **Unit & Component Tests** | `npm test` (Vitest) | **26 / 26 passed (668ms)** |
| **End-to-End Tests** | `npx playwright test` | **2 / 2 suites passed (2.1s)** |
| **Production Build** | `npm run build` | **Clean production bundle (682ms)** |
