# BHU-TRACE — AI-Powered Land-Record Tracking Portal

> **"Your Land. Your Rights. Your Records."**
>
> Making land records transparent, accessible, and accountable for every Indian citizen.

---

## 🏆 Hackathon Prototype

**Theme:** Legal Accessibility & Social Justice

This is a demonstration prototype developed for a hackathon. All land records, ownership histories, application statuses, and discrepancy alerts are **illustrative sample data**. This is not an official government land-record system.

---

## ✨ Features

### Core Features
| Feature | Description |
|---|---|
| 🔍 **Land Record Search** | Search by survey number, owner name, village, taluk, district |
| 🗺️ **Interactive Map** | Leaflet + OpenStreetMap map with GeoJSON parcels, status filters, popups |
| 📜 **Ownership Timeline** | Chronological history of all recorded ownership changes |
| 🤖 **AI Discrepancy Detection** | 8-category alert system with severity levels and recommended actions |
| 📋 **Document Checklist** | Dynamic checklist for 12 land-related services, tailored to case type |
| 📝 **Correction Request Form** | 5-step wizard → unique BHUT-2026-XXXXXX tracking token |
| 📡 **Application Tracking** | Real-time status with officer notes and next-steps guidance |
| 🤝 **Bhu-Assist Chatbot** | Mock AI with intent detection, glossary, and live token lookup |
| 🏛️ **Officer Dashboard** | Review requests, update statuses, manage discrepancy alerts & concerns |
| 🌐 **Bilingual** | Complete English + Kannada interface — switch anytime without reload |

### Advanced Protection & Transparency Modules
| Feature | Description |
|---|---|
| 🔒 **Encumbrance & Legal Risk** | Per-property tab showing mortgages, bank liens, court restrictions — labelled as illustrative sample data |
| ✅ **A-Khata Eligibility Check** | 4-step pre-assessment for DC conversion, layout approval, betterment charges, road width |
| 💰 **Transparency Dashboard** | Fee schedule, payment records, officer activity timeline, process concern reporting |
| 📄 **Printable Legal Appeal Documents** | Generate pre-filled appeal letters, RTI requests in English or Kannada; browser print or jsPDF download |
| 🚩 **Process Concern Reporting** | Submit concerns with BHUC- reference token; officer dashboard shows all concerns with status workflow |

---

## 🛠 Technology Stack

```
Frontend:  React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Lucide React
Routing:   React Router v6
Charts:    Recharts
Maps:      Leaflet 1.9 · React-Leaflet 4 · OpenStreetMap
i18n:      i18next (English + Kannada)
Storage:   Browser localStorage (no backend required)
AI:        Mock intent-detection service (modular — plug in any LLM via .env)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Navigate to the project directory
cd "bhu-trace"

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Windows (PowerShell) — if npm is not in PATH

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location "bhu-trace"
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```

### Environment Variables (Optional)

Copy `.env.example` to `.env`. All variables are optional — the app runs in full mock mode without them.

```bash
cp .env.example .env
```

---

## 🗺️ Application Routes

### Core Routes
| Route | Page |
|---|---|
| `/` | Landing page with hero, map, features |
| `/land-records` | Search land parcels |
| `/land-records/:propertyId` | Property detail + ownership timeline + encumbrance tab |
| `/land-records/:propertyId/encumbrance` | Full encumbrance & legal risk report |
| `/discrepancies` | AI discrepancy detection dashboard |
| `/document-checklist` | Document checklist generator |
| `/submit-request` | Correction / appeal request form |
| `/track-application` | Token-based application tracking + activity timeline |
| `/officer-dashboard` | Officer admin interface (requests, discrepancies, concerns) |
| `/about` | About, tech stack, demo guide |

### Advanced Module Routes
| Route | Page |
|---|---|
| `/akhata-assessment` | A-Khata regularization eligibility pre-assessment (4 steps) |
| `/transparency` | Fee schedule, payment records, officer activity, concern reporting |
| `/report-process-concern` | Submit & track process concerns (BHUC- tokens) |
| `/legal-appeal/:token` | Generate & download printable legal appeal documents |

---

## 🎮 Demo Walkthrough

### Sample Survey Numbers

| Survey Number | Village | District |
|---|---|---|
| `42/3` | Kengeri | Bengaluru Urban |
| `78/2A` | Yelahanka | Bengaluru Urban |
| `112/5` | Whitefield | Bengaluru Urban |
| `204/6B` | Begur | Bengaluru Rural |
| `315/1` | Hesaraghatta | Bengaluru Rural |

