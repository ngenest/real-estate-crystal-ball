# Tampa Bay Real Estate Crystal Ball 🔮

A real-time, standalone dashboard for monitoring the state of real estate development across the Tampa Bay metro area — covering **Hillsborough**, **Pinellas**, **Pasco**, and **Manatee** counties.

## Features

### 🗺️ Geographic Map View
Interactive Leaflet map of Tampa Bay with overlays for:
- **Building Permits** — location, value, type
- **Transactions** — recent sales/acquisitions
- **Zoning** — active rezoning and variance cases
- **Public Hearings** — upcoming government hearings
- Region selection with auto-zoom per area

### 📊 Dashboard Panels
| Panel | Data |
|---|---|
| **Overview** | Summary cards, region comparison, activity feed |
| **Map View** | Interactive Leaflet map with multi-layer overlays |
| **Permits** | Building permits — type, value, status, applicant |
| **Transactions** | RE deals — price, asset class, cap rate, parties |
| **Zoning** | Rezoning, variances, planned developments |
| **Public Hearings** | City/county hearings calendar (upcoming + concluded) |
| **News & Media** | Aggregated RSS feeds from Tampa Bay media sources |
| **Market Data** | Price trends, vacancy rates, permit volume charts |

### 📈 Market Indicators
- Median home prices (SFR & Condo) with YoY trend
- Active listings, days on market, inventory months
- Office / Retail / Industrial / Multifamily vacancy rates
- Cap rates by asset class
- Monthly permit volume charts
- Historical price trend charts (2022–present)
- Per-region breakdown across 11 key sub-markets

### 🌐 Live Data Sources
The dashboard automatically fetches from public sources (with seed data fallback):

| Source | Data |
|---|---|
| **City of Tampa Open Data** (Socrata) | Building permits |
| **US Census Bureau ACS** | Housing vacancies, median values |
| **Tampa Bay Times RSS** | Real estate & local news |
| **Tampa Bay Business Journal RSS** | Commercial RE news |
| **St. Pete Catalyst RSS** | St. Petersburg development news |
| **FEMA NFHL** | Flood zone overlays (map) |

## Regions Monitored

- Downtown Tampa
- South Tampa (Hyde Park, SoHo, Davis Islands)
- New Tampa / Wesley Chapel
- Brandon / Riverview
- Westchase / Citrus Park
- St. Petersburg
- Clearwater
- Largo / Pinellas Park
- Dunedin / Palm Harbor
- Land O Lakes / Lutz (Pasco)
- Bradenton (Manatee)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dashboard will be available at `http://localhost:5173` (dev) or `http://localhost:4173` (preview).

## Architecture

```
src/
├── components/
│   ├── Header/         # App header with refresh control
│   ├── Sidebar/        # Navigation tabs + region filter
│   ├── Dashboard/      # Overview with summary cards
│   ├── MapView/        # Leaflet map with data layers
│   ├── PermitsPanel/   # Building permits list
│   ├── TransactionsPanel/  # RE transactions list
│   ├── ZoningPanel/    # Zoning cases list
│   ├── HearingsPanel/  # Public hearings calendar
│   ├── NewsPanel/      # News/media aggregation
│   └── MarketIndicators/   # Charts & metrics
├── services/
│   ├── tampaOpenData.js    # Tampa Socrata API
│   ├── marketData.js       # FRED + Census APIs
│   └── newsAggregator.js   # RSS feed parser
├── data/
│   ├── regions.js          # Tampa Bay region definitions
│   ├── dataSources.js      # Data source registry
│   └── seedData.js         # Representative fallback data
└── utils/
    └── formatters.js       # Number/date/currency formatters
```

## Tech Stack

- **React 19** + **Vite**
- **Leaflet** / **react-leaflet** — Geographic maps
- **Recharts** — Area, bar, and horizontal charts
- **Axios** — HTTP client for API calls
- **date-fns** — Date manipulation
- **lucide-react** — Icons

## Data Refresh

- Automatic refresh every 10 minutes
- Manual refresh via the "Refresh" button in the header
- Falls back gracefully to representative seed data when APIs are unavailable
