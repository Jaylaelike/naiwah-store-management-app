# Feature Plan

## Feature 1: Statistical Dashboard Page (Analytics)

### Goal
Add a dedicated data analytics dashboard with rich statistical visualizations
including bar charts, pie charts, radial charts, and KPI summary cards.

### Route
`/statistics` → `src/app/(dashboard)/statistics/page.tsx`

### Components
| Component | Description |
|-----------|-------------|
| `stats-overview-cards.tsx` | 6 KPI cards: Total Users, Revenue, Orders, Conversion Rate, Avg Session, Bounce Rate |
| `traffic-sources-chart.tsx` | Pie/donut chart — traffic by source (Direct, Organic, Social, Referral, Email) |
| `revenue-bar-chart.tsx` | Bar chart — monthly revenue comparison (current vs previous year) |
| `user-activity-chart.tsx` | Radial bar chart — user activity by day of week |
| `top-pages-table.tsx` | Data table — top pages by visits, bounce rate, avg time |

### Data
- Static JSON data in `./data/` directory (same pattern as dashboard-1 & dashboard-2)
- `statistics-data.json` — monthly revenue data
- `traffic-sources-data.json` — traffic breakdown
- `user-activity-data.json` — weekly activity
- `top-pages-data.json` — page analytics

### Sidebar Entry
Under "Dashboards" group → "Statistics" with `BarChart3` icon

---

## Feature 2: Backup & Restore Page (Admin)

### Goal
Admin page to backup/export and restore/import the SQLite database file,
with backup history table showing past backups.

### Route
`/backup` → `src/app/(dashboard)/backup/page.tsx`

### Components
| Component | Description |
|-----------|-------------|
| `backup-actions.tsx` | Card with "Create Backup" and "Restore from File" buttons |
| `backup-history-table.tsx` | Table showing backup history (filename, date, size, status, actions) |
| `backup-status-card.tsx` | Status card: last backup time, DB size, auto-backup toggle |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/backup/create` | POST | Creates a SQLite backup, returns download URL |
| `/api/backup/restore` | POST | Accepts uploaded .sqlite/.db file to restore |
| `/api/backup/list` | GET | Returns backup history |
| `/api/backup/download/[id]` | GET | Downloads a specific backup file |

### Sidebar Entry
Under new "Admin" group → "Backup & Restore" with `DatabaseBackup` icon

---

## Implementation Order
1. ✅ Create planning docs
2. Create Statistical Dashboard (page + components + data + sidebar)
3. Create Backup & Restore (page + components + API routes + sidebar)
4. Update sidebar navigation for both features
