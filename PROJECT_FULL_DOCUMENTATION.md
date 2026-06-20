  # PrintSmart - Complete Project Documentation

  ## Project Summary
  ## how are you dev

  ## this is md file 
  **PrintSmart** is a modern full-stack web application designed to simplify printing workflows for multiple user types (customers, shopkeepers, and administrators). Built with **Next.js 14** and **React 18** on the frontend, and a **Node.js & Express.js** server on the backend with **PostgreSQL** and **Prisma ORM**, the application provides role-based dashboards and management interfaces with a focus on user experience and accessibility. The platform enables customers to upload and manage print orders, shopkeepers to manage their operations and subscriptions, and administrators to oversee the entire ecosystem. The frontend is styled with **Tailwind CSS** and uses **Lucide React** for iconography, with file handling powered by **React Dropzone** and AWS S3 storage integration (with local fallback).

  ## Audience & Prerequisites

  **Target Audience:** Full-stack developers, DevOps engineers, and technical leads responsible for developing, deploying, and maintaining the PrintSmart application in production environments.

  **Prerequisites:** 
  - Node.js 18+ (20+ recommended)
  - npm or yarn
  - Basic understanding of Next.js, React, and Tailwind CSS
  - Familiarity with Git and version control
  - Docker and Docker Compose (for containerized deployment)
  - PostgreSQL knowledge (if extending to backend)
  - Understanding of RESTful API principles

   **Prerequisites:** 
  - Node.js 18+ (20+ recommended)
  - npm or yarn
  - Basic understanding of Next.js, React, and Tailwind CSS
  - Familiarity with Git and version control
  - Docker and Docker Compose (for containerized deployment)
  - PostgreSQL knowledge (if extending to backend)
  - Understanding of RESTful API principles

  ---

  ## Quick Start

  ### Installation & Setup

  PrintSmart consists of a Next.js frontend and an Express.js backend. You must configure and run both components for the system to function correctly.

  #### 1. Backend & Database Setup
  ```bash
  # Navigate to backend directory
  cd backend

  # Install server-side dependencies
  npm install

  # Configure environment variables
  cp .env.example .env
  # Edit .env to set your DATABASE_URL, PORT, JWT_SECRET, and AWS S3 keys
  ```

  #### 2. Run Database Migrations
  Programmatic database push occurs on startup, but you can manually sync schema via:
  ```bash
  # Create/apply migrations
  npm run prisma:migrate dev

  # Re-generate Prisma Client
  npm run prisma:generate
  ```

  #### 3. Frontend Setup
  ```bash
  # Navigate to frontend directory
  cd ../frontend

  # Install client-side dependencies
  npm install

  # Configure environment variables
  cp .env.example .env.local
  # Verify NEXT_PUBLIC_API_URL points to the backend (default: http://localhost:5000)
  ```

  #### 4. Run the Development Servers
  Open two terminal windows:

  **Run Backend (Port 5000):**
  ```bash
  cd backend
  npm run dev
  ```

  **Run Frontend (Port 3000):**
  ```bash
  cd frontend
  npm run dev
  ```

  **Access Points:**
  - **Customer Homepage**: `http://localhost:3000`
  - **Shopkeeper Portal**: `http://localhost:3000/shopkeeper/login`
  - **Hidden Admin Gateway**: Click the Printsmart logo 5 times on the homepage

  > [!NOTE]
  > **Default Development Test Credentials:**
  > - Email: `defaultshop@printsmart.com`
  > - Password: `password123`
  > - Shopkeeper ID / shopkeeperIdCode: `smart-print-hub`
  > - Manual Test Entry Code: `0000` (resolves to `smart-print-hub`)

  ### Basic Commands

  #### Backend Commands (Inside `backend/`):
  ```bash
  npm run dev                 # Start Express server with nodemon
  npm start                   # Start Express server in production
  npm run prisma:migrate      # Create/run schema migrations
  npm run prisma:generate     # Rebuild Prisma Client models
  ```

  #### Frontend Commands (Inside `frontend/`):
  ```bash
  npm run dev                 # Start Next.js development server
  npm run build               # Build production assets
  npm start                   # Start Next.js production server
  npm run lint                # Run ESLint checking
  ```

  ---

  ## Architecture

  ### System Architecture Overview

  ```
  ┌─────────────────────────────────────────────────────┐
  │                   Browser / Client                  │
  │              (User - Admin/Shopkeeper/Customer)     │
  └────────────────────────┬────────────────────────────┘
                          │
                      HTTP/HTTPS
                          │
  ┌────────────────────────▼────────────────────────────┐
  │              Next.js 14 Frontend                     │
  │  ┌──────────────────────────────────────────────┐   │
  │  │  App Router (app/ directory)                 │   │
  │  │  - Pages & Layouts                           │   │
  │  │  - API Routes (client-side logic)            │   │
  │  │  - Middleware                                │   │
  │  └──────────────────────────────────────────────┘   │
  │  ┌──────────────────────────────────────────────┐   │
  │  │  Styling & UI                                │   │
  │  │  - Tailwind CSS 3.3                          │   │
  │  │  - Lucide React Icons                        │   │
  │  │  - Custom CSS (globals.css)                  │   │
  │  └──────────────────────────────────────────────┘   │
  │  ┌──────────────────────────────────────────────┐   │
  │  │  Features                                    │   │
  │  │  - Role-based routing & dashboards           │   │
  │  │  - File upload with React Dropzone           │   │
  │  │  - LocalStorage for session management       │   │
  │  │  - Responsive design (mobile-first)          │   │
  │  └──────────────────────────────────────────────┘   │
  └────────────────────────┬────────────────────────────┘
                          │
                  HTTP/REST API Requests
                          │
  ┌────────────────────────▼────────────────────────────┐
  │              Express.js / Node.js Backend           │
  │  ┌──────────────────────────────────────────────┐   │
  │  │  Services & Controllers                      │   │
  │  │  - Order Wait-Time & Custom ID Sequencer     │   │
  │  │  - PDFKit Invoice Generation                 │   │
  │  │  - QR Code Slug/UUID Services                │   │
  │  │  - Multer Memory S3 Storage w/ Local Fallback│   │
  │  │  - In-Memory Session Tracking & 2-PC Limit   │   │
  │  │  - Real-time Analytics Statistics Engine     │   │
  │  └──────────────────────────────────────────────┘   │
  └────────────────────────┬────────────────────────────┘
                          │
                  Prisma ORM / SDKs
                          │
          ┌────────────────┴────────────────┐
          │                                 │
      PostgreSQL                      External Services
      Database                        (AWS S3 Storage, etc.)
  ```

  ### User Role Flow

  ```
  User Visits http://localhost:3000
              │
      ┌───────┴────────┐
      │                │
  Existing User   New User
      │                │
      ├──Admin────────────────────────────────→ Admin Dashboard
      │                │                        - View orders
      │                │                        - Manage shops
      │                │                        - Revenue tracking
      │                │
      ├──Shopkeeper────┴──────────────────────→ Shopkeeper Login
      │                                          - Onboarding (Profile & Pricing)
      │                                          - Subscription Management
      │                                          - Dashboard (Cards/Table Premium layout)
      │                                          - Business Network & PrintSmart AI
      │                                          - Settings & Help Queue
      │
      └──Customer─────────────────────────────→ Customer Workflow
                                                - QR Code Detection & Fetch
                                                - Language Selection (Auto-detect)
                                                - File Upload (PDF.js Canvas Thumbnail)
                                                - Configuration (Talk First / Layout options)
                                                - Review (Shop specs & GST tax math)
                                                - Order Placed (ID Sequence, Wait Wait Wait)
  ```

  ### Key Architectural Decisions

  | Decision | Rationale | Trade-offs |
  |----------|-----------|-----------|
  | **Next.js App Router** | Modern, file-based routing; better performance with streaming | Requires Node.js 18+; different learning curve from Pages Router |
  | **Tailwind CSS** | Utility-first; rapid prototyping; smaller bundle than component libraries | Less customizable than CSS-in-JS; requires build step |
  | **Client-side State & JWT** | Fast UI responses, localStorage for session/shop preference, JWT token for API auth | Sensitive operations require token verification; state synced via REST APIs |
  | **Client-Server Architecture** | Segregated frontend (Next.js) and backend (Express) for robust service decoupling | Requires API network overhead; must manage CORS configurations |
  | **React Dropzone** | Lightweight file upload; good UX | Limited validation; no built-in progress tracking |

  ---

  ## Folder Structure

  ```
  PrintSmart/
  ├── backend/                          # Node.js & Express Server App
  │   ├── config/                       # Configuration modules
  │   │   └── db.js                     # Prisma client initializer instance
  │   ├── controllers/                  # Route controller functions
  │   │   ├── admin.controller.js       # Platform administrator dashboard analytics [NEW]
  │   │   ├── ai.controller.js          # AI Design generation and suggestions [NEW]
  │   │   ├── auth.controller.js        # Authentication & Profile management
  │   │   ├── feedback.controller.js    # Customer support submissions & updates
  │   │   ├── file.controller.js        # Multer-to-S3 file uploading bridge
  │   │   ├── order.controller.js       # Placement, queues, and invoices
  │   │   ├── payment.controller.js     # Customer transaction reference submission & verification [NEW]
  │   │   ├── queue.controller.js       # Queue lists & positions editor
  │   │   ├── reward.controller.js      # Random rewards & scratch persistence logic [NEW]
  │   │   ├── statistics.controller.js  # Shop analytics compiling engine
  │   │   └── user.controller.js        # Client profile onboarding sync
  │   ├── middleware/                   # Request filters
  │   │   └── auth.middleware.js        # Protected route JWT validator
  │   ├── prisma/                       # Prisma DB files
  │   │   ├── dev.db                    # Active SQLite development DB
  │   │   └── schema.prisma             # Entity models & cascades schema
  │   ├── routes/                       # REST endpoint routing mappings
  │   │   ├── admin.routes.js           # Admin stats & dashboard routes [NEW]
  │   │   ├── ai.routes.js              # AI Poster Studio generation endpoints [NEW]
  │   │   ├── auth.routes.js            # Auth routing definitions
  │   │   ├── feedback.routes.js        # Customer issues routes
  │   │   ├── file.routes.js            # Multer upload route
  │   │   ├── order.routes.js           # Client & Shopkeeper order management
  │   │   ├── payment.routes.js         # Transaction registration & verification endpoints [NEW]
  │   │   ├── queue.routes.js           # Position checking endpoints
  │   │   ├── reward.routes.js          # Customer reward & shopkeeper stats routes [NEW]
  │   │   ├── shopkeeper.routes.js      # Public shop specs & QR tools
  │   │   ├── statistics.routes.js      # Earnings & counts logs endpoints
  │   │   └── user.routes.js            # Core customer profiles creation
  │   ├── services/                     # Business logic workers
  │   │   ├── csv.service.js            # In-memory CSV cache for rewards content [NEW]
  │   │   ├── invoice.service.js        # PDFKit-based professional billing PDF generator (supports premium itemized multi-column table)
  │   │   ├── order.service.js          # Custom MMDDYY print-type ID & Estimated wait calculations
  │   │   ├── qr.service.js             # Basic UUID QR codes generator
  │   │   ├── qrcode.service.js         # Base64 Data URL & Slug QR code builder
  │   │   ├── seed.service.js           # Automatic default shopkeeper registers
  │   │   ├── session.service.js        # Database-backed concurrent session tracker and 2-PC limit controller [NEW]
  │   │   └── storage.service.js        # AWS S3 file upload with local folder fallback
  │   ├── uploads/                      # Local file fallback directory (git-ignored)
  │   │   ├── invoices/                 # Generated PDF invoices
  │   │   ├── qrcodes/                  # Shopkeeper entry QR codes
  │   │   └── orders/                   # Customer uploaded document storage
  │   ├── package.json                  # Server package configuration
  │   └── server.js                     # Node.js runtime initialization & DB schemas synchronization
  │
  └── frontend/                         # Next.js 14 Web Interface App
      ├── app/                          # Next.js App Router root directory
      │   ├── layout.js                 # Global HTML & SEO structural shell
      │   ├── page.js                   # Homepage (detects scanned QRs, renders Partner specs)
      │   ├── globals.css               # Tailwind directives & Glassmorphism definitions
      │   ├── I18nProvider.js           # Multi-language i18n translation context provider [NEW]
      │   │
      │   ├── api/                      # Client-side backend routes
      │   │   └── ai/
      │   │       └── generate-config/
      │   │           └── route.js      # Groq AI structured poster config endpoint [NEW]
      │   │
      │   ├── dashboard/
      │   │   └── page.js               # Simple redirect to shopkeeper dashboard [NEW]
      │   │
      │   ├── admin/                    # Admin portal pages
      │   │   ├── page.js               # Admin authentication gateway
      │   │   └── dashboard/
      │   │       └── page.js           # Global platform KPI grids & feedbacks table
      │   │
      │   ├── components/               # Shareable component modules
      │   │   ├── BackButton.js         # Unified client navigation button
      │   │   ├── FeedbackButton.js     # Floating help modal triggers
      │   │   ├── FeedbackLink.js       # Reusable help form footer link [NEW]
      │   │   └── customer/             # Customer workflow UI components [NEW]
      │   │       ├── DocumentPreview.jsx # Live thumbnail & grayscale CSS preview renderer [NEW]
      │   │       └── FilePreviewSection.jsx # Document title & config options wrapper [NEW]
      │   │
      │   ├── customer/                 # Customer order flow views
      │   │   ├── language/
      │   │   │   └── page.js           # Detects browser locale & customer metadata
      │   │   ├── configuration/
      │   │   │   └── page.js           # Set copies, duplex, qualities, page-ranges or "Talk First"
      │   │   ├── upload/
      │   │   │   └── page.js           # Multiple drag-drop uploads with PDF.js canvas thumbnails
      │   │   ├── review/
      │   │   │   └── page.js           # Confirms print layouts and GST tax math
      │   │   ├── order-placed/
      │   │   │   └── page.js           # Custom ID, estimated wait-time and tracking redirect
      │   │   └── orders/
      │   │       └── page.js           # Active order statuses queue, downloads, cancellations
      │   │
      │   ├── shopkeeper/               # Shopkeeper admin dashboard
      │   │   ├── page.js               # Shopkeeper home redirect wrapper [NEW]
      │   │   ├── login/
      │   │   │   └── page.js           # Multiple login support authentication
      │   │   ├── register/
      │   │   │   └── page.js           # New printer registrations
      │   │   ├── statistics-and-analysis/
      │   │   │   └── page.js           # Detailed order analytics dashboard (Bar chart, trends, print-sizes, order-types) [NEW]
      │   │   ├── business-network/
      │   │   │   └── page.js           # Premium connections & network layout [NEW]
      │   │   ├── printsmart-ai/
      │   │   │   └── page.js           # AI-guided printer queues optimization & analytics [NEW]
      │   │   ├── dashboard/
      │   │   │   ├── page.js           # Shop center stats & Premium Layout toggler (Card/Grid)
      │   │   │   └── _components/      # Stats rows, docks, notification bells, orders tables
      │   │   ├── onboarding/
      │   │   │   ├── pricing-setup/
      │   │   │   │   └── page.js       # Subscription selects
      │   │   │   └── profile-setup/
      │   │   │       └── page.js       # Shop metadata database configuration (retains details)
      │   │   ├── profile/
      │   │   │   └── page.js           # View & edit profiles using Next-safe standard image tags
      │   │   ├── settings/
      │   │   │   ├── page.js           # Main Settings navigation dashboard [NEW]
      │   │   │   ├── appearance/
      │   │   │   │   └── page.js       # Dark mode & visual UI appearance preferences [NEW]
      │   │   │   ├── language-accessibility/
      │   │   │   │   └── page.js       # Language selector & high contrast toggler [NEW]
      │   │   │   ├── print-configuration/
      │   │   │   │   └── page.js       # Set pricing tables & default print configurations [NEW]
      │   │   │   ├── printers-support/
      │   │   │   │   └── page.js       # Printer device connections & queue status management [NEW]
      │   │   │   └── support-feedback/
      │   │   │       └── page.js       # Support inquiry forms & feedback submissions [NEW]
      │   │   ├── subscription/
      │   │   │   └── page.js           # Subscriptions manager & billing history details [NEW]
      │   │   └── support/
      │   │       └── page.js           # Shopkeeper support FAQ accordions [NEW]
      │   │
      │   └── take-a-print/
      │       └── page.js               # Manual shop ID slug gateway (test fallback code "0000")
      │
      ├── lib/                          # Helper library utilities
      │   └── shop-context.js           # Caches full activeShop object in localStorage
      ├── public/                       # Static public assets (images, designs)
      ├── package.json                  # Client package configuration
      └── tailwind.config.js            # Tailwind layout and gradient extensions
  ```

  ---

  ## File-by-File Breakdown

  ### Root Configuration Files

  #### `package.json`
  **Purpose:** Define project metadata, dependencies, and npm scripts.

  **Full Contents:**
  ```json
  {
    "name": "printsmart",
    "version": "1.0.0",
    "description": "Smart Printing Simplified",
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    "dependencies": {
      "autoprefixer": "^10.4.16",
      "lucide-react": "^0.293.0",
      "next": "^14.2.35",
      "postcss": "^8.4.31",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "react-dropzone": "^14.2.3",
      "tailwindcss": "^3.3.0"
    }
  }
  ```

  **Key Dependencies Explained:**
  - `next@14.2.35`: Framework; provides App Router, SSR, optimization
  - `react@18.3.1`: Core library; enables component-based UI
  - `tailwindcss@3.3.0`: Utility CSS framework for styling
  - `lucide-react@0.293.0`: Icon library (1000+ SVG icons)
  - `react-dropzone@14.2.3`: File upload widget with drag-and-drop
  - `postcss`, `autoprefixer`: Build tools for CSS processing

  ---

  #### `next.config.js`
  **Purpose:** Configure Next.js build and runtime behavior.

  **Current Contents:**
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
  };

  module.exports = nextConfig;
  ```

  **Recommended Production Extensions:**
  ```javascript
  const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '**.example.com' },
      ],
    },
    headers: async () => [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ],
    compress: true,
    swcMinify: true,
  };
  ```

  ---

  #### `tailwind.config.js`
  **Purpose:** Extend and customize Tailwind CSS theming.

  **Full Contents:**
  ```javascript
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      './app/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
        },
        backgroundImage: {
          'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        },
        boxShadow: {
          'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
      },
    },
    plugins: [],
  }
  ```

  **Custom Utilities Provided:**
  - `bg-gradient-brand`: Purple-to-indigo gradient for CTAs
  - `shadow-glass`: Glassmorphism effect shadow

  ---

  #### `postcss.config.js`
  **Purpose:** Configure PostCSS plugins for CSS processing.

  **Full Contents:**
  ```javascript
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
  ```

  ### Core Application Files

  #### `app/layout.js`
  **Purpose:** Root layout wrapper for all pages; sets metadata and HTML structure.

  **Full Contents:**
  ```javascript
  import './globals.css'

  export const metadata = {
    title: 'Printsmart - Smart Printing Simplified',
    description: 'Scan. Upload. Print. Done.',
  }

  export default function RootLayout({ children }) {
    return (
      <html lang="en" data-scroll-behavior="smooth">
        <body className="bg-white">{children}</body>
      </html>
    )
  }
  ```

  **Key Points:**
  - Sets page title and meta description (affects SEO)
  - Imports `globals.css` (Tailwind directives)
  - Wraps all child pages with consistent HTML structure
  - `data-scroll-behavior="smooth"` enables smooth scrolling (from globals.css)

  ---

  #### `app/globals.css`
  **Purpose:** Global styles; Tailwind directives and custom CSS classes.

  **Key Sections:**
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  /* CSS Reset */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
    background: #f8f7ff;
    color: #1a1a1a;
  }

  /* Custom Classes */
  .glassmorphism {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 20px;
  }

  .wave-bg {
    background: linear-gradient(135deg, #f5f3ff 0%, #f0e6ff 50%, #e8d5ff 100%);
    position: relative;
    overflow: hidden;
  }

  .mac-dots { display: flex; gap: 8px; }
  .mac-dot { width: 12px; height: 12px; border-radius: 50%; }
  ```

  ---

  #### `app/page.js` (Homepage)
  **Purpose:** Landing page; entry point for all users. Directs to role-specific dashboards.

  **Key Sections:**
  - **Header:** Logo, language selector, admin link
  - **Hero Section:** "Smart Printing. Simplified." tagline
  - **Center CTA:** "Take a Print" card (links to customer upload)
  - **Bottom Section:** "Are you a Shopkeeper?" with Register/Login buttons

  **Exports:** Default React component (functional)

  **Key Imports:**
  - `useState` (React): For language selector state
  - `Link` (Next.js): For client-side navigation
  - Icons from `lucide-react`: Settings, FileText, LogIn

  ---

  ### Admin Pages

  #### `app/admin/page.js`
  **Purpose:** Admin authentication gate; checks login status before showing dashboard.

  **Logic:**
  - Checks `localStorage.adminLoggedIn`
  - Shows login form if not authenticated
  - Redirects to `/admin/dashboard` on success

  ---

  #### `app/admin/dashboard/page.js`
  **Purpose:** Rebuilt Premium Platform Administration Dashboard. Coordinates system stats, shop manager portals, order registers, reward/coupon controls, AI run logs, support ticketing, and settings profiles.

  **Sub-Components (Located in `_components/`):**
  * **`AdminSidebar.js`:** Sleek, Vercel-style semi-dark navigation featuring 8 tabs. Includes a dynamic **System Health Card** complete with an online ping indicator, live server uptime metrics, and a custom inline green SVG micro-sparkline.
  * **`StatCard.js`:** High-end KPI component representing individual baseline SVG wave sparklines, growth metrics, dynamic color accent overrides, and animated hover effects.

  **Key Dashboard Sections (8-Tab Views):**
  1. **Overview (Dashboard):** Premium layout hosting 8 top-tier metric cards, dynamic orders trend graph curves (Daily/Weekly/Monthly), an SVG order status donut chart, priority warning alert boxes, and top performing shop lists.
  2. **Shops Directory:** Active listings showing approval and onboarding states, shop contact indexes, subscription types, and a live toggle to instantly onboard/suspend shops by triggering `PUT /api/admin/shops/:id/onboard` API calls.
  3. **Orders History:** Detailed customer logs showing billing margins, order queues, print modes (e.g., standard color vs duplex), and status badges.
  4. **Coupons & Rewards:** Overview of generated active coupons, cost analysis matrices, and mock sparklines for coupon activations.
  5. **AI Telemetry:** Log counters for generated AI backgrounds, banner assets, and poster optimizations, detailing successful runs vs failed queues.
  6. **Support Helpdesk:** Priority tag registries detailing store associations, ticket priorities, and interactive response forms.
  7. **Revenue Tracking:** Platform tax rate indexes, monthly platform margins, and tax-cut metrics.
  8. **Platform Settings:** Interface to toggle platform-wide Commission Fee percentages, Maintenance Locks, and Allowed Upload File Types.

  > [!TIP]
  > **Hot-Reloading Static Chunk 404s Resolution:**
  > If Next.js dev server triggers `404` errors on `/admin/dashboard` chunks during simultaneous production builds, clear the cache and restart:
  > ```powershell
  > Remove-Item -Recurse -Force .next
  > npm run dev
  > ```

  ---

  ### Shopkeeper Pages

  #### `app/shopkeeper/login/page.js`
  **Purpose:** Shopkeeper authentication; login form with email/password.

  **Key Features:**
  - Form validation
  - Error message display
  - Remember-me checkbox
  - Link to registration
  - Submit button with loading state

  ---

  #### `app/shopkeeper/register/page.js`
  **Purpose:** New shopkeeper registration; collects shop and account details.

  **Form Fields:**
  - Shop Name
  - Email
  - Phone
  - Address
  - Password
  - Password Confirmation
  - Terms acceptance checkbox

  ---

  #### `app/shopkeeper/dashboard/page.js`
  **Purpose:** Main shopkeeper dashboard; overview of their operations.

  **Sections:**
  - **Header** (DashboardHeader.js): Shop name, notifications, profile
  - **Welcome Bar** (WelcomeBar.js): Personalized greeting
  - **Stats Row** (StatsRow.js): KPIs (Orders, Earnings, Subscribers)
  - **Recent Orders** (RecentOrders.js): Table of latest orders
  - **Bottom Dock** (BottomDock.js): Quick-access navigation

  ---

  #### Shopkeeper Dashboard Components

  ##### `_components/DashboardHeader.js`
  **Purpose:** Sticky header showing shop branding, notifications, and profile menu.

  **Key Elements:**
  ```javascript
  // Notification button with red dot indicator
  // Profile dropdown showing shop initials and "Shopkeeper" label
  // Uses useMemo to calculate initials from shop name

  export default function DashboardHeader({ shopName }) {
    const initials = useMemo(() => {
      // Extracts first letters of shop name (e.g., "ABC Printing" → "AP")
    }, [shopName])
    
    return (
      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur ...">
        {/* Header content */}
      </header>
    )
  }
  ```

  **Exports:**
  - `NotificationButton`: Reads-only bell icon with indicator
  - `ProfileDropdown`: Shows shop info; can be extended for dropdown menu
  - `LogoutButton`: Clears session tokens from localStorage and redirects to `/shopkeeper/login`
  - `default` (DashboardHeader): Main component

  ---

  ##### `_components/WelcomeBar.js`
  **Purpose:** Personalized greeting and motivational message.

  **Displays:**
  - "Welcome back, [ShopName]!"
  - Time-based greeting (Good morning/afternoon/evening)
  - Motivational text (e.g., "Ready to manage your orders?")

  ---

  ##### `_components/StatsRow.js`
  **Purpose:** Key performance indicators (KPIs) in card format.

  **Stats Shown:**
  - Total Orders: `1,234`
  - Monthly Earnings: `₹45,000`
  - Active Subscribers: `89`
  - Pending Orders: `12`

  **Styling:** Glassmorphic cards with icons and color-coding

  ---

  ##### `_components/RecentOrders.js`
  **Purpose:** Displays table of most recent orders.

  **Table Columns:**
  - Order ID
  - Customer Name
  - Status (with badge)
  - Amount
  - Date/Time

  **Features:**
  - Hover effects
  - Status color-coding
  - Truncated text for long names

  ---

  ##### `_components/OrderCard.js`
  **Purpose:** Single order display card (alt format to table row).

  **Shows:**
  - Order ID
  - Customer info
  - Item count
  - Total amount
  - Status
  - Action buttons (View, Edit, Cancel)

  ---

  ##### `_components/mockData.js`
  **Purpose:** Mock data for testing and demo purposes.

  **Sample Data:**
  ```javascript
  export const mockOrders = [
    { id: '001', customer: 'John Doe', items: 5, amount: '₹250', status: 'Pending' },
    { id: '002', customer: 'Jane Smith', items: 3, amount: '₹150', status: 'Printing' },
    // ...
  ];

  export const mockStats = {
    totalOrders: 1234,
    earnings: '₹45,000',
    subscribers: 89,
    pending: 12,
  };
  ```

  ---

  ##### `_components/BottomDock.js`
  **Purpose:** Floating premium navigation dock at the bottom of the Shopkeeper Dashboard page.

  **Navigation Items & Premium Enhancements:**
  - **Profile:** Link to profile details (`/shopkeeper/profile`).
  - **Settings:** Access settings preferences (`/shopkeeper/settings`).
  - **Subscription:** Manage pricing tier schedules (`/shopkeeper/subscription`).
  - **Statistics & Analysis:** Interactive aggregated orders charts.
  - **Filters:** Quick filter buttons for Pending, Completed, Downloaded, and Cancelled queues.
  - **➕ Direct Add Order (Blue Plus Button):** Prominent walk-in order creation gateway (`bg-[#3B82F6]`) styled as a blue rounded-square with a white plus. Triggers a customized customer order flow (`/customer/language?shopkeeperAddOrder=true`) which auto-configures layouts, bypasses customer support talks, and automatically routes the shopkeeper back to their dashboard queue upon completion.
  - **🌐 Business Network (Glow Upgrade):** Enhanced with a solid Indigo gradient (`bg-indigo-600 border-indigo-200`), custom shadow glow (`shadow-[0_0_15px_rgba(99,102,241,0.6)]`), and active top-right ping pulse for beautiful interactive aesthetics.
  - **PrintSmart AI:** Glowing purple AI button with a continuous fuchsia ping pulse.

  ---

  ##### `_components/FloatingHelpButton.js`
  **Purpose:** Floating action button for help/support.

  **Features:**
  - Sticky position (bottom-right)
  - "?" icon or "Help" text
  - Links to support page
  - Smooth animations on hover

  ---

  ##### `_components/BackToDashboardButton.js`
  **Purpose:** Navigation button to return to dashboard.

  **Shows:**
  - Back arrow icon + "Back to Dashboard" text
  - Links to `/shopkeeper/dashboard`

  ---

  #### `app/shopkeeper/onboarding/layout.js`
  **Purpose:** Layout wrapper for onboarding flow; ensures consistent styling across steps.

  **Features:**
  - Progress indicator (visual step tracker)
  - Side navigation
  - Consistent header/footer

  ---

  #### Onboarding Flow Pages

  ##### `pricing-setup/page.js`
  **Purpose:** Step 1 of onboarding; shopkeeper selects subscription plan.

  **Pricing Tiers:**
  - Basic: ₹99/month
  - Pro: ₹299/month
  - Enterprise: Custom

  **Features:**
  - Plan comparison table
  - Feature highlights
  - "Select Plan" button
  - Save to localStorage

  ---

  ##### `profile-setup/page.js`
  **Purpose:** Step 2 of onboarding; collects shop details.

  **Form Fields:**
  - Shop Name
  - Shop Address
  - Phone Number
  - GST Number
  - **UPI ID** (Mandatory field for receiving payment transfers)
  - **Payment QR Code** (Optional image upload field for display on customer side)
  - Bank Account Details (optional)

  **Save:** Stores to localStorage and syncs with backend database

  ---

  ##### `onboardingStorage.js`
  **Purpose:** Helper functions for localStorage management during onboarding.

  **Exported Functions:**
  ```javascript
  export function saveOnboardingData(key, data) { /* ... */ }
  export function getOnboardingData(key) { /* ... */ }
  export function clearOnboardingData() { /* ... */ }
  export function getOnboardingProgress() { /* ... */ }
  ```

  ---

  ##### `ui.js`
  **Purpose:** Reusable UI components for onboarding (inputs, buttons, etc.).

  **Exports:**
  - `InputField`: Text input with label and validation
  - `SelectDropdown`: Dropdown menu
  - `CheckboxField`: Checkbox with label
  - `PrimaryButton`: Main CTA button
  - `SecondaryButton`: Secondary action button

  ---

  #### Shopkeeper Settings Pages

  ##### `settings/page.js`
  **Purpose:** Main settings page; navigation hub for all settings.

  **Sections:**
  - Language & Accessibility
  - Printer Support
  - Support & Feedback
  - Account Settings
  - Privacy & Security
  - Appearance
  - Print Configuration

  ---

  ##### `settings/appearance/page.js`
  **Purpose:** Customize theme appearance and layout modes.

  **Features:**
  - Toggle between light, dark, and system themes
  - Choose visual density of tables and charts
  - High-contrast visual options
  - Toggle standard navigation hover effects

  ---

  ##### `settings/language-accessibility/page.js`
  **Purpose:** Language selection and accessibility options.

  **Features:**
  - Language selector (English, Hindi, Marathi, etc.)
  - Dark mode toggle
  - Font size selector
  - High contrast mode toggle
  - Screen reader optimization option

  ---

  ##### `settings/print-configuration/page.js`
  **Purpose:** Configure active printer paper sizes, duplex setups, and standard pricing scales.

  **Features:**
  - Standard page layout pricing matrices (B&W vs Color margins)
  - Custom duplex configuration overrides
  - Default orientation and margin scales setup
  - Estimated runtime calculator modifiers

  ---

  ##### `settings/printers-support/page.js`
  **Purpose:** Manage printer integrations and support.

  **Features:**
  - Connect printer device
  - Manage print queue
  - Printer status
  - Troubleshooting guide

  ---

  ##### `settings/support-feedback/page.js`
  **Purpose:** Support contact form and feedback submission.

  **Form Fields:**
  - Subject dropdown
  - Message textarea
  - File attachment (optional)
  - Submit button

  ---

  #### Other Shopkeeper Pages

  ##### `statistics-and-analysis/page.js`
  **Purpose:** Comprehensive interactive orders analytics dashboard for shopkeepers.

  **Features:**
  - Real-time aggregation of orders by Day, Week, and Month filters
  - Dynamic interactive SVG charts including **Main Print Trends Chart** and **Order Distribution Chart**
  - **Revenue Summary Heatmap** showing order distributions by hour-of-day of the week
  - Interactive filters for Total, Black & White, and Color prints
  - Full scratch-card analytics history log view for promotional campaigns

  ---

  ##### `subscription/page.js`
  **Purpose:** Manage active subscription and upgrade/downgrade.

  **Shows:**
  - Current plan details
  - Renewal date
  - Upgrade/downgrade buttons
  - Invoice history
  - Billing address

  ---

  ##### `support/page.js`
  **Purpose:** Support hub; FAQ, contact, and documentation.

  **Sections:**
  - FAQ accordion
  - Live chat widget (if integrated)
  - Contact form
  - Documentation links
  - Video tutorials

  ---

  ##### `profile/page.js`
  **Purpose:** View and edit shopkeeper profile.

  **Editable Fields:**
  - Name
  - Email
  - Phone
  - Shop Name
  - Shop Description
  - Profile photo

  ---

  ##### `statistics-and-analysis/page.js`
  **Purpose:** Shop Statistics & Analysis dashboard for the shopkeeper.

  **Sections & Features:**
  - **KPI Summary Cards:** Displays counts for Pending, Completed, Downloaded, and Cancelled orders, filtered dynamically by print channel (All, B&W, Color) and time range.
  - **Main Print Trends Chart:** Dynamic SVG rendering a smooth Bezier line chart showing total pages printed (violet) and total order value (amber) over selected timeframes. Includes an interactive hovering tooltip.
  - **Order Distribution Donut Chart:** Interactive SVG donut chart showing order segments (Xerox, Digital Print, B&W, Color). Slices dynamically expand outward on hover.
  - **Revenue Summary & Heatmap:** Lists total revenue and average order value, alongside a 7x12 matrix (Mon-Sun by 2-hour slots) visualizing order density hotspots.
  - **Top Formats & Sizes:** Lists count distributions for file extensions (`.pdf`, `.docx`, `.jpg`, `.png`, other) and print paper sizes (A4, A3, Legal, Letter, other).
  - **Scratch Card History:** Displays customer loyalty coupon codes claimed, pending, or expired.

  ---

  ### Customer Pages

  #### `customer/language/page.js`
  **Purpose:** Customer's first step; select language for their session and collect user details.

  **Shows:**
  - Language options: English, Hindi, Marathi, Gujarati (with custom flag selectors)
  - "Other Languages" dropdown listing regional options (Bengali, Punjabi, Tamil, etc.)
  - User details form (Name [required], Phone [optional], Email [optional]) to sync identity parameters
  - Auto-detects browser language on initial load

  **Saves:** 
  - Selected language to `localStorage.customerLanguage` and initializes `i18next` locale context
  - Posts user details to `/api/users/create` to register/fetch user ID, and saves context to `localStorage.customerSession`

  ---

  #### `customer/configuration/page.js`
  **Purpose:** Select printing preferences (paper size, color/BW, quality, duplex, range, and copies).

  **Layout Flow Options:**
  - **"I Want to Talk with Shopkeeper First"**: Bypasses layout configurations and redirects to the review step. Sets order variant to `'talk'` with ₹0 price.
  - **"I Want to Configure Print Layout"**: Reveals details below.

  **Options:**
  - Print Type (Black & White vs Color)
  - Number of Copies (supports increment/decrement selectors, range 1-999)
  - Paper Size (A4, A3, A5, Legal, Letter, Executive, Ledger, Tabloid)
  - Print Sides (Single-sided vs Double-sided)
  - Orientation (Portrait vs Landscape)
  - Print Quality (Draft, Normal, High)
  - Pages to Print (All Pages, Odd Pages Only, Even Pages Only)

  **Saves:** Stores full file configurations array (with customized layouts per file) to `localStorage.printConfigurations`

  ---

  #### `customer/upload/page.js`
  **Purpose:** Drag-and-drop file upload using React Dropzone, wrapped in a `<Suspense>` boundary to allow clean build-time static generation.

  **Features:**
  - Multi-file drag/drop zone supporting PDF, Word doc/docx, and JPG/JPEG/PNG images.
  - Dynamic thumbnail generation (Images use Canvas resize, PDFs use `pdf.js` worker rendering).
  - Custom renaming field for each uploaded file (retaining file extensions).
  - **Full-Screen Loading/Buffering State**: Triggers a premium glassmorphic full-screen backdrop overlay (`backdrop-blur-md bg-slate-900/60`) during file upload loops or "Talk to Shopkeeper" requests.
  - **Dynamic Text Cycling**: Cycles through translation-friendly status messages every 2.5 seconds (e.g. `"Uploading document (1 of 3)..."`, `"Processing print configuration..."`, `"Preparing preview..."`).
  - **Interactive Disabling**: Blurs the entire background page (`filter blur-md`) and blocks pointer events (`pointer-events-none select-none`) while active.
  - Integrates with POST `/api/files/upload` to store files and retrieve URLs.

  **Key Code:**
  ```javascript
  'use client'
  import { useDropzone } from 'react-dropzone'

  export default function UploadPage() {
    const onDrop = (acceptedFiles) => {
      // Generates object previews and kicks off async thumbnail generator
    }

    const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      },
    })

    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {/* Drop zone UI */}
      </div>
    )
  }
  ```

  ---

  #### `customer/coupon/page.js`
  **Purpose:** Apply and manage discount coupons.

  **Features:**
  - Coupon code input
  - Validate and apply button
  - Show discount amount
  - List of available coupons/offers
  - Share referral code

  ---

  #### `customer/review/page.js`
  **Purpose:** Review print specifications, calculate GST breakdown, and place the print order.

  **Shows:**
  - Shop details card showing name, address, phone, and estimated wait duration
  - Itemized files list displaying custom names, configured variants (e.g. Standard layout details vs "I Want to Talk" status banner), and individual estimated costs
  - Financial summary breakdown (Subtotal, 18% GST tax, and Total Cost)

  **Actions:**
  - Submits order via POST `/api/orders/create` payload containing items array, configurations, customer details, and total amount
  - Caches returned order details to `localStorage.currentOrder` and routes to placement confirmation

  ---

  #### `customer/order-placed/page.js`
  **Purpose:** Alphanumeric order confirmation page displaying queue and ID.

  **Shows:**
  - Alphanumeric Custom Order ID (format: `MMYYP[BW|C][sequence]`)
  - Estimated print wait time (e.g., 2–7 mins based on current queue size)
  - Print order details summary and total pricing
  - Links to order history tracking `/customer/orders`

  ---

  #### `customer/orders/page.js`
  **Purpose:** Track active order statuses, manage past history, pay orders, and scratch reward coupons. Wrapped in a `<Suspense>` boundary to prevent build-time bailout warnings.

  **Features:**
  - Real-time status cards (Pending, Accepted, Printing, Ready, Completed, Cancelled).
  - **UPI ID & Payment QR Code Box**: Centered above the online/offline buttons, displays the shopkeeper's custom payment QR code image if uploaded. Clicking "Pay Online (UPI)" redirects directly to the shopkeeper's registered UPI ID link. Clicking "Pay Offline to Shopkeeper" transitions the order status to `ACCEPTED` directly in the database.
  - **Premium Scratch & Win Card Section**: Positioned directly above the payment details. Invokes `RewardCardModal` showing a Vercel-style interactive silver scratch coupon.
  - Inline button to download invoices (calls `/api/orders/:id/invoice`).
  - Delete order confirmation modal (allowed only if status is `PENDING`).
  - Ascending/descending date sorting filters and status badges.

  ---

  ---

  ## Data Models & Schema

  ### Data Architecture Overview

  PrintSmart operates a full-stack, state-synchronized database architecture:
  1. **Persistent Backend Storage:** Powered by a PostgreSQL database. Schema queries, relationship controls, and cascades are managed via Prisma ORM.
  2. **Client-Side Caching:** Utilizes `localStorage` to cache user choices, session tokens (JWT), active shop configurations, and active cart/upload state to optimize page load speeds.
  3. **URL Search Params:** Used for role-specific navigation state.

  ### LocalStorage Schema

  ```javascript
  // Authentication & Session
  localStorage.setItem('adminLoggedIn', JSON.stringify({ 
    user: 'admin', 
    loginTime: timestamp 
  }))

  localStorage.setItem('shopkeeperLoggedIn', JSON.stringify({
    shopId: '12345',
    shopName: 'ABC Printing',
    email: 'shop@abc.com',
    loginTime: timestamp,
  }))

  // Onboarding Progress
  localStorage.setItem('onboarding_step', '2') // Current step
  localStorage.setItem('onboarding_data', JSON.stringify({
    shopName: 'ABC Printing',
    address: '123 Main St',
    phone: '9876543210',
    pricingTier: 'pro',
  }))

  // Customer Session
  localStorage.setItem('customerLanguage', 'en') // 'en', 'hi', 'mr'
  localStorage.setItem('customerConfig', JSON.stringify({
    paperSize: 'A4',
    colorMode: 'BW',
    quality: 'normal',
    binding: 'left',
  }))

  // Cart / Upload Session
  localStorage.setItem('uploadCart', JSON.stringify([
    { 
      fileId: 'file_123', 
      fileName: 'document.pdf', 
      pages: 10, 
      cost: 50.00 
    },
  ]))
  ```

  ### Example API Payload (Future Backend Integration)

  ```json
  {
    "order": {
      "id": "ORD-00125",
      "customerId": "CUST-456",
      "shopkeeperId": "SK-789",
      "items": [
        {
          "fileId": "file_123",
          "fileName": "invoice.pdf",
          "pages": 5,
          "paperSize": "A4",
          "colorMode": "BW",
          "quality": "normal",
          "quantity": 1,
          "unitPrice": 10.0,
          "totalPrice": 10.0
        }
      ],
      "subtotal": 10.0,
      "tax": 1.8,
      "discount": 0.0,
      "total": 11.8,
      "status": "PENDING",
      "paymentMethod": "CARD",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

  ---

  ## API Reference

  PrintSmart's backend API endpoints are fully active and integrated. All endpoints below are fully operational and hosted on the Node.js/Express server (defaulting to port `5000` in development).

  ### Authentication Endpoints

  ```
  POST /api/auth/register
    Request: { email, phone, password, shopName, shopSlug }
    Response: { token: string, shopkeeper: Shopkeeper }

  POST /api/auth/login
    Request: { email, password }
    Response: { token: string, shopkeeper: Shopkeeper }

  POST /api/auth/google
    Request: { credential } (Google OAuth token)
    Response: { token: string, shopkeeper: Shopkeeper }
  ```

  ### Order Endpoints

  ```
  GET /api/orders/shopkeeper/all
    Headers: Authorization: Bearer <token>
    Response: Order[]

  POST /api/orders/create
    Request: { userId, shopkeeperId, customerName, phone, items: [{ fileName, fileUrl, fileSize, price, config }] }
    Response: { message: "Order(s) created successfully", orders: Order[] }

  GET /api/orders/user/:userId
    Response: Order[]

  DELETE /api/orders/:id
    Response: { message: "Order deleted successfully" } (Only allowed if status is PENDING)
  ```

  ### File Upload Endpoints

  ```
  POST /api/files/upload
    Content-Type: multipart/form-data
    Request Payload: Form field 'file' containing physical document (PDF/Image)
    Response: { message: "File uploaded successfully", fileName, fileUrl, fileKey, storageType, sizeBytes, mimeType }
  ```

  ---

  ## Implementation Details

  ### Key Modules & Their Purpose

  #### Module 1: Authentication Flow

  **Files Involved:**
  - `app/admin/page.js`
  - `app/shopkeeper/login/page.js`
  - `app/shopkeeper/register/page.js`

  **How It Works:**
  1. User navigates to `/admin` or `/shopkeeper/login`
  2. Component checks `localStorage.adminLoggedIn` or `localStorage.shopkeeperLoggedIn`
  3. If not logged in, shows login form
  4. On submit, validates credentials (currently mock; would call backend)
  5. On success, stores token/user in localStorage
  6. Redirects to dashboard page
  7. Dashboard checks auth before rendering; otherwise redirects to login

  **Why This Approach:**
  - Simple for MVP; no backend auth service needed
  - localStorage persists across browser sessions
  - Can be upgraded to JWT tokens later

  **Future Improvements:**
  - Add password encryption (bcrypt)
  - Implement JWT with refresh tokens
  - Add 2FA
  - Rate limiting on login attempts

  #### Module 2: Role-Based Routing

  **Files Involved:**
  - `app/page.js` (router)
  - `app/admin/dashboard/page.js` (admin)
  - `app/shopkeeper/dashboard/page.js` (shopkeeper)
  - `app/customer/upload/page.js` (customer)

  **How It Works:**
  1. Homepage (`/`) displays three options: Admin, Shopkeeper, Customer
  2. Each role navigates to their role-specific pages
  3. Role pages check auth status; redirect to login if not authenticated
  4. Each role has dedicated sidebar/navigation within their section

  **Why This Approach:**
  - Separates concerns by role
  - Easy to add role-specific logic
  - Secure by default (auth check before render)

  **Future Improvements:**
  - Middleware-based auth (Next.js middleware)
  - Permission-based access control (RBAC)
  - Audit logging for admin actions

  #### Module 3: File Upload (React Dropzone)

  **Files Involved:**
  - `app/customer/upload/page.js`

  **How It Works:**
  ```javascript
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.png'] },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  // In JSX:
  <div {...getRootProps()}>
    <input {...getInputProps()} />
    {/* UI */}
  </div>
  ```

  **Why React Dropzone:**
  - Lightweight (< 10KB gzipped)
  - Handles drag-and-drop and file picker
  - File validation built-in
  - Accessible (ARIA labels)

  **Workflow:**
  1. User drags file or clicks to browse
  2. `acceptedFiles` array updates
  3. Component displays preview/filename
  4. On "Upload" button, would send to backend

  **Future Improvements:**
  - Progress bar (track upload %)
  - Pause/resume capability
  - Chunk upload for large files
  - Real-time cost calculation based on page count

  #### Module 4: Shopkeeper Onboarding

  **Files Involved:**
  - `app/shopkeeper/onboarding/layout.js`
  - `app/shopkeeper/onboarding/pricing-setup/page.js`
  - `app/shopkeeper/onboarding/profile-setup/page.js`
  - `app/shopkeeper/onboarding/_components/onboardingStorage.js`

  **How It Works:**
  1. User completes registration
  2. Redirected to `/shopkeeper/onboarding/pricing-setup`
  3. Selects plan → saves to localStorage
  4. Next: `/shopkeeper/onboarding/profile-setup`
  5. Enters shop details → saves to localStorage
  6. On completion, redirected to `/shopkeeper/dashboard`

  **Why Multi-Step:**
  - Guides new users without overwhelming
  - Progressive data collection
  - Can pause and resume mid-onboarding

  **Code Example:**
  ```javascript
  // onboardingStorage.js
  export function saveOnboardingData(key, data) {
    const existing = getOnboardingData() || {}
    localStorage.setItem('onboarding_data', 
      JSON.stringify({ ...existing, [key]: data }))
  }

  export function getOnboardingProgress() {
    const data = getOnboardingData() || {}
    return Object.keys(data).length // 0-4 steps complete
  }
  ```

  **Future Improvements:**
  - Progress persistence (resume from any step)
  - Email verification step
  - Document upload (GST cert, etc.)
  - Phone verification
  - Success email confirmation

  #### Module 5: Dashboard & Reusable Components

  **Files Involved:**
  - `app/shopkeeper/dashboard/page.js`
  - `app/shopkeeper/dashboard/_components/*.js`

  **Component Architecture:**
  ```
  DashboardPage (main page)
  ├── DashboardHeader (header with profile)
  ├── WelcomeBar (greeting)
  ├── StatsRow (KPIs)
  ├── RecentOrders (table)
  └── BottomDock (navigation)
  ```

  **Why Componentized:**
  - Reusable across pages
  - Easier to test
  - Parallel development possible

  **Data Flow:**
  ```
  mockData.js (mock orders/stats)
      ↓
  DashboardPage (fetches mock data, manages state)
      ↓
  RecentOrders (receives orders as props, renders table)
      ↓
  OrderCard (receives single order, renders row)
  ```

  **Future Improvements:**
  - Real-time data from backend (WebSocket)
  - Export data to CSV/PDF
  - Customizable widgets (drag-and-drop)
  - Dark mode support

  ---

  ### Styling Strategy: Utility-First with Tailwind

  **Classes Used (Examples):**
  ```
  Layout: flex, grid, justify-between, items-center, gap-4
  Colors: bg-white, text-black, text-gray-600, border-gray-200
  Spacing: px-6, py-4, mb-8, mt-12
  Typography: text-2xl, font-bold, font-semibold
  Responsive: md:grid-cols-3, lg:px-8
  Hover: hover:bg-gray-50, hover:shadow-lg
  Effects: shadow-lg, rounded-xl, opacity-70
  ```

  **Custom Classes:**
  ```css
  .glassmorphism { /* Frosted glass effect */ }
  .wave-bg { /* Gradient background */ }
  .gradient-button { /* Brand gradient on button */ }
  .mac-dots { /* macOS-style window controls */ }
  ```

  **Why Tailwind:**
  - Rapid development
  - Consistent spacing & colors
  - No CSS bloat (unused styles removed)
  - Mobile-first responsive design

  ---

  ### State Management

  **Current Approach:**
  - React `useState` hooks for component-level state
  - `localStorage` for session persistence
  - URL params for navigation state (Next.js Link)

  **Example:**
  ```javascript
  'use client'

  import { useState } from 'react'

  export default function HomePage() {
    const [language, setLanguage] = useState('English')
    
    const handleChange = (e) => {
      setLanguage(e.target.value)
      localStorage.setItem('language', e.target.value)
    }
    
    return (
      <select value={language} onChange={handleChange}>
        <option>English</option>
        <option>Hindi</option>
      </select>
    )
  }
  ```

  **Why This Approach (for MVP):**
  - Simple and sufficient for frontend-only app
  - No external state management library needed
  - Easy to refactor to Redux/Zustand later

  **Future Improvements:**
  - Context API for global state (auth, user preferences)
  - Zustand for lightweight state management
  - React Query for server state (orders, products)
  - Redux for complex domain logic

  ---

  ---

  ## How It Works: Request/Response Flow

  ### User Flow: Shopkeeper Login to Dashboard

  ```
  1. User visits http://localhost:3000
    ↓
  2. Homepage rendered (page.js)
    - Shows "Register/Login as Shopkeeper" button
    ↓
  3. User clicks "Login as Shopkeeper"
    - Navigates to /shopkeeper/login
    ↓
  4. Login page loads (shopkeeper/login/page.js)
    - Renders email + password form
    - Checks localStorage for existing session
    ↓
  5. User enters credentials and clicks "Login"
    - Form validates inputs
    - (Mock) compares against hardcoded credentials
    - If valid: stores token in localStorage.shopkeeperLoggedIn
    ↓
  6. Page redirects to /shopkeeper/dashboard
    - Checks localStorage for auth token
    - If present: renders dashboard
    - If missing: redirects back to login
    ↓
  7. Dashboard renders (dashboard/page.js)
    - Loads DashboardHeader, WelcomeBar, StatsRow, RecentOrders
    - Fetches mock data from mockData.js
    - Displays to user
    ↓
  8. User interacts with dashboard
    - Clicks navigation items (settings, profile, orders, etc.)
    - Each navigates to new page
    - Can logout: clears localStorage, redirects to /shopkeeper/login
  ```

  ### Data Flow: Customer File Upload

  ```
  1. Customer navigates to /customer/upload
    ↓
  2. Upload page loads (customer/upload/page.js)
    - React Dropzone initialized
    - Renders drag-and-drop zone
    ↓
  3. User drags file or clicks "Browse Files"
    - File input triggered
    - Browser file picker opens
    ↓
  4. User selects file (e.g., "invoice.pdf")
    - File added to acceptedFiles array
    - Component re-renders with preview
    ↓
  5. User clicks "Add to Cart"
    - File metadata saved to localStorage.uploadCart
    - Cart item added: { fileId, fileName, pages, cost }
    ↓
  6. User clicks "Proceed to Checkout"
    - System calculates total cost
    - (Future) Sends order to backend
    - Redirects to /customer/order-placed
    ↓
  7. Order confirmation page shown
    - Order ID displayed
    - Estimated delivery date shown
    - "Track Order" button available
  ```

  ### Sequence Diagram: Admin Dashboard Access

  ```
  ┌─────────┐       ┌─────────────┐       ┌──────────────┐       ┌────────────┐
  │ Browser │       │ Next.js App │       │ LocalStorage │       │ File Sys   │
  └─────────┘       └─────────────┘       └──────────────┘       └────────────┘
      │                  │                       │                    │
      │─ GET / ─────────→│                       │                    │
      │                  │                       │                    │
      │                  │─ Check Auth? ────────→│                    │
      │                  │←─ adminLoggedIn=null ─│                    │
      │                  │                       │                    │
      │                  │─ Load page.js ───────────────────────────→│
      │                  │←─ Return JSX ─────────────────────────────│
      │←─ HTML/JS ──────│                       │                    │
      │                  │                       │                    │
      │─ Click Admin ────→│                       │                    │
      │                  │                       │                    │
      │─ GET /admin ────→│                       │                    │
      │                  │                       │                    │
      │                  │─ Render Login Form   │                    │
      │←─ Login Page ────│                       │                    │
      │                  │                       │                    │
      │─ Submit (user/pw)→│                       │                    │
      │                  │─ Validate ────────────→│                    │
      │                  │←─ Valid / Store ──────│                    │
      │                  │                       │                    │
      │─ GET /admin/dash→│                       │                    │
      │                  │─ Check Auth ─────────→│                    │
      │                  │←─ adminLoggedIn ─────│                    │
      │                  │                       │                    │
      │                  │─ Load dashboard comp─────────────────────→│
      │                  │←─ Return JSX ─────────────────────────────│
      │←─ Dashboard ────│                       │                    │
      │                  │                       │                    │
  ```

  ---

  ## Configuration

  ### Environment Variables

  PrintSmart keeps frontend and backend environment variables isolated in their respective folders.

  #### 1. Backend Variables (`backend/.env`)

  Configure these values in the server directory:
  ```bash
  PORT=5000                                   # Express port
  NODE_ENV=development                        # Run mode (development/production)
  DATABASE_URL=postgresql://...               # PostgreSQL Prisma connection string
  JWT_SECRET=supersecretjwtkey...             # Auth token secret key
  FRONTEND_URL=http://localhost:3000          # Client origin for CORS setup
  GOOGLE_CLIENT_ID=43806...                   # Google OAuth client ID

  # File Storage Configuration (AWS S3)
  AWS_ACCESS_KEY_ID=AKIA...                   # Optional AWS Access Key
  AWS_SECRET_ACCESS_KEY=...                   # Optional AWS Secret Key
  AWS_REGION=us-east-1                        # AWS region
  AWS_S3_BUCKET=printsmart-storage            # S3 bucket name

  # Local fallback directory
  UPLOAD_DIR=./uploads                        # Folder for local fallback storage
  ```

  #### 2. Frontend Variables (`frontend/.env.local`)

  Configure these values in the client directory:
  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:5000   # URL of backend Express app
  NEXT_PUBLIC_APP_NAME=PrintSmart             # Display brand name
  NEXT_PUBLIC_MAX_FILE_SIZE=52428800          # Capped file upload size (50MB in bytes)
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=43806...       # Google Sign-In client ID matching backend
  ```

  ### Environment Variable Descriptions

  | Variable | Type | Location | Purpose |
  |----------|------|----------|---------|
  | `DATABASE_URL` | string | Backend | Connection string to PostgreSQL database |
  | `JWT_SECRET` | string | Backend | Cryptographic secret used to sign and verify session JWTs |
  | `AWS_S3_BUCKET` | string | Backend | Target AWS storage bucket. If missing/invalid, fallback local disk is used |
  | `NEXT_PUBLIC_API_URL` | string | Frontend | Base URL of the backend API client routes query |
  | `NEXT_PUBLIC_MAX_FILE_SIZE` | number | Frontend | Capped file size (in bytes) validation boundary |

  ---

  ## Local Development

  ### Prerequisites
  - **Node.js**: v18.0.0+ (v20.0.0+ recommended)
  - **npm**: v9.0.0+ 
  - **PostgreSQL**: Local running instance or a managed Supabase/RDS URL
  - **AWS S3**: Bucket setup (optional - offline fallback to local `./uploads/` works by default)

  ### Comprehensive Startup Sequence

  Follow these steps to spin up the local development environment:

  ```bash
  # 1. Clone the repository and navigate to root
  git clone <repository-url>
  cd PrintSmart

  # 2. Build the Backend
  cd backend
  npm install
  cp .env.example .env
  # Edit credentials in .env (add DATABASE_URL)
  npm run prisma:migrate dev   # Creates schema tables & generates client
  npm run dev                  # Launches server on http://localhost:5000

  # 3. Build the Frontend (In a separate terminal tab)
  cd ../frontend
  npm install
  cp .env.example .env.local
  # Set NEXT_PUBLIC_API_URL to http://localhost:5000
  npm run dev                  # Launches frontend on http://localhost:3000
  ```

  ### Development Architecture & Hot Reloading

  - **Frontend Hot Module Replacement (HMR)**: The Next.js dev server automatically updates components in the browser upon saving files without resetting active client states.
  - **Backend Reloading**: Powered by `nodemon`. Any saved changes to backend routers, controllers, or services trigger an instantaneous server restart.
  - **Database Tracking**: Prisma client updates automatically on schema changes. Simply run `npx prisma db push` or `npx prisma migrate dev` in the `backend/` directory.

  ### Development Workflow

  **1. Creating a New Page:**
  ```bash
  # Create directory structure
  mkdir -p app/newfeature

  # Create page.js
  cat > app/newfeature/page.js << 'EOF'
  'use client'

  export default function NewFeaturePage() {
    return (
      <div className="min-h-screen bg-white p-6">
        <h1 className="text-3xl font-bold">New Feature</h1>
      </div>
    )
  }
  EOF

  # Navigate to http://localhost:3000/newfeature
  ```

  **2. Adding a Reusable Component:**
  ```bash
  # Create components directory (if not exists)
  mkdir -p components

  # Create component file
  cat > components/MyButton.js << 'EOF'
  'use client'

  export default function MyButton({ children, onClick }) {
    return (
      <button 
        onClick={onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {children}
      </button>
    )
  }
  EOF

  # Use in page
  import MyButton from '@/components/MyButton'
  ```

  **3. Adding Tailwind Styles:**
  ```javascript
  // Use utility classes inline
  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-500 to-purple-600">
    <p className="text-white text-lg font-semibold">Styled with Tailwind</p>
  </div>

  // Or create custom CSS class in globals.css
  .my-custom-class {
    @apply flex items-center gap-4 p-6 rounded-lg shadow-lg;
  }
  ```

  **4. Using Icons:**
  ```javascript
  import { ShoppingCart, Heart, Settings, LogOut } from 'lucide-react'

  export default function IconExample() {
    return (
      <div className="flex gap-4">
        <ShoppingCart size={24} className="text-blue-600" />
        <Heart size={24} className="text-red-600" />
        <Settings size={24} className="text-gray-600" />
        <LogOut size={24} className="text-orange-600" />
      </div>
    )
  }
  ```

  **5. Debugging:**
  ```javascript
  // Use console.log (visible in terminal where 'npm run dev' runs)
  console.log('Debug message:', data)

  // Use React DevTools (browser extension)
  // - Inspect component hierarchy
  // - View state and props
  // - Time travel through renders

  // Use browser DevTools (F12)
  // - Network tab: see requests
  // - Storage tab: view localStorage
  // - Console: JavaScript errors
  ```

  ### Common Development Issues

  | Issue | Solution |
  |-------|----------|
  | Port 3000 already in use | `lsof -i :3000` then `kill -9 <PID>` or use `-p <PORT>` |
  | Module not found | Run `npm install` again, restart server |
  | Styles not applied | Check class names, restart server, check `tailwind.config.js` |
  | Hot reload not working | Check for syntax errors, restart `npm run dev` |
  | localStorage not working | Check browser privacy settings, use DevTools Storage tab |

  ---

  ## Tests

  ### Current Testing Status

  **Note:** PrintSmart has been developed with deep integration testing between the React/Next.js frontend views and the Express server/PostgreSQL database. Recommended test suites for local unit, integration, and E2E validation are detailed below.

  ### Recommended Testing Strategy

  #### Unit Tests (Jest + React Testing Library)

  **Setup:**
  ```bash
  npm install --save-dev @testing-library/react @testing-library/jest-dom jest @babel/preset-react
  ```

  **Example Test: DashboardHeader Component**
  ```javascript
  // app/shopkeeper/dashboard/_components/__tests__/DashboardHeader.test.js

  import { render, screen } from '@testing-library/react'
  import DashboardHeader from '../DashboardHeader'

  describe('DashboardHeader', () => {
    it('renders shop name correctly', () => {
      render(<DashboardHeader shopName="ABC Printing" />)
      expect(screen.getByText('ABC Printing')).toBeInTheDocument()
    })

    it('shows notification button', () => {
      render(<DashboardHeader shopName="Test Shop" />)
      const notificationBtn = screen.getByRole('button', { name: /notifications/i })
      expect(notificationBtn).toBeInTheDocument()
    })

    it('calculates initials correctly', () => {
      const { rerender } = render(<DashboardHeader shopName="John Doe" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
      
      rerender(<DashboardHeader shopName="ABC" />)
      expect(screen.getByText('AB')).toBeInTheDocument()
    })
  })
  ```

  **jest.config.js:**
  ```javascript
  const nextJest = require('next/jest')

  const createJestConfig = nextJest({
    dir: './',
  })

  const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
  }

  module.exports = createJestConfig(customJestConfig)
  ```

  #### Integration Tests (Cypress or Playwright)

  **Example: Login Flow Test**
  ```javascript
  // e2e/shopkeeper-login.cy.js (Cypress)

  describe('Shopkeeper Login Flow', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/shopkeeper/login')
    })

    it('should display login form', () => {
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Login')
    })

    it('should login successfully with valid credentials', () => {
      cy.get('input[type="email"]').type('shop@example.com')
      cy.get('input[type="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', '/shopkeeper/dashboard')
      cy.get('h1').should('contain', 'Dashboard')
    })

    it('should show error with invalid credentials', () => {
      cy.get('input[type="email"]').type('wrong@example.com')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      cy.get('.error-message').should('contain', 'Invalid credentials')
    })
  })
  ```

  **Run Tests:**
  ```bash
  # Unit tests
  npm test

  # Integration tests (Cypress)
  npm run cypress:open

  # All tests
  npm run test:all
  ```

  ### Test Commands (to add to package.json)

  ```json
  {
    "scripts": {
      "test": "jest --watch",
      "test:ci": "jest --ci",
      "cypress:open": "cypress open",
      "cypress:run": "cypress run",
      "test:all": "npm run test:ci && npm run cypress:run"
    }
  }
  ```

  ### Coverage Goals

  - **Unit tests:** Aim for 80%+ coverage on components
  - **Integration tests:** Cover critical user journeys (login, upload, checkout)
  - **E2E tests:** Test role-based flows for each user type

  ---

  ## CI/CD and Deployment

  ### Continuous Integration (GitHub Actions)

  **Create `.github/workflows/ci.yml`:**

  ```yaml
  name: CI/CD Pipeline

  on:
    push:
      branches: [ main, develop ]
    pull_request:
      branches: [ main, develop ]

  jobs:
    lint:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm run lint
        - run: npm run build

    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm test -- --coverage

    security:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm audit --audit-level=moderate

    deploy:
      needs: [ lint, test, security ]
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm run build
        - name: Deploy to Vercel
          run: |
            npm install -g vercel
            vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
  ```

  ### Deployment Options

  #### Option 1: Vercel (Recommended for Next.js)

  **Benefits:**
  - Automatic deployments on git push
  - Built-in Next.js optimization
  - Serverless functions
  - Global CDN
  - Environment variable management

  **Setup:**
  ```bash
  # 1. Create account at vercel.com
  # 2. Connect GitHub repository
  # 3. Vercel auto-detects Next.js
  # 4. Deploy on every push to main branch

  # Command line deployment
  npm install -g vercel
  vercel --prod
  ```

  **vercel.json (optional):**
  ```json
  {
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm ci",
    "env": {
      "NEXT_PUBLIC_APP_NAME": "@example/app_name"
    },
    "regions": ["iad1"],
    "functions": {
      "api/**": {
        "maxDuration": 30
      }
    }
  }
  ```

  #### Option 2: Docker + Docker Compose

  **Dockerfile:**
  ```dockerfile
  # Build stage
  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  # Runtime stage
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY --from=builder /app/.next ./.next
  COPY --from=builder /app/public ./public

  EXPOSE 3000
  ENV NODE_ENV=production
  CMD ["npm", "start"]
  ```

  **docker-compose.yml:**
  ```yaml
  version: '3.8'
  services:
    app:
      build: .
      ports:
        - "3000:3000"
      environment:
        - NEXT_PUBLIC_APP_URL=http://localhost:3000
        - NODE_ENV=production
      restart: unless-stopped
  ```

  **Deploy with Docker:**
  ```bash
  # Build image
  docker build -t printsmart:latest .

  # Run container
  docker run -p 3000:3000 printsmart:latest

  # Or use Docker Compose
  docker-compose up -d
  ```

  #### Option 3: AWS EC2 + PM2

  **Steps:**
  ```bash
  # 1. SSH into EC2 instance
  ssh -i key.pem ubuntu@your-instance-ip

  # 2. Install Node.js
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs

  # 3. Clone repo and install
  git clone <repo-url>
  cd PrintSmart
  npm ci --only=production

  # 4. Build
  npm run build

  # 5. Install PM2 (process manager)
  npm install -g pm2

  # 6. Start with PM2
  pm2 start npm --name "printsmart" -- start

  # 7. Enable startup on reboot
  pm2 startup
  pm2 save

  # 8. Check status
  pm2 status
  pm2 logs
  ```

  **ecosystem.config.js (PM2 config):**
  ```javascript
  module.exports = {
    apps: [
      {
        name: 'printsmart',
        script: 'npm',
        args: 'start',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'production',
          PORT: 3000,
        },
      },
    ],
  };
  ```

  ### Deployment Checklist

  - [ ] All tests passing
  - [ ] Code linted and formatted
  - [ ] Environment variables set in production
  - [ ] Build size optimized (check `npm run build`)
  - [ ] Security headers configured (see next.config.js)
  - [ ] HTTPS enabled
  - [ ] Error logging enabled (Sentry, DataDog, etc.)
  - [ ] Monitoring dashboard set up
  - [ ] Backup and restore plan documented
  - [ ] Rollback procedure tested

  ---

  ## Security & Secrets

  ### Security Checklist

  | Item | Status | Implementation |
  |------|--------|-----------------|
  | **Input Validation** | ⚠️ TODO | Sanitize all user inputs; use libraries like `joi` or `zod` |
  | **HTTPS** | ⚠️ TODO | Enable SSL/TLS; redirect HTTP → HTTPS |
  | **CORS** | ⚠️ TODO | Set restrictive CORS headers if backend added |
  | **XSS Protection** | ✅ DONE | React automatically escapes JSX output |
  | **CSRF Protection** | ⚠️ TODO | Add CSRF tokens to forms if backend added |
  | **Rate Limiting** | ⚠️ TODO | Implement on backend API endpoints |
  | **Secrets Management** | ✅ PARTIAL | Use `.env.local` (git-ignored) for dev |
  | **Dependency Scanning** | ⚠️ TODO | Run `npm audit` regularly |
  | **Password Security** | ⚠️ TODO | Enforce strong password policy on backend |
  | **Session Management** | ⚠️ TODO | Add session timeout; implement refresh tokens |
  | **Logging** | ⚠️ TODO | Log auth events, errors, suspicious activity |
  | **API Keys** | ⚠️ TODO | Store server-side only; rotate regularly |

  ### Secrets Management

  #### Development

  ```bash
  # .env.local (git-ignored)
  NEXT_PUBLIC_API_URL=http://localhost:5000
  NEXT_PUBLIC_MAX_FILE_SIZE=52428800
  ```

  #### Production

  **Vercel:**
  ```bash
  vercel env add NEXT_PUBLIC_API_URL
  vercel env add INTERNAL_SECRET_KEY
  ```

  **Docker/AWS:**
  ```bash
  # Pass via environment variables
  docker run -e NEXT_PUBLIC_API_URL=https://api.example.com ...

  # Or use AWS Secrets Manager
  aws secretsmanager get-secret-value --secret-id printsmart/api-url
  ```

  **Never commit:**
  - `.env.local` or `.env` files
  - API keys, tokens, passwords
  - Private encryption keys
  - Database credentials

  ### Security Headers (in next.config.js)

  ```javascript
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'geolocation=(), microphone=(), camera=()',
        },
      ],
    },
  ],
  ```

  ### Dependency Scanning

  ```bash
  # Check for vulnerabilities
  npm audit

  # Fix automatically
  npm audit fix

  # Detailed report
  npm audit --json

  # Regular scanning (GitHub)
  # Enable "Dependabot" in repository settings
  ```

  ---

  ## Performance & Scaling

  ### Performance Optimization

  #### 1. Image Optimization
  ```javascript
  // Use Next.js Image component (automatic optimization)
  import Image from 'next/image'

  export default function Logo() {
    return (
      <Image
        src="/logo.png"
        alt="PrintSmart Logo"
        width={200}
        height={60}
        priority // For above-the-fold images
      />
    )
  }

  // Benefits:
  // - Lazy loading
  // - Responsive images
  // - Format conversion (WebP)
  // - Automatic sizing
  ```

  #### 2. Code Splitting
  ```javascript
  // Automatic in Next.js: each page is a separate bundle
  // Manual: use dynamic imports for heavy components
  import dynamic from 'next/dynamic'

  const HeavyChart = dynamic(() => import('@/components/Chart'), {
    loading: () => <p>Loading chart...</p>,
    ssr: false, // Don't render on server
  })

  export default function Dashboard() {
    return <HeavyChart />
  }
  ```

  #### 3. Caching Strategies

  **Browser Caching (next.config.js):**
  ```javascript
  headers: async () => [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600', // 1 hour
        },
      ],
    },
  ],
  ```

  **LocalStorage Caching:**
  ```javascript
  const getCachedData = (key, defaultValue) => {
    const cached = localStorage.getItem(key)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const isExpired = Date.now() - timestamp > 60 * 60 * 1000 // 1 hour
      if (!isExpired) return data
    }
    return defaultValue
  }

  const setCacheData = (key, data) => {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  }
  ```

  #### 4. Bundle Size Analysis
  ```bash
  # Analyze bundle
  npm install -g webpack-bundle-analyzer
  npm run build
  npm run analyze

  # Check production bundle
  npm run build
  du -sh .next
  ```

  #### 5. Performance Monitoring

  ```javascript
  // Next.js Web Vitals
  // pages/_app.js (if migrating to Pages Router)
  export function reportWebVitals(metric) {
    console.log(metric) // Send to analytics
    // LCP, FID, CLS, FCP, TTFB metrics
  }

  // Or use Vercel Analytics (automatic on Vercel)
  ```

  ### Scaling Strategy

  #### Frontend Scaling
  - **CDN:** Vercel, Cloudflare, AWS CloudFront
  - **Load Balancing:** Multiple app instances behind load balancer
  - **Caching:** Browser cache, CDN cache, edge caching

  #### Backend Scaling (When Added)
  - **Database:** Connection pooling, read replicas, sharding
  - **API:** Microservices, API Gateway, rate limiting
  - **Cache Layer:** Redis for sessions, frequently accessed data
  - **Message Queue:** For async tasks (email, notifications)

  #### Example: Vercel Scaling
  ```bash
  # Automatic scaling on Vercel
  # - Scales to zero when idle
  # - Scales up on traffic spikes
  # - Multiple regions deployment

  # Global deployment
  vercel --prod --regions iad1,arn1,cdg1,sin1
  ```

  ---

  ## Troubleshooting & Common Issues

  ### Issue 1: Port 3000 Already in Use

  **Symptoms:** 
  ```
  Error: listen EADDRINUSE: address already in use :::3000
  ```

  **Solutions:**
  ```bash
  # Find and kill process
  lsof -i :3000
  kill -9 <PID>

  # Or use different port
  npm run dev -- -p 3001

  # Or on Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

  ---

  ### Issue 2: Module Not Found Error

  **Symptoms:**
  ```
  Error: Module not found: Can't resolve '@/components/Button'
  ```

  **Solutions:**
  ```bash
  # 1. Check file exists
  ls app/components/Button.js  # Should exist

  # 2. Check import path
  // Correct:
  import Button from '@/app/components/Button'
  // Wrong:
  import Button from '@/components/Button'

  # 3. Restart dev server
  npm run dev

  # 4. Clear cache
  rm -rf node_modules .next
  npm install
  npm run dev
  ```

  ---

  ### Issue 3: Styles Not Applied

  **Symptoms:**
  - Tailwind classes not working
  - Custom CSS not loading

  **Solutions:**
  ```bash
  # 1. Check tailwind.config.js content paths
  module.exports = {
    content: [
      './app/**/*.{js,jsx}',  // Make sure patterns match
      './components/**/*.{js,jsx}',
    ],
  }

  # 2. Restart dev server
  npm run dev

  # 3. Clear Tailwind cache
  rm -rf .next
  npm run dev

  # 4. Check CSS import in layout.js
  import './globals.css'

  # 5. Verify Tailwind directives in globals.css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

  ---

  ### Issue 4: localStorage Undefined (SSR Issue)

  **Symptoms:**
  ```
  Error: localStorage is not defined
  ```

  **Solutions:**
  ```javascript
  // 1. Use 'use client' directive
  'use client'  // Enable client-side rendering

  // 2. Wrap in useEffect
  import { useEffect, useState } from 'react'

  export default function MyComponent() {
    const [data, setData] = useState(null)
    
    useEffect(() => {
      // This runs only on client
      const stored = localStorage.getItem('key')
      setData(stored)
    }, [])
    
    return <div>{data}</div>
  }

  // 3. Check if running in browser
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('key')
  }
  ```

  ---

  ### Issue 5: React Dropzone Not Working

  **Symptoms:**
  - Drag-and-drop not responding
  - File not being accepted

  **Solutions:**
  ```javascript
  import { useDropzone } from 'react-dropzone'

  // Correct setup:
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.png'],
    },
    maxSize: 50 * 1024 * 1024,  // 50MB
    onDrop: (files) => console.log(files),
  })

  // In JSX:
  <div {...getRootProps()}>
    <input {...getInputProps()} />
    <p>Drop files here</p>
  </div>

  // Debug:
  console.log('Accepted files:', acceptedFiles)
  console.log('Drop zone props:', getRootProps())
  ```

  ---

  ### Issue 6: Infinite Redirect Loop

  **Symptoms:**
  - `/login` → `/dashboard` → `/login` (endless loop)

  **Solutions:**
  ```javascript
  // Check auth BEFORE redirect
  export default function ProtectedPage() {
    const [isAuth, setIsAuth] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    
    useEffect(() => {
      const auth = localStorage.getItem('loggedIn')
      setIsAuth(!!auth)
      setIsLoading(false)
    }, [])
    
    if (isLoading) return <p>Loading...</p>
    if (!isAuth) return <Navigate to="/login" />  // NOT in render
    
    return <Dashboard />
  }

  // Or use middleware (Next.js 13+)
  // middleware.js in root
  import { NextResponse } from 'next/server'

  export function middleware(request) {
    const isLoggedIn = request.cookies.get('auth')
    
    if (!isLoggedIn && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
  }
  ```

  ---

  ### Issue 7: Build Fails with "Cannot find module"

  **Symptoms:**
  ```
  Error: Cannot find module 'next' or its dependencies
  ```

  **Solutions:**
  ```bash
  # 1. Reinstall dependencies
  rm -rf node_modules package-lock.json
  npm install

  # 2. Check Node version
  node --version  # Should be 18+

  # 3. Check package.json
  cat package.json  # Verify 'next' is listed

  # 4. Run build with verbose output
  npm run build -- --debug

  # 5. Clear npm cache
  npm cache clean --force
  npm install
  ```

  ---

  ### Issue 8: Hot Reload Not Working

  **Symptoms:**
  - File changes don't reflect in browser
  - Need to manually refresh

  **Solutions:**
  ```bash
  # 1. Restart dev server
  npm run dev

  # 2. Check for syntax errors (blocks HMR)
  # - Look at terminal for error messages
  # - Fix any syntax issues

  # 3. Clear Next.js cache
  rm -rf .next

  # 4. Disable browser cache
  # - Open DevTools (F12)
  # - Settings → Disable cache (while DevTools open)

  # 5. Check file watchdog (on macOS/Linux)
  ulimit -n  # Should be > 256
  ```

  ---

  ### Issue 9: CORS Error (When Backend Added)

  **Symptoms:**
  ```
  Access to XMLHttpRequest blocked by CORS policy
  ```

  **Solutions:**
  ```javascript
  // On backend (Node.js/Express):
  const cors = require('cors')

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }))

  // On frontend (if needed):
  const response = await fetch('https://api.example.com/data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // For cookies
  })
  ```

  ---

  ### Issue 10: Out of Memory During Build

  **Symptoms:**
  ```
  JavaScript heap out of memory
  ```

  **Solutions:**
  ```bash
  # Increase Node memory limit
  NODE_OPTIONS=--max-old-space-size=4096 npm run build

  # Or add to package.json scripts
  "build": "NODE_OPTIONS=--max-old-space-size=4096 next build"

  # Check what's consuming memory
  npm run build -- --debug --profile
  ```

  ---

  ### Issue 11: Vercel Deployment Fails

  **Symptoms:**
  ```
  Deployment failed: Build error
  ```

  **Solutions:**
  ```bash
  # 1. Test production build locally
  npm run build
  npm start

  # 2. Check build logs on Vercel dashboard
  # - View detailed error message

  # 3. Verify environment variables
  vercel env list

  # 4. Check Node version
  # - In vercel.json or project settings

  # 5. Clear Vercel cache
  vercel env pull  # Sync env vars
  vercel redeploy  # Retry deployment
  ```

  ---

  ### Issue 12: Database Connection Error (Future)

  **Symptoms:**
  ```
  Error: connect ECONNREFUSED 127.0.0.1:5432
  ```

  **Solutions (when backend added):**
  ```bash
  # 1. Check database is running
  psql -U postgres -l

  # 2. Verify DATABASE_URL
  echo $DATABASE_URL

  # 3. Test connection
  psql $DATABASE_URL

  # 4. Check credentials
  # - User: postgres
  # - Password: (from .env)
  # - Host: localhost
  # - Port: 5432
  # - Database: printsmart
  ```

  ---

  ## Migration / Upgrade Notes

  ### From Next.js App Router to Pages Router (If Needed)

  **Differences:**
  | Feature | App Router | Pages Router |
  |---------|-----------|-------------|
  | Directory | `app/` | `pages/` |
  | Routing | File-based (dynamic folders) | File-based (simpler) |
  | Default Export | Component | Not needed |
  | Metadata | `metadata` export | `Head` component |
  | Data Fetching | `async` components | `getServerSideProps` |
  | Middleware | `middleware.js` | `_middleware.js` |

  **Migration Path:**
  1. Create `pages/` directory alongside `app/`
  2. Copy pages and convert to Pages Router format
  3. Test thoroughly
  4. Delete `app/` directory
  5. Update imports

  ---

  ### Upgrading Dependencies

  **Safe Upgrade (Patch):**
  ```bash
  npm update  # Updates within current major version
  ```

  **Feature Upgrade (Minor):**
  ```bash
  npm install react@18.4.0  # Test thoroughly
  ```

  **Major Upgrade:**
  ```bash
  npm install next@15.0.0  # Read changelog; potential breaking changes
  npm test
  npm run build
  ```

  ---

  ### Database Integration (When Ready)

  **Add Prisma ORM:**
  ```bash
  npm install @prisma/client
  npm install -D prisma

  npx prisma init
  # Creates: prisma/schema.prisma, .env.local
  ```

  **Example schema.prisma:**
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }

  model Shop {
    id    Int     @id @default(autoincrement())
    name  String
    email String  @unique
    phone String
    createdAt DateTime @default(now())
    orders Order[]
  }

  model Order {
    id    Int     @id @default(autoincrement())
    shopId Int
    shop  Shop    @relation(fields: [shopId], references: [id])
    total Float
    status String @default("PENDING")
    createdAt DateTime @default(now())
  }
  ```

  **Setup:**
  ```bash
  npx prisma db push  # Sync schema to database
  npx prisma studio  # GUI for data management
  ```

  ---

  ## Changelog

  ### Version Format
  ```
  vMAJOR.MINOR.PATCH

  Major: Breaking changes
  Minor: New features (backwards compatible)
  Patch: Bug fixes
  ```

  ### Template Entry

  ```markdown
  ## [1.0.0] - 2024-01-15

  ### Added
  - Shopkeeper dashboard with KPI stats
  - Customer file upload with React Dropzone
  - Admin panel for system overview

  ### Changed
  - Improved responsive design for mobile

  ### Fixed
  - Fixed localStorage not persisting auth
  - Fixed Tailwind styles not applying in production

  ### Removed
  - Removed deprecated Login component

  ### Security
  - Added input sanitization
  - Enabled HTTPS in production
  ```

  ### Example Changelog

  ```markdown
  # Changelog

  All notable changes to PrintSmart are documented in this file.

  ## [1.0.0] - 2024-01-15 (Initial Release)

  ### Added
  - Complete admin dashboard
  - Shopkeeper onboarding flow
  - Customer upload interface
  - Language selection
  - Order tracking pages
  - Settings and support pages
  - Responsive design (mobile-first)
  - Glassmorphism UI components

  ### Infrastructure
  - Next.js 14 App Router
  - Tailwind CSS for styling
  - Lucide React icons
  - React Dropzone for file uploads
  - localStorage for session management

  ### Known Issues
  - No backend API integration yet
  - Mock data only
  - localStorage limited to browser

  ## [3.2.2] - 2026-06-20

  ### Added
  - Complete documentation for missing backend files: controllers (`payment.controller.js`, `ai.controller.js`), routes (`payment.routes.js`, `ai.routes.js`), and services (`csv.service.js`).
  - Prisma database schema definitions for new models (`PaymentLog`, `AIAsset`, `AIUsage`, `RewardLog`, `UserSession`, `SystemSettings`).
  - Core system workflows explaining payment verification, AI Marketing Studio (Gemini 3.5 Flash / custom keys), scratch card rewards, and 2-PC concurrent session limits.
  - Complete API reference tables for the Payment Log & Verification API, conversational AI design generation (`/api/ai/chat-generate`), and platform settings/diagnostics endpoints.

  ## [3.2.1] - 2026-06-07

  ### Fixed
  - Fixed order placement server-side crash (500 Error) caused by PDFKit winansi encoding errors when rendering the Rupee symbol `₹` using standard Helvetica; replaced with `Rs.`.
  - Fixed duplicate key database conflicts on `orderId` unique constraint by querying the latest monthly order file to resolve sequence baseline instead of using `count()`, making sequence generation robust against file/order deletions.
  - Fixed customer success screen redirection issue where orders placed via normal checkout resulted in a "No active order found." error page; added the missing `currentOrder` localStorage item write on order placement completion.

  ## [3.1.0] - 2026-06-05

  ### Added
  - **Full-Screen Upload Loading State**: Premium glassmorphic backdrop loader with backdrop-blur and pointer lock on `/customer/upload`. Status texts rotate dynamically every 2.5 seconds.
  - **UPI & Payment QR Code System**: Mandatory UPI ID field and optional QR image uploads in shopkeeper onboarding and profile edit options. Dynamic QR image rendering on customer orders page.
  - **Google Pay Scratch & Win Cards**: Customer side scratch coupon modals featuring silver texture canvas scratching, touch-coordinates sparkle effects, scale feedback, and 30% scratched auto-reveal.
  - **Suspense Boundaries**: Wrapped customer upload and order tracking pages in React `<Suspense>` to prevent Next.js static build bailout warnings.

  ## [3.0.0] - 2026-05-31

  ### Added
  - Complete Express and Node.js backend integration with PostgreSQL database using Prisma ORM.
  - Programmatic fallback storage: physical files automatically write to AWS S3 bucket, with robust local disk uploads fallback.
  - Advanced authentication features: Google OAuth login support, and strict 2-PC concurrent session limit with oldest token rolling logout.
  - Seeding & testing shortcuts: default `smart-print-hub` register seeds and `0000` test bypass code mapping.
  - Custom Order ID sequencer (`MMYYP[BW|C][sequence]`) and queue position/estimated wait time algorithm.
  - PDFKit professional invoice layout generator streaming itemized bills with multi-column tables.
  - Batch multi-file uploading support with individual sequential print ID generation.
  - Responsive, premium multi-step frontend interfaces for Customer flow (Language, Upload, Config, Review, Order Placed, My Orders).
  - Global translations across both frontend customer steps and shopkeeper dashboard interfaces.
  ```

  ---

  ## Appendix

  ### Useful Commands Reference

  ```bash
  # Development
  npm run dev                 # Start dev server
  npm run build              # Build for production
  npm start                  # Run production build
  npm run lint               # Lint code
  node test-s3.js            # Run S3 configuration connectivity test (in backend/)

  # Dependency Management
  npm install               # Install all dependencies
  npm update                # Update to latest patch version
  npm audit                 # Check for vulnerabilities
  npm audit fix             # Fix vulnerabilities

  # Cleaning
  rm -rf .next node_modules # Clean build and deps
  npm cache clean --force   # Clear npm cache

  # Git
  git clone <url>           # Clone repo
  git add .                 # Stage changes
  git commit -m "message"   # Commit
  git push origin main      # Push to main

  # Docker
  docker build -t printsmart . # Build image
  docker run -p 3000:3000 printsmart # Run container
  docker-compose up         # Run with compose

  # Deployment
  vercel --prod             # Deploy to Vercel
  npm run build && npm start # Local production
  ```

  ---

  ### Sample .env.example

  ```bash
  # Application
  NEXT_PUBLIC_APP_NAME=PrintSmart
  NEXT_PUBLIC_APP_URL=http://localhost:3000

  # Features
  NEXT_PUBLIC_ENABLE_ANALYTICS=false
  NEXT_PUBLIC_MAX_FILE_SIZE=52428800

  # (Future) API
  # NEXT_PUBLIC_API_URL=http://localhost:5000/api
  # NEXT_PUBLIC_API_KEY=sk_test_xxxx

  # (Future) Payment
  # STRIPE_PUBLIC_KEY=pk_test_xxxx

  # (Future) Database
  # DATABASE_URL=postgresql://user:password@localhost:5432/printsmart

  # (Future) Email
  # SENDGRID_API_KEY=SG_xxxx

  # (Future) Storage
  # AWS_S3_BUCKET=printsmart-uploads
  # AWS_REGION=us-east-1
  # AWS_ACCESS_KEY_ID=xxxxx
  # AWS_SECRET_ACCESS_KEY=xxxxx
  ```

  ---

  ### Sample API Requests (When Backend Ready)

  **Login Request (cURL):**
  ```bash
  curl -X POST http://localhost:5000/api/shopkeeper/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "shop@example.com",
      "password": "password123"
    }'
  ```

  **Login Response:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "sk_123",
      "shopName": "ABC Printing",
      "email": "shop@example.com",
      "phone": "9876543210"
    }
  }
  ```

  **Create Order Request:**
  ```bash
  curl -X POST http://localhost:5000/api/orders \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -d '{
      "customerId": "cust_456",
      "items": [
        {
          "fileName": "invoice.pdf",
          "pages": 5,
          "colorMode": "BW",
          "quantity": 1,
          "unitPrice": 10.0
        }
      ],
      "total": 11.8
    }'
  ```

  **Get Orders Request:**
  ```bash
  curl -X GET "http://localhost:5000/api/orders?status=PENDING&limit=10" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```

  ---

  ### Docker Commands

  ```bash
  # Build image
  docker build -t printsmart:1.0.0 .

  # Run container
  docker run -p 3000:3000 -e NODE_ENV=production printsmart:1.0.0

  # View logs
  docker logs <container_id>

  # Stop container
  docker stop <container_id>

  # Docker Compose
  docker-compose up -d      # Start in background
  docker-compose logs -f    # Follow logs
  docker-compose down       # Stop and remove
  docker-compose restart    # Restart services

  # Tagging and pushing to registry
  docker tag printsmart:1.0.0 myregistry/printsmart:1.0.0
  docker push myregistry/printsmart:1.0.0
  ```

  ---

  ### Rollback Procedures

  #### Vercel Rollback
  ```bash
  # View deployment history
  vercel list

  # Rollback to previous deployment
  vercel rollback <deployment-url>
  ```

  #### Docker Rollback
  ```bash
  # Tag previous image as current
  docker tag printsmart:0.9.9 printsmart:latest

  # Restart container
  docker-compose down
  docker-compose up -d
  ```

  #### Database Rollback (Future)
  ```bash
  # Prisma migration rollback
  npx prisma migrate resolve --rolled-back 20240115_initial
  npx prisma migrate deploy

  # PostgreSQL backup restore
  psql printsmart < backup_2024-01-14.sql
  ```

  ---

  ### Backup Procedures

  #### Backup Strategy
  - **Frontend:** Version in Git; deploy via Vercel/Docker
  - **Database:** Daily backups to AWS S3 / Automated snapshots
  - **Secrets:** Stored in hosting platform (Vercel Env, AWS Secrets Manager)

  #### Local Backup
  ```bash
  # Backup .env and database exports
  mkdir backups
  cp .env.local backups/env_backup_$(date +%Y%m%d).txt
  pg_dump printsmart > backups/db_backup_$(date +%Y%m%d).sql
  tar -czf backups/app_backup_$(date +%Y%m%d).tar.gz app/
  ```

  ---

  ### Database Migration Example (Prisma)

  ```bash
  # Create migration
  npx prisma migrate dev --name add_order_status

  # Apply migration
  npx prisma migrate deploy

  # View migration status
  npx prisma migrate status

  # Rollback (development only)
  npx prisma migrate resolve --rolled-back add_order_status
  ```

  ---

  ### Performance Optimization Checklist

  ```
  Web Vitals Target:
  [ ] LCP (Largest Contentful Paint): < 2.5s
  [ ] FID (First Input Delay): < 100ms
  [ ] CLS (Cumulative Layout Shift): < 0.1

  Bundle Size:
  [ ] Main bundle: < 200KB
  [ ] Gzip: < 70KB
  [ ] Images optimized
  [ ] Code splitting applied

  Caching:
  [ ] Browser cache configured
  [ ] CDN enabled
  [ ] LocalStorage used for session
  [ ] ETag headers set

  Monitoring:
  [ ] Analytics integrated
  [ ] Error tracking (Sentry)
  [ ] Performance monitoring
  [ ] Alert thresholds set
  ```

  ---

  ### Feature Flags & A/B Testing

  ```javascript
  // config/features.js
  export const features = {
    DARK_MODE: process.env.NEXT_PUBLIC_DARK_MODE === 'true',
    PAYMENT_GATEWAY: process.env.NEXT_PUBLIC_PAYMENT === 'true',
    ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS === 'true',
  }

  // Usage
  import { features } from '@/config/features'

  export default function Dashboard() {
    return (
      <>
        <MainDashboard />
        {features.DARK_MODE && <DarkModeToggle />}
        {features.PAYMENT_GATEWAY && <PaymentSection />}
      </>
    )
  }
  ```

  ---

  ## How to Get Help

  ### Reporting Issues

  **Create GitHub Issue:**
  1. Go to repository → Issues
  2. Click "New Issue"
  3. Provide:
    - Clear title
    - Steps to reproduce
    - Expected vs actual behavior
    - Screenshots/logs
    - Your environment (OS, Node version, etc.)

  **Example:**
  ```markdown
  ## Title: Login button not working on mobile

  ### Environment
  - OS: iOS 15
  - Browser: Safari
  - Node: 18.17.0

  ### Steps to Reproduce
  1. Open app on iPhone
  2. Click "Login as Shopkeeper"
  3. Enter credentials
  4. Click "Login" button
  5. **Button doesn't respond**

  ### Expected
  - Should login and redirect to dashboard

  ### Actual
  - Button click has no effect

  ### Screenshots
  [Attach if possible]
  ```

  ---

  ### Debug Session

  ```javascript
  // Enable debug logging
  localStorage.setItem('DEBUG', 'true')

  // Check console for debug messages
  if (localStorage.getItem('DEBUG')) {
    console.log('[DEBUG]', 'Auth state:', localStorage.getItem('adminLoggedIn'))
  }

  // Check state in React DevTools
  // 1. Install React Developer Tools (browser extension)
  // 2. Open DevTools → Components tab
  // 3. Inspect component props and state

  // Check performance
  // 1. DevTools → Performance tab
  // 2. Click "Record"
  // 3. Interact with app
  // 4. Stop recording
  // 5. Analyze flame charts
  ```

  ---

  ### Contacting Maintainers

  - **Email:** support@printsmart.com
  - **GitHub Issues:** [github.com/printsmart/issues](https://github.com)
  - **Slack Channel:** #printsmart-dev
  - **Discord Server:** [discord.gg/printsmart](https://discord.gg)

  ---

  ### Documentation Resources

  - [Next.js Documentation](https://nextjs.org/docs)
  - [React Documentation](https://react.dev)
  - [Tailwind CSS Documentation](https://tailwindcss.com/docs)
  - [Lucide React Icons](https://lucide.dev)
  - [React Dropzone](https://react-dropzone.js.org)

  ---

  ## Backend Architecture

  The backend of PrintSmart is built using a modern Node.js and Express.js stack, integrated with PostgreSQL using Prisma ORM.

  ### Tech Stack
  - **Server Framework**: Node.js & Express.js
  - **Database Engine**: PostgreSQL
  - **Object-Relational Mapping (ORM)**: Prisma ORM (Prisma Client JS client generator)
  - **File Storage**: AWS S3 Bucket (cloud service) with a robust local fallback mechanism using `Express.static` to serve files from the local directory (`/uploads/`) during offline or local development.
  - **Document Generation**: PDFKit for server-side generation of professional, itemized PDF invoices.
  - **Utilities**: `qrcode` (for QR code generation), `bcryptjs` (for password hashing), `jsonwebtoken` (for authentication), and `multer` (for handling multipart file uploads).

  ### File Storage & S3 Fallback Architecture
  For managing documents in a scalable SaaS structure, PrintSmart integrates **AWS S3 Bucket** cloud storage.
  - **Phase 1 Implementation:** Customer-uploaded files are uploaded to AWS S3. Unrelated resources (QR codes, invoices, shop logos, thumbnails) remain stored locally.
  - **Scalable SaaS Key Structure:** Uploaded documents are saved under a key structured as: `orders/{orderId}/{uuid_filename}.ext` (or `orders/temp/{uuid_filename}.ext` during initial upload before order placement).
  - **Graceful Local Fallback:** The backend checks for AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_S3_BUCKET`). If these keys are missing or S3 upload fails, the files are automatically written to the local fallback directory `backend/uploads/orders/` and served statically.
  - **File Type & Security Validation:** The file controller actively validates uploaded files:
    - **Allowed Formats:** `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png` (mimetypes verified).
    - **Explicit Blocklist:** Executable extensions (like `.exe`, `.bat`, `.apk`, `.sh`) are rejected with 400 Bad Request to prevent security vulnerabilities.
    - **Size Limit:** Max file upload size is capped at 50MB.
  - **S3 Connectivity Verification Script:** Developers can verify the configured S3 credentials and connectivity by executing `node test-s3.js` from the `backend/` directory. The script attempts to upload a test string to `test-folder/test.txt` and logs the resulting S3 URL.

  ### Programmatic DB Push and Generation
  On server startup (`server.js`), programmatic schema synchronization and client generation (`npx prisma db push` and `npx prisma generate`) are **disabled by default (commented out)**.
  - **Rationale**: Programmatic CLI processes run on every boot trigger unexpected file locks on `query_engine-windows.dll.node` (leading to `EPERM` operation not permitted errors) and duplicate connection streams on the pooler.
  - **Production Practice**: Run schema migrations and client generations as manual or decoupled build/deployment steps:
    ```bash
    npx prisma generate
    npx prisma db push --accept-data-loss
    ```
  Additionally, a startup seed script auto-registers a default shopkeeper if the database is empty:
  - **Default Email**: `defaultshop@printsmart.com`
  - **Default Password**: `password123`
  - **Default Shop Slug / ID**: `smart-print-hub`

  ### Dual-Stack DNS Resolution & IPv6 / NAT64 Workaround
  In environments where local networks resolve dual-stack domains (like Supabase's `aws-1-ap-southeast-2.pooler.supabase.com`) to synthesized IPv6/NAT64 addresses (e.g. `64:ff9b::...` Well-Known Prefix) but lack a functional NAT64 routing gateway, connections to the database can fail or time out (Prisma error `P1001: Can't reach database server`).

  - **Workaround (Connection Parameter)**: Specifying the `hostaddr` query parameter in the `DATABASE_URL` bypasses DNS translation entirely by pointing directly to the verified IPv4 pooler IP, while retaining the hostname for TLS SNI certificate validation:
    ```bash
    DATABASE_URL="postgresql://[USER]:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?hostaddr=52.65.247.42"
    ```
  - **Prisma Client vs Prisma CLI**: 
    - The **Prisma Client** query engine supports standard connection variables including `hostaddr`.
    - The **Prisma CLI** (`db push`/`migrate`) uses a Rust engine that ignores `hostaddr` and resolves via DNS. Running migrations in these dual-stack environments should be performed by verifying direct IPv4 resolution or utilizing direct IPv4 connection strings with `?sslaccept=accept_invalid_certs` bypass parameters.


  ### Directory Structure
  ```
  backend/
  ├── server.js                 # Express server initialization, DB syncing, and startup seeding
  ├── test-s3.js                # S3 configuration and upload connectivity testing utility
  ├── config/
  │   └── db.js                 # Prisma Client instance instantiation
  ├── prisma/
  │   └── schema.prisma         # Prisma Schema containing PostgreSQL models, relations, and enums
  ├── middleware/
  │   └── auth.middleware.js    # JWT verification middleware protecting shopkeeper operations
  ├── services/
  │   ├── storage.service.js    # Cloud S3 or Local disk file upload/delete abstraction layer
  │   ├── qr.service.js         # Shopkeeper UUID QR code generator (`/take-a-print?shopId=UUID`)
  │   ├── qrcode.service.js     # Shopkeeper slug QR code and base64 Data URL generators
  │   ├── order.service.js      # Custom Order ID sequencer, wait-time estimator, and statistics updater
  │   ├── invoice.service.js    # PDFKit-based PDF invoice layout generator
  │   ├── seed.service.js       # Default shopkeeper database seeding service
  │   ├── session.service.js    # Database-backed concurrent session tracker and 2-PC limit controller
  │   └── csv.service.js        # In-memory CSV cache parser for scratch cards content fallback [NEW]
  ├── controllers/
  │   ├── auth.controller.js    # Shopkeeper registration, login, profile adjustments, and QR endpoints
  │   ├── file.controller.js    # Multer-to-Storage upload broker
  │   ├── user.controller.js    # Customer user onboarding and profile fetches
  │   ├── order.controller.js   # Order placements, fetching, status modifications, and invoice downloads
  │   ├── queue.controller.js   # Active queue tracking and status updates
  │   ├── statistics.controller.js # Daily, weekly, monthly, and overall shopkeeper statistics analytics
  │   ├── feedback.controller.js   # Feedback submissions, query listing, and status updates
  │   ├── ai.controller.js         # AI Poster Studio generation and prompt suggestion [NEW]
  │   ├── payment.controller.js    # UPI/Cash payment transaction reference checks [NEW]
  │   └── reward.controller.js     # Instant customer scratch cards controller [NEW]
  └── routes/
      ├── auth.routes.js        # Auth-related routing endpoints
      ├── file.routes.js        # File uploading route broker
      ├── order.routes.js       # Customer and shopkeeper order endpoints
      ├── queue.routes.js       # Client and provider queue endpoints
      ├── feedback.routes.js    # Customer issues and feedback endpoints
      ├── statistics.routes.js  # Analytics endpoints for shop statistics
      ├── user.routes.js        # Customer creation/update routing
      ├── shopkeeper.routes.js  # Public slug routing and protected shopkeeper utilities
      ├── ai.routes.js          # AI Poster Studio endpoints [NEW]
      ├── payment.routes.js     # UPI/Cash payment verification endpoints [NEW]
      └── reward.routes.js      # Customer scratch cards logs and stats [NEW]
  ```

  ---

  ## Database Architecture

  We utilize a PostgreSQL database managed via **Prisma ORM**. It handles multi-user relational structures with indexes, data integrity rules, and cascades.

  ### Entity Relationship Diagram (ERD)
  ```mermaid
  erDiagram
      User ||--o{ Order : "places"
      User ||--o{ Feedback : "submits"
      Shopkeeper ||--o{ Order : "receives"
      Shopkeeper ||--o| ShopkeeperStatistics : "has"
      Order ||--|{ OrderFile : "contains"
      Order ||--|| PrintConfiguration : "defines"
      Order ||--o| Queue : "tracks"
      Order ||--o| Invoice : "issues"
  ```

  ### Models & Schema Definition

  #### 1. Enums
  - **`OrderStatus`**: `PENDING`, `ACCEPTED`, `PRINTING`, `COMPLETED`, `CANCELLED` (Triggers status updates across related order queues).
  - **`QueueStatus`**: `WAITING`, `PRINTING`, `DONE` (Controls queue positions and active lists).
  - **`PrintType`**: `BW`, `COLOR` (Used for custom pricing configurations).
  - **`PaperSize`**: `A4`, `A3`, `A5`, `LEGAL`, `LETTER`, `EXECUTIVE`, `LEDGER`, `TABLOID` (Valid print sizing options).
  - **`PrintQuality`**: `DRAFT`, `NORMAL`, `HIGH` (Influences printing durations and costs).
  - **`Orientation`**: `PORTRAIT`, `LANDSCAPE`
  - **`PrintSide`**: `SINGLE`, `DOUBLE` (Influences print duration calculations).
  - **`Language`**: `ENGLISH`, `HINDI`, `MARATHI`, `GUJARATI`, `OTHER` (User preferred language interface preference).

  #### 2. User (Customers)
  Tracks customers placing orders.
  - `id` (String - UUID, Primary Key)
  - `email` (String, Unique)
  - `name` (String, Optional)
  - `phone` (String, Optional)
  - `language` (Language, Default: `ENGLISH`)
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([email])`

  #### 3. Shopkeeper (Printers)
  Tracks printing shops.
  - `id` (String - UUID, Primary Key)
  - `email` (String, Unique)
  - `password` (String, Hashed)
  - `phone` (String)
  - `shopkeeperIdCode` (String, Unique, Optional) - Standard identifier slug (e.g. `smart-print-hub`)
  - `shopName` (String)
  - `ownerName` (String, Optional)
  - `shopSlug` (String, Unique) - Human-readable URL identifier slug
  - `address` (String, Optional)
  - `category` (String, Default: "Printing & Photocopy")
  - `subCategory` (String, Default: "Xerox & Digital Prints")
  - `languagePref` (String, Default: "English")
  - `gstNumber` (String, Optional)
  - `socials` (Json) - Handles dynamic social networks
  - `pricing` (Json) - Holds printing rates (e.g., `bwA4`, `colorA4`, `bwDoubleSide`)
  - `logoUrl` (String, Optional)
  - `qrCode` (String, Unique, Optional)
  - `qrCodeUrl` (String, Optional)
  - `qrValue` (String, Optional)
  - `qrGeneratedAt` (DateTime, Optional)
  - `totalOrders` (Int, Default: `0`)
  - `totalEarnings` (Float, Default: `0.0`)
  - `activeSubscribers` (Int, Default: `0`)
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([email])`, `@@index([shopSlug])`

  #### 4. Order
  Combines user items, pricing math, configuration link, and statuses.
  - `id` (String - UUID, Primary Key)
  - `orderId` (String, Unique) - Sequential alphanumeric custom ID: `MMYYP[BW|C][sequence]`
  - `userId` (String - UUID, Foreign Key, Optional) - Links to `User.id` (on delete `SetNull`)
  - `shopkeeperId` (String - UUID, Foreign Key) - Links to `Shopkeeper.id` (on delete `Cascade`)
  - `customerName` (String, Default: "Anonymous")
  - `phone` (String, Optional)
  - `price` (Float, Default: `0`) - Subtotal + Tax - Discount
  - `subtotal` (Float, Default: `0`)
  - `tax` (Float, Default: `0`) - Calculated 18% GST amount
  - `discount` (Float, Default: `0`)
  - `totalAmount` (Float, Default: `0`)
  - `status` (OrderStatus, Default: `PENDING`)
  - `estimatedTime` (Int, Default: `5`) - Print wait duration in minutes
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([shopkeeperId])`, `@@index([userId])`, `@@index([status])`, `@@index([createdAt])`

  #### 5. OrderFile
  Holds records for individual document files uploaded as part of an order.
  - `id` (String - UUID, Primary Key)
  - `orderId` (String - UUID, Foreign Key) - Links to `Order.id` (on delete `Cascade`)
  - `originalFileName` (String)
  - `customFileName` (String, Optional)
  - `fileUrl` (String) - Direct download path or S3 bucket URL
  - `thumbnailUrl` (String, Optional) - Base64 thumbnail string or URL path
  - `fileSize` (Int) - Bytes size
  - `createdAt` (DateTime)
  - *Indexes*: `@@index([orderId])`

  #### 6. PrintConfiguration
  Describes specific configurations of print layout, sizing, side, and quality.
  - `id` (String - UUID, Primary Key)
  - `orderId` (String - UUID, Unique Foreign Key) - Links to `Order.id` (on delete `Cascade`)
  - `printType` (PrintType, Default: `BW`)
  - `copies` (Int, Default: `1`)
  - `paperSize` (PaperSize, Default: `A4`)
  - `sides` (PrintSide, Default: `SINGLE`)
  - `orientation` (Orientation, Default: `PORTRAIT`)
  - `quality` (PrintQuality, Default: `NORMAL`)
  - `pageRange` (String, Optional, Default: `"all"`)
  - `createdAt` / `updatedAt` (DateTime)

  #### 7. Queue
  Manages real-time positions for active orders.
  - `id` (String - UUID, Primary Key)
  - `orderId` (String - UUID, Unique Foreign Key) - Links to `Order.id` (on delete `Cascade`)
  - `position` (Int) - Position number in line
  - `status` (QueueStatus, Default: `WAITING`)
  - `estimatedWaitTime` (Int, Default: `5`)
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([status])`, `@@index([position])`

  #### 8. Invoice
  Contains generated financial layout reference numbers and PDF paths.
  - `id` (String - UUID, Primary Key)
  - `orderId` (String - UUID, Unique Foreign Key) - Links to `Order.id` (on delete `Cascade`)
  - `invoiceNumber` (String, Unique) - Alphanumeric format `INV-MMDDYY[sequence]`
  - `pdfUrl` (String, Optional) - Static download directory relative path
  - `subtotal` / `tax` / `discount` / `totalAmount` (Float)
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([invoiceNumber])`

  #### 9. Feedback
  Tracks client complaints and feedback forms.
  - `id` (String - UUID, Primary Key)
  - `userId` (String - UUID, Foreign Key) - Links to `User.id` (on delete `Cascade`)
  - `subject` (String)
  - `message` (String)
  - `rating` (Int, Optional) - 1 to 5 numeric stars
  - `attachmentUrl` (String, Optional)
  - `status` (String, Default: `"OPEN"`) - `OPEN`, `IN_PROGRESS`, `RESOLVED`
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([userId])`, `@@index([status])`

  #### 10. ShopkeeperStatistics
  Tracks ongoing performance metrics for a specific shop.
  - `id` (String - UUID, Primary Key)
  - `shopkeeperId` (String - UUID, Unique Foreign Key) - Links to `Shopkeeper.id` (on delete `Cascade`)
  - `todayOrders` (Int, Default: `0`)
  - `todayEarnings` (Float, Default: `0`)
  - `todayBWPrints` (Int, Default: `0`)
  - `todayColorPrints` (Int, Default: `0`)
  - `weeklyGrowth` (Float, Default: `0`)
  - `monthlyRevenue` (Float, Default: `0`)
  - `topPaperSize` (String, Default: `"A4"`)
  - `printTypeDistribution` (Json, Optional) - e.g. `{ "BW": 10, "COLOR": 5 }`
  - `totalOrders` (Int, Default: `0`)
  - `totalCopies` (Int, Default: `0`)
  - `totalEarnings` (Float, Default: `0`)
  - `avgOrderValue` (Float, Default: `0`)
  - `lastUpdated` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([shopkeeperId])`

  #### 11. AIAsset
  Holds details of generated designs for shopkeepers in the AI Poster Studio.
  - `id` (String - UUID, Primary Key)
  - `shopkeeperId` (String - UUID, Foreign Key) - Links to `Shopkeeper.id` (on delete `Cascade`)
  - `title` (String) - Promotional title of the design
  - `prompt` (String) - Optimized prompt used to generate the image
  - `type` (String) - Design asset type (e.g. Poster, Banner)
  - `generatedImageUrl` (String) - CDN or storage URL of the generated image
  - `thumbnailUrl` (String, Optional) - Thumbnail image URL
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([shopkeeperId])`

  #### 12. AIUsage
  Tracks usage statistics for AI features generated by shopkeepers.
  - `id` (String - UUID, Primary Key)
  - `shopkeeperId` (String - UUID, Foreign Key)
  - `featureType` (String) - AI feature type (e.g. `SUGGEST_PROMPT`, `GENERATE`, `REGENERATE`)
  - `generationCount` (Int, Default: `1`) - Number of generations executed
  - `createdAt` (DateTime)
  - *Indexes*: `@@index([shopkeeperId])`

  #### 13. RewardLog
  Tracks customer scratch loyalty card states and details linked to orders.
  - `id` (String - UUID, Primary Key)
  - `orderId` (String - UUID, Unique Foreign Key) - Links to `Order.id` (on delete `Cascade`)
  - `shopId` (String - UUID, Foreign Key)
  - `rewardType` (String) - Code for the award (e.g. `FREE_PRINT`, `HALF_PRICE_COLOR`, `ASTROLOGY`, `DID_YOU_KNOW`)
  - `rewardCategory` (String) - Category of reward (e.g. `MONETARY`, `NON_MONETARY`)
  - `scratched` (Boolean, Default: `false`) - Whether card has been scratched by user
  - `applied` (Boolean, Default: `false`) - Whether monetary reward is applied to the order total
  - `rewardMessage` (String, Optional) - Message content printed on the card
  - `customerSession` (String, Optional) - Session token of customer who scratched it
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([shopId])`, `@@index([rewardType])`

  #### 14. UserSession
  Enforces the 2-PC concurrent device session limit for shopkeepers.
  - `id` (String - UUID, Primary Key)
  - `shopkeeperId` (String - UUID, Foreign Key)
  - `token` (String, Unique) - Hashed session token
  - `createdAt` / `expiresAt` (DateTime)
  - *Indexes*: `@@index([shopkeeperId])`

  #### 15. PaymentLog
  Stores verification logs for customer digital/UPI payment reference codes.
  - `id` (String - UUID, Primary Key)
  - `orderId` (String - UUID, Unique Foreign Key) - Links to `Order.id` (on delete `Cascade`)
  - `transactionRef` (String, Unique) - Alphanumeric payment reference ID input by customer
  - `paymentStatus` (String, Default: `"PENDING"`) - Status of check (`PENDING`, `VERIFIED`, `FAILED`)
  - `amount` (Float) - Total payment amount verified
  - `paymentGateway` (String, Default: `"UPI"`) - Gateway name used (e.g., `UPI`, `CASH`)
  - `createdAt` / `updatedAt` (DateTime)
  - *Indexes*: `@@index([transactionRef])`

  #### 16. SystemSettings
  Key-value registry for system-wide configurations and toggles.
  - `key` (String, Primary Key) - Settings name/key
  - `value` (String) - Settings serialized value string
  - `createdAt` / `updatedAt` (DateTime)

  ---

  ## Core System Workflows

  ### 1. QR Code Generation & Entry Flow
  - **Generation**: On shopkeeper registration or manual request via `/api/shopkeeper/regenerate-qr`, the backend creates a QR code image pointing to `${FRONTEND_URL}/?shopId=${shopSlug}`.
  - **Service Implementation**:
    - `qrcode.service.js` generates a local PNG file under `/uploads/qrcodes/` and a base64 Data URL using the `qrcode` library.
    - `qr.service.js` creates a QR file under `/uploads/qrs/` containing the UUID of the shop.
  - **Entry Flow (QR-Aware Homepage)**:
    - When the customer scans the QR code, they land on the homepage `/?shopId=slug`.
    - The frontend detects the `shopId` parameter in the URL and triggers `fetchShopDetails(shopId)` from `/api/shopkeeper/by-slug/:shopId`.
    - Upon success, the full shop object is cached in `localStorage.activeShop` (retaining `activeShopId` and `activeShopSlug` for backward compatibility), and the UI displays a verified print partner card.
    - Clicking "Get Started" routes the user to `/customer/language` without needing URL parameters anymore.
  - **Backward/Legacy Compatibility Flows**:
    - If a customer opens the homepage without a QR parameter, they see the default "Take a Print" card which routes to `/take-a-print`.
    - If a legacy QR code points to `/take-a-print?shopId=slug`, it continues to work: the page resolves details and forwards the user to `/customer/language?shopId=slug`.
  - **Testing Shortcut**: Entering code `0000` on `/take-a-print` automatically maps to the default seeded shop `smart-print-hub`, bypasses scanning, and fetches database configuration parameters instantly.

  ### 2. Custom Order ID Generation
  To ensure shopkeepers have short, human-readable IDs to track orders, the backend generates IDs using the format `MMYYP[BW|C][sequence]` in `order.service.js`:
  1. `MM` (Month) and `YY` (Year) are extracted from the current date.
  2. `P` represents "Print".
  3. `BW` or `C` signifies Black & White or Color print types respectively.
  4. `sequence` is resolved dynamically by querying the database for the most recently created order file this month, parsing its sequence suffix, and incrementing it (falling back to 0 if none exist). This makes sequence generation robust against intermediate order or file deletions, preventing database duplicate key collisions.

  ### 3. Estimated Wait Time Algorithm
  Upon order creation, the system calculates estimated queue waiting times dynamically:
  - **Base Duration Calculation**:
    - Quality coefficient: `DRAFT` (3 seconds/copy), `NORMAL` (5 seconds/copy), `HIGH` (8 seconds/copy).
    - Print Side coefficient: `DOUBLE` (multiplies base time by `1.5` to account for duplex feeding delays), `SINGLE` (`1.0`).
    - Order Duration = `(Copies count * Base Time) / 60` (in minutes).
  - **Queue Buffering**:
    - Active queue counts are checked by querying the `Queue` table for items matching the shopkeeper where status is not `Done`.
    - Queue Wait Buffer = `Queue size * 2.5 minutes` (capped at a maximum of `30` minutes to prevent overflow displays).
  - **Final Formula**: `Estimated Wait Time = Math.max(Math.ceil(Order Duration + Queue Wait Buffer), 2)` (Minimum default of 2 minutes).

  ### 4. Professional Invoice Generation
  When an order is created, the backend triggers the `invoice.service.js` using `pdfkit`:
  1. Generates a unique invoice number: `INV-MMDDYY[random sequence]`.
  2. Draws a clean PDF layout on an A4 canvas:
    - Centered header indicating "INVOICE" with number and date.
    - **FROM** block detailing shopkeeper name, address, phone.
    - **BILL TO** block showing customer name and phone.
    - **ORDER DETAILS** block specifying order ID, quality, copies, paper size, and print sides.
    - **FILES** list displaying custom names of uploaded documents.
    - **FINANCIAL SUMMARY** showing subtotal, 18% GST (Tax), and total amount.
    - **Note on Currency Rendering**: The PDF uses the ASCII-compatible `Rs.` representation instead of the Unicode `₹` symbol to ensure standard PDFKit fonts (like Helvetica) render successfully without triggering character encoding exceptions.
  3. Streams the PDF buffer into `/uploads/invoices/invoice-[orderId]-[timestamp].pdf`.
  4. Saves metadata (invoice number, pdfUrl, totals) to the `Invoice` table, making it available for client-side download via `/api/orders/:id/invoice`.

  ### 5. Statistics Engine
  Analytics are updated immediately upon order completion or status updates:
  1. `order.service.js` triggers `updateShopkeeperStats()` on status changes.
  2. Statistics table records (for the specific `shopkeeperId`) increment:
    - Overall totals (`totalOrders`, `totalEarnings`, `totalCopies`).
    - Daily totals (`todayOrders`, `todayEarnings`, `todayBWPrints` vs `todayColorPrints`).
    - Monthly revenue.
  3. The `statistics.controller.js` compiles this data:
    - Daily distributions, paper sizes, and status breakdowns.
    - Weekly chart metrics over the past 7 days, calculating growth rate percentages compared to the prior week's volume.
    - Monthly aggregates detailing average order value, top paper sizes, and color-to-B&W ratios.

  ### 6. Payment Verification Flow (UPI & Cash)
  To process digital payments directly to the shopkeeper without high transaction gateway fees:
  1. **Option Selection**: In `/customer/orders`, the customer sees the shopkeeper's verified UPI details and custom Payment QR Code (if uploaded).
  2. **Payment Submission**: The customer pays using their own preferred UPI/wallet app, and inputs the alphanumeric payment reference number (transaction ID) in the input box.
  3. **Verification Request**:
     - Submitting sends a `POST /api/payments/verify/:orderId` request containing the reference.
     - The backend records this code in the `PaymentLog` model with status `PENDING`, updates the order status to `ACCEPTED` so it appears on the shopkeeper's processing dashboard, and queues the job as `WAITING`.
     - Duplicate submissions of the same reference number for other orders are explicitly blocked to prevent fraud.
  4. **Shopkeeper Validation**:
     - The shopkeeper sees the incoming transaction reference in their pending validations widget (`GET /api/payments/shopkeeper/pending`).
     - Once verified in their bank records, they click "Verify" (`PUT /api/payments/shopkeeper/verify/:id` with status `VERIFIED`) or "Reject" (`FAILED`).
     - A status update changes the payment status in `PaymentLog` accordingly.

  ### 7. AI Marketing Studio & Conversational Design Flow
  An automated creative suite for shopkeepers powered by Google Gemini and Pollinations AI:
  1. **Prompt Optimization Form**:
     - The shopkeeper inputs a brief title describing a sale, festival, or service.
     - Clicking "Suggest Prompt" triggers `POST /api/ai/suggest-prompt`, calling Google Gemini (`gemini-3.5-flash`) to generate structured form suggestions (descriptions, audience targets, color schemes, themes, and CTAs) to speed up creation.
  2. **Image Generation**:
     - On submitting, `POST /api/ai/generate` sends inputs to the backend. The server calls Gemini to construct an optimized, detailed text-to-image prompt descriptive of a premium graphic layout.
     - The backend contacts Pollinations AI with the prompt using a randomized seed to create design variations.
     - The generated image buffer is downloaded by the server, saved to the storage service (AWS S3 or local fallback directory), and recorded under the `AIAsset` database model.
  3. **Conversational Chat-to-Poster Tool**:
     - In the AI Studio chat drawer, the shopkeeper can type a natural statement (e.g. "make a flyer for fast color printing").
     - The backend (`POST /api/ai/chat-generate`) uses Gemini to parse this request, return structured layouts (headline, subheadline, CTA, theme), optimize an image prompt, generate/save the background image, and return the formatted card preview.
  4. **Gemini API Key Overrides**:
     - To bypass rate limits, shopkeepers can supply their own Gemini API keys in the settings dashboard.
     - The client context saves this key and sends it in request headers as `X-Gemini-API-Key`. The backend reads this override header, executing AI queries on the user's quota before falling back to system keys.
  5. **Direct Printing Integration**: Clicking "Print Now" converts design details, pushes a new order into the shopkeeper's queue, and logs the asset in the statistics charts.

  ### 8. Scratch Card Loyalty Rewards Flow
  Encourages customer retention via instant post-order scratch-off coupons:
  1. **Pre-creation**: Upon order placement (while still `PENDING`), a corresponding scratch card is pre-created in the database `RewardLog` model.
  2. **Eligibility & Odds**:
     - If the order matches monetary eligibility criteria, it enters a randomized roll.
     - Black & White prints have a 1.0% chance of a `FREE_PRINT` reward. Color prints have a 0.5% chance of a `HALF_PRICE_COLOR` reward.
     - Winning rolls automatically adjust and apply the discount to the order subtotal instantly at checkout.
  3. **Non-Monetary Rewards**:
     - Losing rolls or non-eligible orders default to a non-monetary card containing fun facts (`DID_YOU_KNOW`) or celestial insights (`ASTROLOGY`).
     - Content is parsed and cached in memory from local sheets (`csv.service.js`) on startup.
  4. **Scratching and Verification**:
     - The customer can access and scratch cards instantly from `/customer/orders` using an interactive HTML5 canvas.
     - Revealing 30% of the silver layer calls `POST /api/rewards/:id/scratch`, marking the card as scratched and logging details. Clicking citations redirects to references.

  ### 9. 2-PC Concurrent Session Limit
  Protects shopkeeper portal subscriptions and details from unauthorized sharing:
  1. **Token Tracking**: On login, a record is added to the `UserSession` model for the shopkeeper.
  2. **Session Eviction**:
     - If a shopkeeper attempts to log in on a 3rd active device, the database checks active sessions.
     - The server performs a rolling logout: it evicts/invalidates the oldest session token in `UserSession`.
  3. **Verification**: Subsequent requests using the evicted token fail with a `401 Unauthorized` response indicating the session limit has been exceeded.

  ---

  ## API Endpoint Reference

  ### 1. Authentication & Shopkeepers
  All shopkeeper-specific dashboards and settings endpoints require a valid JSON Web Token passed via headers: `Authorization: Bearer <token>`.

  | Route | Method | Headers/Auth | Request Body | Success Response (200/201) |
  |---|---|---|---|---|
  | `/api/auth/register` | `POST` | None | `{ email, phone, password, shopName, shopSlug }` | `{ token, shopkeeper: { id, email, ... } }` |
  | `/api/auth/login` | `POST` | None | `{ email, password }` | `{ token, shopkeeper: { id, email, ... } }` |
  | `/api/auth/google` | `POST` | None | `{ credential }` | `{ token, shopkeeper: { id, email, phone, shopName, ownerName, ... } }` (Google OAuth sign-in/up) |
  | `/api/auth/profile` | `GET` | JWT token | None | `{ id, email, phone, shopName, pricing, ... }` |
  | `/api/auth/profile` | `PUT` | JWT token | `{ shopName, address, phone, gstNumber, pricing, ... }` | `{ message: "Profile updated", shopkeeper }` |
  | `/api/shopkeeper/by-slug/:slug` | `GET` | None | None | `{ id, shopName, address, phone, pricing, ... }` |
  | `/api/shopkeeper/me/qr` | `GET` | JWT token | None | `{ qrCodeUrl, qrValue }` |
  | `/api/shopkeeper/regenerate-qr` | `POST` | JWT token | None | `{ message: "QR updated", qrCodeUrl }` |

  ### 2. Users (Customers)
  Used by clients to sync identities and preferences.

  | Route | Method | Request Body | Success Response |
  |---|---|---|---|
  | `/api/users/create` | `POST` | `{ name, phone, email, language }` | `{ message: "User created/updated", user: { id, name, ... } }` |
  | `/api/users/:userId` | `GET` | None | `{ user: { id, name, orders: [...], feedback: [...] } }` |

  ### 3. File Management
  Used to handle physical document transfers.

  | Route | Method | Content-Type | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/files/upload` | `POST` | `multipart/form-data` | Form field `file` containing PDF/Image | `{ message: "File uploaded successfully", fileName, fileUrl, fileKey, storageType, sizeBytes, mimeType }` |

  ### 4. Orders
  Manages the ordering workflow.

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/orders/create` | `POST` | None | `{ userId, shopkeeperId, customerName, phone, items: [{ fileName, fileUrl, price, config: { copies, paperSize, printType, sides, orientation, quality, pageRange }, fileSize }] }` | `{ message: "Order(s) created successfully", orders: [...] }` |
  | `/api/orders/user/:userId` | `GET` | None | None | `[ { id, orderId, totalAmount, status, printConfiguration, orderFiles, invoice, shopkeeper }, ... ]` (Ordered by date desc) |
  | `/api/orders/:id` | `GET` | None | None | `{ id, orderId, printConfiguration, orderFiles, queue, invoice, shopkeeper }` (id can be UUID or orderId) |
  | `/api/orders/:id` | `DELETE` | None | None | `{ message: "Order deleted successfully" }` (Only if status is `PENDING`) |
  | `/api/orders/:id/invoice` | `GET` | None | None | Binary PDF File Stream |
  | `/api/orders/shopkeeper/all` | `GET` | JWT token | Query param `?status=All` or `Printing` | `[ { id, orderId, totalAmount, status, printConfiguration, orderFiles, queue, invoice }, ... ]` (Ordered by date desc) |
  | `/api/orders/:id/status` | `PUT` | JWT token | `{ status: "PRINTING" }` | `{ message: "Order status updated successfully", order: { ... } }` (Updates queue status to PRINTING/DONE accordingly) |

  ### 5. Queue Management

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/queue` | `GET` | None | Query param `?shopkeeperId=UUID` | `[ { id, position, status, estimatedWaitTime, order: { orderId, customerName, fileName, status } }, ... ]` (Ordered by position asc, status not DONE) |
  | `/api/queue/:id` | `PUT` | JWT token | `{ position, status }` | `{ message: "Queue item updated", queueItem }` |

  ### 6. Feedback & Support

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/feedback/submit` | `POST` | None | `{ userId, subject, message, rating }` | `{ message: "Feedback submitted successfully", feedback: { id, subject, status } }` |
  | `/api/feedback/user/:userId` | `GET` | None | Query params `?status=OPEN&limit=10` | `{ feedback: [...], total, limit, offset, hasMore }` |
  | `/api/feedback/all` | `GET` | None (Admin) | Query params `?status=OPEN&limit=20` | `{ feedback: [...], total }` |
  | `/api/feedback/:feedbackId/status` | `PUT` | None (Admin) | `{ status: "RESOLVED" }` | `{ message: "Feedback status updated", feedback }` |
  | `/api/feedback/:feedbackId` | `DELETE` | None (Admin) | None | `{ message: "Feedback deleted successfully" }` |

  ### 7. Statistics & Analytics

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/statistics/:shopkeeperId` | `GET` | None | None | `{ statistics: { daily, weekly, monthly, overall }, recentOrders: [...] }` |
  | `/api/statistics/:shopkeeperId/daily/:date?` | `GET` | None | None | `{ date, totalOrders, totalEarnings, totalCopies, bwOrders, colorOrders, colorToBlackAndWhiteRatio, paperSizeDistribution, statusDistribution, orders: [...] }` |
  | `/api/statistics/:shopkeeperId/weekly` | `GET` | None | None | `{ weekStart, weekEnd, totalOrders, totalEarnings, growthPercentage, dailyBreakdown: [...] }` |
  | `/api/statistics/:shopkeeperId/monthly/:month/:year?` | `GET` | None | None | `{ month, year, totalRevenue, totalOrders, totalCopies, avgOrderValue, topPaperSize, paperSizeDistribution, printTypeDistribution: { BW, COLOR } }` |

  ### 8. Admin API Endpoints
  Used by platform administrators to manage the application and monitor statistics.

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/admin/stats` | `GET` | None | None | `{ totalOrders, activeShops, revenue, activeCustomers }` |
  | `/api/admin/recent-orders` | `GET` | None | None | `Order[]` (Each order includes shopkeeper name) |
  | `/api/admin/users` | `GET` | None | None | `User[]` |
  | `/api/admin/shops` | `GET` | None | None | `Shopkeeper[]` (Select fields: id, email, shopName, ownerName, phone, isOnboarded, totalOrders, totalEarnings, createdAt) |
  | `/api/admin/shops/:id/onboard` | `PUT` | None | None | `{ message: "Shop onboarding status updated successfully", shop: Shopkeeper }` |
  | `/api/admin/analytics` | `GET` | None | None | `{ statusDistribution, printTypeDistribution, dailyTrends }` |

  ### 9. AI Marketing Studio API
  Used by shopkeepers within the AI Marketing Studio to generate content suggestions and create AI-generated designs.

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/ai/suggest-prompt` | `POST` | JWT token | `{ title: string }` | `{ businessDescription, audience, theme, cta, posterType, colorPalette, language }` |
  | `/api/ai/generate` | `POST` | JWT token | `{ title, businessName, description, language, audience, posterType, posterSize, themeStyle, colorPreference, cta }` | `{ id, generatedImageUrl, optimizedPrompt }` |
  | `/api/ai/regenerate` | `POST` | JWT token | `{ title, businessName, description, language, audience, posterType, posterSize, themeStyle, colorPreference, cta }` | `{ id, generatedImageUrl, optimizedPrompt }` |
  | `/api/ai/chat-generate` | `POST` | JWT token | `{ prompt: string }` | `{ id, generatedImageUrl, config: { headline, subheadline, offerText, description, cta, theme } }` |
  | `/api/ai/history` | `GET` | JWT token | None | `AIAsset[]` |

  ### 10. Scratch Card Reward System
  Used to manage the order-specific customer scratch loyalty cards and aggregate metrics.

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/rewards/order/:orderId` | `GET` | None | None | `{ id, orderId, shopId, rewardType, rewardCategory, scratched, applied, rewardMessage, customerSession }` (Fetches or initializes a card pre-created during order placement) |
  | `/api/rewards/:id/scratch` | `POST` | None | None | `{ id, orderId, shopId, rewardType, rewardCategory, scratched: true, applied: true/false, ... }` (Marks card as scratched & applies coupon) |
  | `/api/rewards/shopkeeper/stats` | `GET` | JWT token | None | `{ rewardsGeneratedToday, freePrintRewardsUsed, discountRewardsUsed, customerEngagementLevel, totalScratched, totalGenerated }` |
  | `/api/rewards/admin/stats` | `GET` | None | None | `{ totalScratches, monetaryRewardsUsed, nonMonetaryRewardsViewed, scratchRate, totalCardsGenerated }` |

  ### 11. Payment Log & Verification API
  Enables customers to register verification logs for transaction references and shopkeepers to validate them.

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/payments/verify/:orderId` | `POST` | None | `{ transactionRef, paymentGateway, amount }` | `{ message: "Payment transaction reference submitted successfully", paymentLog }` |
  | `/api/payments/shopkeeper/verify/:id` | `PUT` | JWT token | `{ status }` (status must be `VERIFIED` or `FAILED`) | `{ message: "Payment status updated to VERIFIED/FAILED", paymentLog }` |
  | `/api/payments/shopkeeper/pending` | `GET` | JWT token | None | `PaymentLog[]` (List of pending verification requests including orderId, customerName, totalAmount) |

  ### 12. Platform Settings & Health Check Diagnostics
  Utility endpoints used to track system health and fetch configurations.

  | Route | Method | Headers/Auth | Request Body | Success Response |
  |---|---|---|---|---|
  | `/api/settings` | `GET` | None | None | `{ [key]: value }` (A map of platform configuration variables) |
  | `/api/health` | `GET` | None | None | `{ status: "healthy", timestamp, storage: "s3/local" }` |
  | `/debug/s3` | `GET` | None | None | `{ currentRegion, bucket, sdkVersion, credentialSource, canConnect, bucketAccessible, errorDetails }` |

  ---

  ## Frontend-Backend Integration Walkthrough
  
  ### 1. Customer Workflow
  1. **Landing & Scan**: Customer visits the homepage `/`, scans the shopkeeper's QR code (or types slug/ID manually, using `0000` for test routing), redirecting to `/take-a-print?shopId=slug`.
  2. **Shop Fetching**: `/take-a-print` queries `/api/shopkeeper/by-slug/:shopId`. On success, details are cached in `localStorage` and routing shifts to `/customer/language`.
  3. **Language Selection**: Browser language is auto-detected. Customer selects their preferred language, inputs their details (Name, Phone, Email), which posts to `/api/users/create`, caching the returned `userId` in `localStorage`.
  4. **File Upload**: Customer uploads one or multiple documents on `/customer/upload`.
      - Multiple file uploads are automatically grouped into a single database Order for unified payment, tracking, and itemized billing.
      - Each uploaded file receives its own sequential custom ID (e.g. `0526PBW16`, `0526PBW17`, `0526PBW18`), with the final file's ID serving as the primary visible Order ID on the order-placed dashboard.
      - Each file generates a base64 thumbnail (rendering PDF pages using PDF.js CDN, or Canvas for images) cached locally to prevent blank images.
      - Submitting routes files to `/api/files/upload`, returning file storage URLs.
  5. **Print Configuration Choices**: On `/customer/configuration`, the customer is presented with two options at the top:
      - **"I Want to Talk with Shopkeeper First"**: Directly redirects to the review step with a `0` price (setting the order variant to `'talk'`).
      - **"I Want to Configure Print Layout"**: Dynamically reveals the document preview sections and configuration fields (Color/BW, copies, paper size, quality, orientation, duplex sides, page range). By default, these configuration details are hidden to keep the landing layout clean.
      - Grayscale CSS renders dynamically on selecting the BW option, and pricing is calculated using the shopkeeper's pricing rates.
  6. **Order Review**: Summarizes shop details, configurations, and pricing. If the customer selected the Talk First option, a talk-specific banner is shown with a ₹0.00 balance. Continuing creates orders via `/api/orders/create`.
  7. **Order Placed**: Customer views the backend-generated primary order ID, estimated wait time, and print details. History is accessible via `/customer/orders` where all files uploaded in a single transaction are rendered inside a single unified card. The primary order ID sits at the top of the card as the title, and each listed file explicitly mentions its own unique sequential file ID. The customer can also cancel pending orders or download a premium invoice PDF displaying an itemized multi-column table: `Invoice Num | File Name | Price of Print | Amount`.
  
  ### 2. Shopkeeper Dashboard Actions
  1. **Authentication & Session Lifecycle**:
      - Shopkeepers log in or register via `/api/auth/login`, `/api/auth/register`, or Google OAuth (`/api/auth/google`), receiving a JWT.
      - **Concurrent Login Limit (2 PCs Max)**: The backend strictly enforces a session limit of 2 active devices per shopkeeper. Logging in on a 3rd device automatically invalidates the oldest session token (rolling logout) without locking the user out entirely.
      - Subsequent requests from the invalidated device receive a `401 Unauthorized` error with a clear error payload: `"Session limit exceeded. You have been logged out because you logged in on another device."`
      - The database-backed session manager (`session.service.js`) handles server restarts seamlessly, persisting active logins in the database and registering existing tokens on-the-fly on first request to prevent mass logouts.
      - The login page does NOT automatically bypass/redirect to the dashboard if a token exists. This allows multiple shopkeepers to log in or switch accounts on the same machine.
      - Shopkeepers can clear their session and log out using the **Logout** button in the dashboard header, which removes `authToken` and user state from `localStorage` and routes back to `/shopkeeper/login`.
  2. **Global Translations & Accessibility**:
      - The shopkeeper interface contains fully integrated global translations. Language selections made on the settings screen or login forms propagate instantly across the entire dashboard (including order queues, charts, layout toggles, stats cards, and helper docks).
      - Global synchronization is driven by localized local storage keys and storage-change window events.
  3. **Onboarding & Setup**:
      - New shopkeepers complete step-by-step onboarding (Profile Setup and Pricing Setup) which saves configuration details in the database via `PUT /api/auth/profile`.
      - Onboarding profile updates preserve pricing details, and pricing configurations preserve profile details, preventing accidental nullification.
      - Profile detail rendering uses standard `<img>` tags for logos to support base64 images, relative paths, and unconfigured dynamic URLs without Next.js domain/hostname optimization crashes.
  4. **Order Management**: Shopkeeper dashboard fetches `/api/orders/shopkeeper/all` to render order queues.
      - **Premium Layout Toggle**: The dashboard supports switching between a horizontal scrolling **Card View** (with hover micro-animations) and a structured **Table View** presenting active print jobs in a grid.
      - **Quick Actions**: Inline buttons (Preview, Print, Download, Cancel) let shopkeepers process orders instantly.
      - **Database Enum Mapping**: When a shopkeeper downloads a customer file, the status change request is automatically mapped to `COMPLETED` in the backend. This prevents Prisma/PostgreSQL enum constraint errors while keeping the order completion data intact.
  5. **Real-time Queue & Print**: Shopkeeper updates items to `Completed` which calls the browser's printing service, downloads the invoice, and updates statistics.
  6. **Dynamic Shop Statistics**: All statistics card counts (Pending, Completed, Downloaded, Cancelled), bottom dock navigation badges, print sizes (A4, A3, etc.), document formats, revenue totals, and customer acquisition bar graphs are computed dynamically in real-time from the database order logs, ensuring exact reflections of database states.
  7. **AI Marketing Studio**:
      - Shopkeepers can navigate to the AI Studio (`/shopkeeper/printsmart-ai`) to access a dedicated marketing workshop with 6 distinct tool modes: AI Poster Maker, AI Banner Maker, Offer Flyer Generator, Festival Marketing Generator, Social Media Post Maker, and WhatsApp Promotion Poster.
      - **Suggest Prompt**: By typing a promotion title and clicking "Suggest Prompt", shopkeepers invoke Google Gemini API (`POST /api/ai/suggest-prompt`) to automatically generate high-converting details and autofill the rest of the form.
      - **AI Generation**: Clicking "Generate" or "Regenerate" sends form inputs to the backend (`POST /api/ai/generate` or `POST /api/ai/regenerate`), where Gemini optimizes the image prompt. The backend then contacts Pollinations AI (with random seeds for design variations) to generate a completely unique, visually premium poster/banner image, which is saved in S3/local storage and logged in the database (`AIAsset` model).
      - **Preview & Loading**: The live dynamic preview is removed in favor of a real AI-generated design showcase under a *"✨ Generated by AI"* badge. A premium step-by-step progress loader keeps the user engaged during design computation.
      - **Print Queue Integration**: Clicking "Print Now" converts the generated asset details and pushes the print job directly into the active order queues (`POST /api/orders/create`), updating shop stats and billing sheets seamlessly.
      - **Archive**: An archive shelf renders past designs from the database (`GET /api/ai/history`), permitting instant loading and printing of previous assets.
  8. **Scratch Card Loyalty Program & Gemini Key Overrides**:
      - **Google Gemini v3.5-Flash**: The AI Poster Studio runs on the updated `gemini-3.5-flash` model, resolving 404 retired model exceptions.
      - **Customer-Supplied API Keys**: Shopkeepers can input their own Gemini API keys in the header panel. The key is saved locally in the browser context and forwarded in headers as `X-Gemini-API-Key`. The backend reads this header first, executing model queries against the user's personal API key quota, before falling back to server environment variables.
      - **Instant Order-Linked Scratch Cards**: Scratch cards are pre-created instantly in the database at the time of order placement while the order is still `PENDING`, rather than waiting for order completion.
      - **Monetary Reward Application**: If the order is eligible and wins a monetary discount (`FREE_PRINT` with 1% probability for eligible B/W prints, or `HALF_PRICE_COLOR` with 0.50% probability for eligible Color prints), the discount is calculated and applied to the print order total instantly at creation.
      - **Non-Monetary Content Sourcing**: Non-eligible or losing rolls trigger a non-monetary card (`DID_YOU_KNOW` or `ASTROLOGY` on a 50/50 split). Card details are dynamically cached from local Excel/CSV worksheets (`Do You Know,Astrology.xlsx` converted to assets on startup).
      - **Immediate Customer Scratch Access**: Customers can view and scratch cards immediately from the orders queue page (`/customer/orders`) even while the order is pending or accepted. The scratch card modal dynamically parses JSON entries case-insensitively (supporting columns like `scratch_text`, `category`, `sub_category`, and `reference_link`) and renders clickable source references for facts.
      - **Real-Time Reward Metrics**: The Shopkeeper Statistics panel displays dynamic grids summarizing active scratch rate progress bars, total card distributions, and customer engagement tiers.

  ---
  
  ## Document Version
  
  - **Version:** 3.2.2
  - **Last Updated:** June 20, 2026
  - **Author:** Antigravity AI
  - **Status:** Complete (Fully synchronized with backend models, API routes, S3 storage with local fallback, custom sequential file IDs, premium invoices, global dashboard translations, and 2-PC concurrent session rolling logout. Enhanced with a full-screen blurred loading overlay on uploads, UPI & Payment QR code setups on shopkeeper and customer flows, dynamic scratch card loyalty rewards, Gemini 3.5 custom API key overrides, and fixes for order placement server errors and success redirection. Updated with full documentation for payment logs, AI Studio chat generation, scratch card loyalty worksheets, and platform settings).
  
  ---
  
  **End of Documentation**
  
  For questions or updates, please contact the development team or create a GitHub issue.
  
  ---

