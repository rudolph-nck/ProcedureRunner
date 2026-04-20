# Procedure Builder

A production-quality visual builder for procedures, policies, SOPs, and run sheets. Built with Next.js, Prisma, and dnd-kit — designed to run locally or on an internal network without requiring a public domain.

---

## Features

- **Visual Drag-and-Drop Builder** — 3-panel layout with outline, canvas, and settings panels
- **40+ Block Types** — Checklists, text fields, timers, approvals, warnings, tables, signatures, and more
- **Procedure Versioning** — Drafts are editable; published versions are immutable
- **Runner Mode** — Step-by-step or full checklist execution with progress tracking
- **Theme & Branding** — Full workspace customization with color palette, fonts, and logo
- **Branded PDF Export** — Print-ready export with logo, watermark, header/footer
- **Search & Filtering** — Filter by type, status, department, tags, and more
- **Analytics Dashboard** — Overview of procedures and run activity
- **Local-first** — SQLite by default; no external services required
- **Docker ready** — Single-command deployment on any internal server

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+

### 1. Clone and install

```bash
git clone <your-repo-url>
cd procedure-builder
npm install
```

### 2. Set up the database

The app uses **SQLite by default** — no PostgreSQL setup needed.

```bash
# Push the schema and seed demo data
npm run db:push
npm run db:seed
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the demo workspace with sample procedures.

---

## Environment Variables

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite file path, or PostgreSQL URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App base URL |
| `NEXTAUTH_SECRET` | *(required in prod)* | Random secret for session signing |
| `UPLOAD_DIR` | `./uploads` | Local file upload directory |

### Using PostgreSQL

1. Set up a PostgreSQL database
2. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/procedure_builder"
   ```
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio (DB UI) |
| `npm run db:reset` | Reset DB and re-seed |
| `npm run setup` | Full setup: install + db:push + db:seed |

---

## Docker Deployment (Internal Server)

### Single command

```bash
docker compose up -d
```

Open `http://<server-ip>:3000` from any machine on the network.

### Docker with custom port

```yaml
# docker-compose.yml
ports:
  - "8080:3000"   # Access at :8080
```

### Persistent data

The Docker setup uses named volumes for the SQLite database and uploaded files:
- `procedure_data` → `/app/data/prod.db`
- `procedure_uploads` → `/app/uploads/`

### Stopping / updating

```bash
docker compose down          # Stop
docker compose pull          # Pull updates
docker compose up -d --build # Rebuild and restart
```

---

## Architecture

```
src/
├── app/                     # Next.js App Router
│   ├── (dashboard)/         # Main app layout
│   │   ├── procedures/      # Procedure list + create
│   │   ├── builder/[id]/    # Visual builder
│   │   ├── runner/[runId]/  # Procedure runner
│   │   ├── export/[id]/     # PDF export preview
│   │   ├── runs/            # Run history
│   │   ├── settings/        # Theme & branding
│   │   └── analytics/       # Dashboard analytics
│   └── api/                 # REST API routes
├── components/
│   ├── builder/             # Builder panels + blocks
│   ├── runner/              # Runner components
│   ├── procedures/          # List + create forms
│   ├── export/              # PDF export shell
│   ├── settings/            # Theme settings
│   ├── layout/              # Sidebar + topbar
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── utils.ts             # Shared utilities
│   └── block-registry.ts    # All 40+ block type definitions
├── store/
│   └── builder-store.ts     # Zustand builder state
└── types/
    └── index.ts             # TypeScript types
```

---

## Block Types Reference

### Content & Structure
`section_header` `subsection` `rich_text` `instruction` `warning` `divider` `quote` `link` `image` `logo` `file_reference` `table`

### Input & Execution
`checklist_item` `checklist_group` `text_field` `long_text` `number_field` `date_field` `datetime_field` `dropdown` `multi_select` `yes_no` `signature` `file_upload` `evidence_upload` `url_input` `email_input`

### Workflow & Logic
`condition` `branching` `approval` `dependency` `review` `stop_hold` `decision`

### Utility & Run Sheet
`timer` `stopwatch` `countdown` `manual_duration` `assigned_owner` `due_date` `progress_marker` `completion_checkpoint`

---

## Data Model

```
Workspace
  └── WorkspaceTheme
  └── Users
  └── Tags
  └── Procedures
        └── ProcedureVersions
              └── ProcedureSections
                    └── ProcedureBlocks (JSON content/style/validation/logic)
        └── ProcedureRuns
              └── RunBlockValues
              └── RunAttachments
              └── Comments
              └── Approvals
```

---

## Versioning Rules

- New procedures start as **draft version 1**
- Draft versions are fully editable in the builder
- Clicking **Publish** freezes the version — no further edits
- Clicking **New Draft** on a published procedure creates version N+1
- Runs always reference a specific published version

---

## Running on a Work Computer (No Domain Required)

This app is designed to work on `localhost` or any internal IP:

1. Run `npm run dev` on your machine → access at `http://localhost:3000`
2. Or use Docker on a shared internal server → access at `http://192.168.x.x:3000`
3. No public domain, no HTTPS certificates, no cloud services required
4. All data stays on your machine or internal server

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React + Tailwind CSS + shadcn/ui |
| Drag & Drop | dnd-kit |
| State | Zustand |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Database | Prisma + SQLite (or PostgreSQL) |
| Export | Browser Print / CSS print styles |
