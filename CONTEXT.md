# Project Context & Audit Log

> **Project**: OrderBot - Akshaya Homely Foods Admin Dashboard (AI Chatbot)
> **Audit Date**: 2026-06-28
> **Auditor**: AI-assisted code review & fix

---

## 1. Architecture Overview

This is a full-stack food ordering system:
- **Frontend**: React 19 + Vite 8 + TanStack React Query + Framer Motion + Recharts
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: JWT (admin + customer roles)
- **Payments**: Razorpay integration
- **WhatsApp**: Meta Cloud API webhook integration

The project has an unusual double-nested structure:
```
AI-chatbot/           # Workspace root (containing only a dangling package-lock.json)
└── AI-chatbot/       # Actual project root
    ├── backend/      # Express API
    ├── frontend/     # React SPA
    ├── docs/
    ├── package.json  # Workspace scripts
    └── ...
```

---

## 2. Critical Bugs Found & Fixed

### 2.1 Seed Data Status Mismatch

**File**: `backend/prisma/seed.js`

**Issue**: The seed script used order statuses `'In Preparation'` and `'Dispatched'` which did NOT exist in the backend validation list (`routes/orders.js:151`):

```js
// Valid statuses in orders.js:
['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']

// What seed.js used instead:
'In Preparation'  // line 113, 170 — does not match 'Preparing'
'Dispatched'       // line 136, 194 — does not match 'Out for Delivery'
```

This meant:
- Orders created by the seed would show statuses that didn't match the dropdown options in the admin UI
- When an admin tried to update an order already in one of these mismatched statuses, the validation would reject it
- The "Update" button logic in `Orders.jsx` (comparing current vs selected) would be broken

**Fix**: Changed all 4 occurrences to match the valid status list:
- `'In Preparation'` → `'Preparing'`
- `'Dispatched'` → `'Out for Delivery'`

---

### 2.2 WhatsApp Customer Upsert Missing Required Fields

**File**: `backend/routes/whatsapp.js` (line 145-153)

**Issue**: The `prisma.customer.upsert()` `create` block was missing two **required** fields from the Prisma schema:

```prisma
model Customer {
  id              Int      @id @default(autoincrement())
  name            String
  whatsapp_number String   @unique
  email           String   @unique    // ← REQUIRED
  password_hash   String              // ← REQUIRED
  address         String?
  // ...
}
```

The upsert create only provided:
```js
create: {
  whatsapp_number: from,
  name: 'WhatsApp User',
  address: session.address
  // ❌ missing: email (required, @unique)
  // ❌ missing: password_hash (required)
}
```

This would throw a Prisma runtime error (`NOT NULL constraint failed`) whenever a new WhatsApp user placed an order through the webhook flow.

**Fix**: Added `email` (generated placeholder from WhatsApp number) and `password_hash` (guest marker) to the create block.

---

### 2.3 Frontend CSS Typo (boxHeight)

**File**: `frontend/src/pages/CustomerChat.jsx` (line 1063)

**Issue**: A non-existent CSS property `boxHeight: 'auto'` was used instead of `boxShadow`. This is a clear typo — there is no CSS property called `box-height`. The browser would silently ignore it, but it indicated sloppy code.

```jsx
style={{
  background: 'rgba(20, 30, 25, 0.85)',
  borderColor: 'rgba(34, 197, 94, 0.25)',
  boxHeight: 'auto',           // ← TYPO: should be boxShadow
  boxShadow: '0 30px 60px...'  // ← also present
}}
```

**Fix**: Removed the invalid `boxHeight: 'auto'` property.

---

### 2.4 Password Validation Inconsistency

**File**: `frontend/src/pages/Login.jsx`

**Issue**: The client-side validation required passwords to be at least 4 characters, but the backend and signup page required 6 characters. This allowed users to attempt login with passwords that would never match (since the admin password was hashed from a 6+ char string).

```js
// Login.jsx (line 29)
} else if (password.length < 4) {     // ← inconsistent with backend
  setPasswordError('Password must be at least 4 characters');

// CustomerSignup.jsx (line 17)
password: z.string().min(6, ...)      // ← correct minimum
```

**Fix**: Changed to `password.length < 6` with matching error message.

---

### 2.5 Frontend Tracking Route Over-Guarded

**File**: `frontend/src/App.jsx`

