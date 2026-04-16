# SchoolNest — Claude Code Project Guide

## Architecture

Two microservices, two databases, deployed on two Render accounts:

```
auth-service      (port 3000) → auth_db      (roles, users, token_blacklist)
academic-service  (port 4002) → academic_db  (everything else)
```

Production URLs:
- Auth:     https://schoolnest-auth.onrender.com
- Academic: https://schoolnest-academic.onrender.com

## Database Migrations — MANUAL ONLY

Migrations are NOT auto-run on startup. Do NOT add auto-migration to server.js.

### Fresh deploy (new DB)
```bash
# 1. Base schema (teacher/parent tables + announcements + exams + fees)
psql <academic_db> < academic-service/schema.sql

# 2. Admin tables (teacher_records, admissions, drivers, staff, assignments, etc.)
psql <academic_db> < academic-service/migrations/001_admin_tables.sql

# 3. Auth schema
psql <auth_db> < auth-service/schema.sql
```

schema.sql is kept in sync with the live DB — it already includes changes from migrations 002-013. So for a fresh deploy, only schema.sql + 001_admin_tables.sql are needed.

### Existing DB (adding a new column or table)
Write an ALTER TABLE in a new migration file (e.g. `014_add_xyz.sql`), then:
```bash
# Run manually against Render
PGPASSWORD='<password>' psql -h <host> -U <user> -d <db> -f migrations/014_add_xyz.sql

# Also update schema.sql to match so fresh deploys stay consistent
```

### Migration files (academic-service/migrations/)
- 001_admin_tables.sql — all admin tables (foundation)
- 002-013 — historical announcements schema changes (already baked into schema.sql)

## Seed Scripts (repo root)

Run from repo root. All idempotent (safe to rerun).

```bash
# 1. Reference data (roles, classes, departments, blood groups, etc.)
node seed-all.js

# 2. Test login accounts (2 teachers, 2 parents, 3 students, 2 classes)
node seed-test-users.js

# 3. Full demo data (every dashboard populated — enquiries, admissions, attendance, homework, exams, fees, etc.)
node seed-demo-full.js
```

### Running against Render (from local machine)
```bash
set -a && source auth-service/.env.production && set +a
ACADEMIC_DB_HOST=dpg-d7ed0dnaqgkc73fv3o8g-a.singapore-postgres.render.com \
  node seed-demo-full.js
```
Both DB hosts need EXTERNAL hostnames when connecting from outside Render.

## Login Credentials (school_id=101)

```
admin@schoolnest.com              / Admin@123
teacher1@schoolnest.com           / Teacher@123
teacher2@schoolnest.com           / Teacher@123
parent1@schoolnest.com            / Parent@123
parent2@schoolnest.com            / Parent@123
admission1.parent@schoolnest.com  / Parent@123
admission2.parent@schoolnest.com  / Parent@123
admission3.parent@schoolnest.com  / Parent@123
admission4.parent@schoolnest.com  / Parent@123
```

## Render Environment — Two Accounts

Services and DBs are split across two Render Gmail accounts:
- Account 1 (auth gmail): auth_db only
- Account 2 (academic gmail): auth-service + academic-service + academic_db

Cross-account DB connections MUST use external hostnames (.singapore-postgres.render.com) with SSL enabled. Same-account connections use internal hostnames (no .render.com suffix).

## Key Design Decisions

- Teacher identity: UUID in teacher_records.id = auth_db.users.id (VARCHAR 50)
- Bridge 1: admin creates teacher → auto-creates auth user (same UUID)
- Bridge 2: admin approves admission → auto-creates student row + parent auth user
- Bridge 3: class assignment → syncs denormalized classes table for teacher/parent modules
- Common-api dropped entirely — reference tables live in academic_db with school_id for multi-tenancy
- Master-data CRUD at /api/v1/academic/admin/lookups/{resource} replaces old common-api endpoints

## Node Version

Code avoids optional chaining (?.) for Node 12 compatibility. Dependencies node-cron@2 and uuid@8 are pinned for the same reason.
