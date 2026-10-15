# 🚀 Edvexa Client | Order & Inventory Management Platform

> **Candidate Assignment for Software Engineer Intern at Edvexa**  
> An enterprise-grade e-commerce frontend built with **Next.js 16 (React 19)**, **TypeScript**, **Tailwind CSS**, and **Stripe Elements**. Fully equipped with zero-overselling cart handling, client-side idempotency key generation, real-time order lifecycle tracking, role-based navigation, and an intuitive Admin Operations Center.

**🌐 Live Demo:** [https://edvexa-client.vercel.app](https://edvexa-client.vercel.app)

---

## 🌟 Executive Summary & Features

| Feature / Requirement | Implementation in Edvexa Client | Status |
| :--- | :--- | :---: |
| **Framework & Engine** | Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS | ✅ Verified |
| **Authentication & RBAC** | JWT authentication context with role-based navigation guards (`admin` vs `customer`). Persistent sessions with automatic header injection. | ✅ Verified |
| **Google OAuth** | Real Google Sign-In via Better Auth — opens Google's account chooser popup, mints a custom JWT via Express backend. | ✅ Verified |
| **1-Click Reviewer Logins** | Dedicated instant login buttons for **Admin Mode** and **Customer Mode** on `/signin` and in the navigation banner. | ✅ Verified |
| **Idempotency Protection** | Automatic client-side `Idempotency-Key` generation per checkout session preventing double charges on network lag or duplicate clicks. | ✅ Verified |
| **Paginated 20-Product Catalog** | Instant search, 8 category filter pills, in-stock toggle, price sorting, live stock badges (Healthy, Low Stock ≤ 5, Out of Stock), 8-per-page pagination. | ✅ Verified |
| **Stripe Payment Gateway** | Real Stripe Elements integration with live test card processing (`4242 4242 4242 4242`), card brand detection, and instant feedback. | ✅ Verified |
| **Visual Order Lifecycle Tracker** | 4-stage interactive lifecycle timeline (`Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered`) with dynamic order cancellation. | ✅ Verified |
| **Admin Operations Dashboard** | Real-time KPI summaries (revenue, inventory value, units), live inventory adjustments, product management modal, and order pipeline controls. | ✅ Verified |
| **Aesthetic Excellence** | Crisp light emerald & modern clean UI with micro-animations, skeleton loaders, and responsive layouts. | ✅ Verified |
| **CodeZero AI Workflow** | Developed and structured leveraging the **CodeZero AI** platform & VS Code extension. | ✅ Verified |

---

## ⚡ 1-Click Reviewer Demo Credentials

Test accounts are pre-configured with instant 1-click login buttons on the **`/signin`** page and top banner:

| Role | Email | Password | Pre-configured Privileges & Views |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@edvexa.com` | `AdminPassword123!` | Access to `/admin`, stock adjustment (+/-), product CRUD, order lifecycle advancement. |
| **Customer** | `customer@edvexa.com` | `CustomerPassword123!` | Browse catalog, cart management, checkout with Stripe, view `/orders`, cancel orders. |
| **Google OAuth** | — | — | Click **Continue with Google** on `/signin` or `/signup` to sign in with your real Google account. |

---

## 🤖 AI-Assisted Workflow with CodeZero AI

In accordance with the Edvexa development guidelines, this frontend was built and refined using **CodeZero** ([https://frigga.cloud/codezero](https://frigga.cloud/codezero)).

### How CodeZero AI Was Leveraged on the Client:
1. **TypeScript Architecture & Type Safety**:
   - Modeled strict TypeScript interfaces for products, orders, auth tokens, and Stripe payment states.
2. **Idempotency Key Protocol**:
   - Engineered client-side unique key generation (`order_idem_${timestamp}_${random}`) sent via HTTP `Idempotency-Key` headers.
3. **Responsive UI & Design System**:
   - Transformed the catalog and cart workflows into a clean, modern aesthetic with emerald accents, interactive stock badges, and smooth lifecycle progress bars.
4. **Stripe Elements Integration**:
   - Streamlined the Stripe Payment Intents client flow with card brand detection and instant validation.

### 💡 Using CodeZero in VS Code
1. **Sign In**: Open the CodeZero panel or press `Ctrl+Shift+P` / `Cmd+Shift+P` and choose `CodeZero: Sign In` via [Frigga Cloud](https://frigga.cloud/codezero).
2. **Review Code**: Open any component (e.g. `src/components/ProductCard.tsx` or `src/app/cart/page.tsx`) and ask CodeZero:
   - `@workspace How does the checkout flow handle idempotency?`
   - `@workspace How are role-based views handled in the Navbar and Admin dashboard?`

---

## 🛠️ Local Setup & Running Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **Backend API**: Ensure `Edvexa-server` is running on `http://localhost:5000`

### 1. Installation
```bash
cd Edvexa-client
npm install
```

### 2. Environment Configuration
Verify or create `.env.local` (or `.env`):
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
*(Default test Stripe keys are already pre-configured in `.env`)*

### 3. Build & Type Check
Verify zero TypeScript compilation errors:
```bash
npm run build
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
Edvexa-client/
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── admin/          # Admin operations dashboard & stock management
│   │   ├── auth/
│   │   │   └── google-sync/# OAuth bridge — converts Better Auth session → Edvexa JWT
│   │   ├── cart/           # Shopping cart & Stripe checkout
│   │   ├── orders/         # Customer order history & live lifecycle tracker
│   │   ├── products/       # Product details & catalog views
│   │   ├── signin/         # Login with 1-click demo buttons + Google OAuth
│   │   ├── signup/         # Customer registration + Google OAuth
│   │   ├── layout.tsx      # Root layout with Auth & Cart providers
│   │   ├── page.tsx        # Homepage & 20-product interactive showcase
│   │   └── globals.css     # Tailwind CSS & global styling
│   ├── components/
│   │   ├── Navbar.tsx      # Dynamic role-tailored navigation & demo mode switcher
│   │   ├── Footer.tsx      # Application footer
│   │   ├── GoogleIcon.tsx  # Multi-color Google SVG icon component
│   │   └── ProductCard.tsx # Product card with stock badges & Add to Cart
│   ├── context/
│   │   ├── AuthContext.tsx # JWT token management, login, logout, Google OAuth, user profile
│   │   └── CartContext.tsx # Cart state, total calculation, local persistence
│   ├── lib/
│   │   ├── api.ts          # Centralized API client with auth & idempotency headers
│   │   ├── auth.js         # Better Auth server config (Google social provider + MongoDB)
│   │   └── auth-client.js  # Better Auth client for social sign-in triggers
│   └── types/
│       └── index.ts        # TypeScript models for Product, Order, User, etc.
├── .env                    # Environment configuration
├── next.config.mjs         # Next.js config with API proxy rewrites
├── package.json            # Project dependencies & scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 💳 Stripe Test Card Details

When testing checkout with the real Stripe Elements gateway:
- **Card Number**: `4242 4242 4242 4242`
- **Expiration Date**: Any valid future date (e.g., `12/28`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Postal Code**: Any 5 digits (e.g., `90210`)

---

**🌐 Live:** [https://edvexa-client.vercel.app](https://edvexa-client.vercel.app)  
Developed with ❤️ for **Edvexa**.