### Demo Tracking Tokens

```
BHUT-2026-000001   (Under Verification)
BHUT-2026-000002   (Additional Documents Required)
BHUT-2026-000003   (Submitted — Preliminary Review)
BHUT-2026-000004   (Resolved)
BHUT-2026-000005   (Forwarded to Relevant Authority)
```

### Suggested Evaluation Workflow

#### Core Features
1. **Search** → Land Records → enter `42/3` → open result → view timeline
2. **Map** → Home page → scroll to map → click a polygon → "View Full Details"
3. **Discrepancy** → Discrepancy Detection → open any alert → Mark for Review
4. **Checklist** → Document Checklist → Mutation → Karnataka → Generate
5. **Submit** → Submit Request → complete 5-step form → copy token
6. **Track** → Track Application → paste token → observe live status
7. **Officer** → Officer Dashboard → open request → update status → verify in tracking
8. **Chatbot** → click chat button → ask "What is RTC?" → ask "Track BHUT-2026-000001"
9. **Kannada** → Globe icon top-right → switch language → navigate pages

#### Advanced Module Demos
10. **Encumbrance** → Land Records → Survey `42/3` (KA-BLR-KEN-001) → "Encumbrance & Legal Risk" tab → click "View Full Encumbrance Report"
11. **A-Khata** → Navbar "More" → A-Khata Check → complete all 4 steps → see eligibility score
12. **Transparency** → Navbar "More" → Transparency → explore fee schedule, payment records, concerns
13. **Legal Appeal** → Track Application → enter `BHUT-2026-000001` → "Generate Printable Legal Appeal" → select document type → Preview → Download PDF
14. **Process Concern** → Navbar "More" → Report Concern → submit form → get BHUC- token → track it
15. **Officer Concerns** → Officer Dashboard → "Process Concerns" tab → update concern status

---

## 📁 Project Structure

```
bhu-trace/
├── src/
│   ├── components/
│   │   ├── chat/          # Bhu-Assist chatbot widget
│   │   ├── layout/        # Navbar, Layout, StatusBadge
│   │   ├── map/           # Leaflet map with GeoJSON parcels
│   │   └── ui/            # shadcn/ui components (Button, Card, Badge, etc.)
│   ├── data/
│   │   └── sampleData.ts  # 15 fictional Karnataka land parcels + events
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── i18n/
│   │   ├── en.json        # English translations
│   │   ├── kn.json        # Kannada translations
│   │   └── i18n.ts        # i18next configuration
│   ├── lib/
│   │   └── utils.ts       # cn() helper
│   ├── pages/             # One file per route
│   ├── services/
│   │   ├── dataService.ts # localStorage CRUD + token generation
│   │   └── aiService.ts   # Mock AI chatbot (intent detection)
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── App.tsx            # Router + all routes
│   ├── index.css          # Tailwind + print styles
│   └── main.tsx
├── public/
│   └── favicon.svg
├── index.html             # Leaflet CSS via CDN, Google Fonts
├── package.json
├── tailwind.config.js     # Custom colors: navy, saffron, forest
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔒 Privacy & Data Notes

- **No personal data is transmitted** to any server
- All demo submissions are stored in **browser localStorage only**
- No Aadhaar numbers, PAN, banking details, or biometrics are collected
- localStorage is cleared when the user clicks "Reset Demo Data" on the Officer Dashboard

---

## 🌐 Bilingual Support

The interface is fully bilingual in **English** and **Kannada (ಕನ್ನಡ)**:

- Click the **Globe icon** in the top navigation bar to switch languages
- The entire interface — navigation, forms, tables, alerts, chatbot — switches immediately
- Kannada rendered using **Noto Sans Kannada** (loaded from Google Fonts)
- Language preference is persisted in localStorage across sessions

---

## ⚠️ Disclaimer

Bhu-Trace is a hackathon prototype and is **not** an official government land-record system. Sample land records, ownership histories, application statuses, and discrepancy alerts are illustrative and do not represent actual government data. The platform does not determine legal ownership or replace verification by the competent authority. Document requirements and procedures vary by jurisdiction and individual circumstances.

---

## 📄 License

This prototype is submitted as a hackathon project. All sample data is fictional.