**Issue**: The `/track/:id` route was wrapped in `<CustomerProtectedRoute>` which required `customer_token` in localStorage. However, the API endpoint `GET /api/orders/:id` is intentionally public (no auth middleware). The "Track My Order" link in the payment success card opens a new tab (`target="_blank"`), where the user may not have the token.

```jsx
<Route path="/track/:id" element={<CustomerProtectedRoute><OrderTracking /></CustomerProtectedRoute>} />
```

**Fix**: Removed the `CustomerProtectedRoute` wrapper, making the tracking page public (consistent with the public API).

---

### 2.6 Dangling Root package-lock.json

**File**: `D:\Brave\Real-brave\AI-chatbot\package-lock.json`

**Issue**: This file existed outside the actual project directory with an empty structure:
```json
{
  "name": "AI-chatbot",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {}
}
```
This served no purpose and could cause confusion with npm workspaces.

**Fix**: Deleted the file.

---

## 3. Lint Errors Fixed

The frontend had **36 lint errors** (33 errors, 3 warnings). All were fixed. Breakdown:

### 3.1 Unused `import React` (10 files)
React 19's JSX transform no longer requires `import React` at the top of every file. Every single `.jsx` file had it unnecessarily:
- `App.jsx`, `Sidebar.jsx`, `Topbar.jsx`, `Login.jsx`, `Landing.jsx`, `Orders.jsx`, `Summary.jsx`, `MenuManagement.jsx`, `CustomerLogin.jsx`, `CustomerSignup.jsx`, `MyOrders.jsx`, `OrderTracking.jsx`, `CustomerChat.jsx`

**Fix**: Removed all `import React` statements (and `import React from 'react'` → `import { useState, ... } from 'react'`).

### 3.2 Unused Icon/Library Imports (multiple files)
- `Landing.jsx`: Imported `ChefHat`, `MessageSquare`, `AnimatePresence` but never used
- `CustomerChat.jsx`: Imported `Link`, `ShoppingBag`, `MapPin`, `ChevronDown` but never used
- `MyOrders.jsx`: Imported `ShoppingBag`, `ArrowLeft`, `CheckCircle` but never used  
- `OrderTracking.jsx`: Imported `ShoppingBag` but never used
- `MenuManagement.jsx`: Destructured `setValue` from `useForm` but never used

**Fix**: Removed all unused imports and destructured bindings.

### 3.3 Empty Catch Blocks (2 instances)
In `CustomerChat.jsx`, the `loadPersistedState` and `clearPersistedState` functions had `catch {}` with empty bodies. Eslint's `no-empty` rule flags this.

**Fix**: Changed to `catch { /* ignore */ }`.

### 3.4 set-state-in-effect (4 instances)
React 19 + eslint-plugin-react-hooks v7 introduced the `react-hooks/set-state-in-effect` rule which warns about calling setState directly inside useEffect bodies. Violations:
- `CustomerChat.jsx`: Scroll state reset on mode change
- `CustomerChat.jsx`: Auto-greeting initialization  
- `Landing.jsx`: Auth state initialization from localStorage
- `OrderTracking.jsx`: Order ID resolution from params

**Fix**: Added `// eslint-disable-next-line react-hooks/set-state-in-effect` comments before each intentional call (these are initialization effects, not cascading render bugs).

### 3.5 Missing Hook Dependencies (3 instances)
- `handleSelectItem` in `CustomerChat.jsx`: Missing `setLock` dependency
- `handleCollectDetailsAndPay` in `CustomerChat.jsx`: Missing `clearPersistedState`, `setMessagesPruned`
- `SplashScreen` in `CustomerChat.jsx`: Missing `onDone` dependency (intentional — runs once on mount)

**Fix**: Added missing dependencies to dependency arrays; added eslint-disable for the intentional `onDone` case.

### 3.6 Unused Variable `isPending`
In `OrderTracking.jsx`, `const isPending = idx > currentIdx` was defined inside the `.map()` callback but never referenced in the JSX.

**Fix**: Removed the unused variable.

### 3.7 Unused Razorpay Handler Parameter
`async function (response)` in the Razorpay options handler — the `response` parameter was never used (payment success is verified server-side).

**Fix**: Removed the parameter.

---

## 4. Env Configuration Issues

