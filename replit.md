# Weather Context App

## Overview

A weather visualization application that answers "Is today warmer or colder than usual?" by overlaying current conditions and forecasts against historical temperature normals. Built with React, Express, TypeScript, and PostgreSQL using the Open-Meteo API for weather data.

The app displays temperature deviations from historical averages through interactive charts, daily anomaly cards, and narrative summaries, helping users understand weather in context rather than absolute numbers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite for build tooling and development server

**Routing**: Wouter for lightweight client-side routing

**UI Components**: shadcn/ui component library (Radix UI primitives) with Tailwind CSS for styling
- Component path aliasing via `@/components`, `@/lib`, `@/hooks`
- Custom design system following Apple HIG minimalism and Material Design principles
- Typography: Inter font family with tabular numbers for temperature displays
- Theme support: Light/dark mode with CSS variables for dynamic theming

**State Management**: 
- TanStack Query (React Query) for server state and API data caching
- Local React state for UI interactions
- Custom query client with infinite stale time and disabled refetching by default

**Chart Visualization**: Recharts library for temperature deviation charts
- Area charts with transparency for historical min/max bands
- Layered composite charts for forecast overlays
- Custom tooltips showing historical context

**Design Principles**:
- Data-first approach prioritizing clarity and scanability
- Utility-focused minimalist design
- Mobile-first responsive layout with Tailwind breakpoints
- Tabular numerals for consistent temperature alignment

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful endpoints prefixed with `/api`
- Separation of concerns via modular route registration
- Custom middleware for request logging with timestamps
- Static file serving for built client assets

**Build System**: 
- Custom esbuild configuration for server bundling
- Selective dependency bundling (allowlist) to reduce cold start times
- Separate client (Vite) and server (esbuild) build processes

**Development Environment**:
- Hot Module Replacement (HMR) via Vite middleware
- Development-only plugins: error overlay, cartographer, dev banner
- Request/response logging with duration tracking

**Storage Layer**:
- Abstracted storage interface (`IStorage`) for CRUD operations
- In-memory storage implementation (`MemStorage`) for development
- Designed for easy swapping to PostgreSQL-backed storage

### Data Storage

**Database**: PostgreSQL with Drizzle ORM
- Schema-first approach with TypeScript type inference
- Migrations managed via Drizzle Kit (`drizzle.config.ts`)
- Zod schema validation via drizzle-zod integration

**Current Schema**:
- Users table with UUID primary keys, username/password fields
- Extensible schema design for adding climate normals caching

**Recommended Climate Data Schema**:
```typescript
climate_normals: {
  lat/lon: Rounded to 3 decimals (~100m precision) for cache hits
  day_of_year: 1-366 for daily normals
  temp_avg, temp_min_avg, temp_max_avg: Historical statistics
  computed_at: Cache invalidation timestamp
}
```

**Session Management**: 
- Express sessions with PostgreSQL store (connect-pg-simple)
- Configured for production database credentials via environment variables

### External Dependencies

**Weather Data API**: Open-Meteo
- **Current/Forecast**: Free API, no authentication required
- **Historical Archive**: 30+ years of daily temperature data (1990-2020+)
- **Timezone Handling**: Automatic via `timezone=auto` parameter
- **Rate Limits**: None for standard usage

**Caching Strategy**:
- PostgreSQL-backed climate normals cache (persistent across restarts)
- Location coordinates rounded for cache reuse
- Day-of-year indexing for fast lookups
- Avoids expensive repeated historical API calls

**Geolocation**:
- Browser Geolocation API for "Use My Location" feature
- Fallback to city search via location name

**Font Delivery**: Google Fonts CDN
- Inter: Primary UI font (400, 500, 600, 700 weights)
- Additional fonts: Architects Daughter, DM Sans, Fira Code, Geist Mono

**UI Component Dependencies**:
- Radix UI primitives (dialogs, dropdowns, tooltips, etc.)
- class-variance-authority for component variants
- Embla Carousel for potential carousel implementations
- Recharts for data visualization

**Form Handling**:
- React Hook Form with Zod resolvers for validation
- Type-safe form schemas via drizzle-zod

**Deployment Considerations**:
- Replit-specific: Container sleep requires persistent cache (not in-memory)
- Environment variables: `DATABASE_URL` required for database connection
- Build output: `dist/public` for client, `dist/index.cjs` for server