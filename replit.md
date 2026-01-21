# EcoVibe - Environmental Quality Mapping Application

## Overview

EcoVibe is an interactive environmental quality mapping application that allows users to explore location-based environmental data and contribute community observations. Users can click anywhere on a map to get AI-powered environmental analysis (air quality, water quality, walkability, green space scores) and drop pins to mark wildlife sightings, pollution sources, trails, or other environmental observations.

The application follows a full-stack TypeScript architecture with a React frontend using Leaflet maps and a Node.js/Express backend that integrates with OpenAI for environmental analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom nature-inspired color palette
- **Mapping**: Leaflet with react-leaflet bindings for interactive maps
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript compiled with tsx
- **API Pattern**: REST endpoints defined in shared route contracts
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod for runtime type checking with drizzle-zod integration

### Data Layer
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Migrations**: Drizzle Kit manages migrations in `/migrations` folder
- **Current Tables**:
  - `pins`: Community-contributed location markers (lat, lng, type, description)
  - `conversations` and `messages`: Chat storage for AI integrations (available but not actively used)

### API Structure
- Routes defined declaratively in `shared/routes.ts` with Zod schemas
- `POST /api/analyze`: Takes lat/lng, returns AI-generated environmental scores
- `GET /api/pins`: Lists all community pins
- `POST /api/pins`: Creates a new pin

### Key Design Decisions

1. **Shared Route Contracts**: The `shared/routes.ts` file defines API contracts with input/output schemas, enabling type-safe API calls from the frontend and validation on the backend.

2. **AI Integration**: Uses OpenAI via Replit AI Integrations environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`) for environmental analysis.

3. **Component Architecture**: UI components follow shadcn/ui patterns - unstyled Radix primitives wrapped with Tailwind styling, stored in `client/src/components/ui/`.

4. **Path Aliases**: TypeScript paths configured for clean imports:
   - `@/*` → `client/src/*`
   - `@shared/*` → `shared/*`

## External Dependencies

### Database
- **PostgreSQL**: Required, connection string via `DATABASE_URL` environment variable
- **Drizzle Kit**: Run `npm run db:push` to sync schema to database

### AI Services
- **OpenAI API**: Used for environmental analysis generation
  - `AI_INTEGRATIONS_OPENAI_API_KEY`: API key for OpenAI
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`: Base URL (Replit AI proxy or direct OpenAI)

### Mapping Services
- **OpenStreetMap**: Free map tiles via Leaflet (no API key required)

### Included Integration Utilities
The `server/replit_integrations/` folder contains pre-built utilities for:
- Audio/voice chat (speech-to-text, text-to-speech)
- Image generation
- Chat with conversation storage
- Batch processing with rate limiting

These are available but not currently integrated into the main application flow.