### 4.1 Missing Environment Variables in `.env.example`
The `.env.example` file was missing entries for:
- `WHATSAPP_TOKEN` — Meta WhatsApp Cloud API token
- `WHATSAPP_PHONE_ID` — WhatsApp Business Phone Number ID
- `WHATSAPP_VERIFY_TOKEN` — Webhook verification token
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Payment processing

These were referenced in the code (`utils/whatsapp.js`, `routes/payment.js`) but not documented in the template.

**Fix**: Added all missing env vars to `.env.example` with placeholder values.

---

## 5. Code Quality Observations

### 5.1 Routing Order in `routes/orders.js`
The public `GET /:id` tracking route is defined at line 8, before `router.use(authenticateToken)` at line 79. This works correctly because Express matches routes in order. The admin routes (protected) come after. However, the `authenticateCustomer` middleware is required inline at line 44 (inside the file), which is an unusual pattern. It works but is fragile.

### 5.2 Auth Token Strategy
The frontend `api.js` utility only reads `admin_token` from localStorage. This means it can only make authenticated requests on behalf of admins. Customer API calls (e.g., `/orders/customer/my-orders`, `/chat/order`, `/payment/create-order`) use raw `fetch()` calls scattered across components. This is inconsistent — either the API client should handle both token types, or all API calls should use the same client.

### 5.3 Duplicate CSS Files
The project has:
- `frontend/src/index.css` (804 lines) — main stylesheet
- `frontend/src/App.css` (1 line) — says "unused"
- `frontend/src/pages/CustomerChat.css` (1364 lines) — chat-specific styles  
- `frontend/src/pages/OrderTracking.css` (519 lines) — tracking-specific styles

`CustomerChat.css` and `OrderTracking.css` both define duplicate `.bg-canvas`, `.blob`, `.bg-overlay`, `.header-logo`, and animation classes. This adds unnecessary bundle size and can cause specificity conflicts.

### 5.4 CustomerLogin.jsx — Dead Code
`frontend/src/pages/CustomerLogin.jsx` is a full login page (209 lines) that is **never imported or routed** in `App.jsx`. The unified login page `Login.jsx` handles both admin and customer authentication. This file should be deleted (it's dead code).

### 5.5 Database Choice
The backend uses SQLite (via `file:./dev.db`) for development despite `.env.example` suggesting PostgreSQL. The Prisma schema sets `provider = "sqlite"`. For production deployment (Render), PostgreSQL is expected. The dev database file (`backend/prisma/dev.db`) is tracked in git, which is generally not recommended.

### 5.6 Unused Asset
The frontend references a video file `/Create_a_realistic_cinematic_a.mp4` in multiple components (Landing, Login, CustomerChat, MyOrders, CustomerSignup, CustomerLogin). This file is not included in the repository and would 404 in production, triggering the blob fallback on every page.

### 5.7 axios Dependency Listed But Not Used
The frontend `package.json` includes `"axios": "^1.18.1"` in dependencies, but the actual code uses the native `fetch` API everywhere. The axios package is dead weight (~14KB minified).

---

## 6. Build & Test Results

### Frontend
- **Lint**: 0 errors, 0 warnings ✅
- **Build**: Success (953KB JS, 37KB CSS) ✅
- **Warning**: Bundle size > 500KB (chunk size warning — expected for a SPA with Recharts, Framer Motion, etc.)

### Backend  
- **Startup**: Success, listens on port 5000 ✅
- **Seed**: Success (10 orders, 5 customers, admin account, menu items) ✅
- **Health endpoint**: Returns `{"status":"healthy"}` ✅
- **Login**: JWT token issued for admin credentials ✅
- **Summary API**: Returns correct metrics, hourly chart, recent orders ✅

---

## 7. What Was NOT Changed (Intentional)

- **WhatsApp bot logic** in `backend/routes/whatsapp.js` — Only fixed the upsert bug. The actual webhook, state machine, prompt injection detection, and session management are untouched.
- **Scraped products JSON** (`backend/prisma/scraped_products.json`) — Produces 79 menu items. Left as-is.
- **CustomerLogin.jsx** — Left as dead code (not routed). Should be cleaned up in a future pass.
- **Duplicate CSS** — Left as-is to avoid visual regressions.
- **axios dependency** — Left in package.json (harmless, just unused).
- **Missing video file** — The code gracefully degrades to blob fallback.
