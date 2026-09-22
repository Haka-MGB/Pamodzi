# Pamodzi Landlord Portal — System Report

## 1. Executive summary

Pamodzi is a landlord operations portal built in Next.js with a Supabase-backed data layer. The system is designed to let a landlord manage a portfolio of properties, tenants, units, payments, maintenance issues, and portfolio reporting from a single dashboard.

From the actual code, the project is not a generic SaaS starter or a demo app. It is a workflow-oriented property management system with:

- user registration and login
- property and unit management
- tenant lifecycle tracking
- rent collection tracking
- maintenance issue tracking
- reporting and dashboard analytics
- per-user access control via Row Level Security

The application is built around the idea that each logged-in landlord owns their own records and should only see their own data.

---

## 2. What the app is built to do

The code clearly defines the application as a property management platform for landlords.

### Core business functions

1. Manage properties
   - Create, update, and delete properties
   - Track location, type, occupancy, unit total, and monthly revenue
   - Maintain portfolio-level summary metrics

2. Manage units inside properties
   - Track individual units by property
   - Record rent amount, bedrooms, bathrooms, floor, notes, and occupancy state
   - Link a unit to a current tenant when occupied

3. Manage tenants
   - Create tenant records with contact details, rent, lease dates, and status
   - Link each tenant to a property and a unit
   - Track active, overdue, and vacating states

4. Track rent payments
   - Store payment amount, method, period, reference, and status
   - Mark pending, paid, or overdue payments
   - Confirm payments from the UI

5. Manage maintenance requests
   - Create maintenance issues with title, category, priority, assignee, and status
   - Attach issues to a tenant and unit
   - Move work orders through lifecycle states

6. Provide dashboards and reporting
   - Show total portfolio numbers
   - Summarize active tenants, revenue, payment status, and issues
   - Show charts and alerts for landlord operations

7. Keep data isolated per landlord
   - Each record is tied to an owner_id
   - Reads and writes are restricted to the authenticated user

---

## 3. Code-backed architecture

### Frontend application layer
The main front-end state is managed in [context/AppContext.tsx](context/AppContext.tsx). This file is the central runtime for:

- authentication state
- user session handling
- portfolio data loading
- add/update/delete operations for properties, tenants, units, payments, and issues
- notification and toast state
- dashboard computations

The app starts with empty defaults and does not rely on demo/mock data at startup, which is an important signal that the system expects real user-created data after login.

### API layer
The app uses Next.js route handlers under [app/api](app/api) for all backend operations.

Examples:

- [app/api/auth/login/route.ts](app/api/auth/login/route.ts) handles login
- [app/api/auth/register/route.ts](app/api/auth/register/route.ts) handles account creation
- [app/api/properties/route.ts](app/api/properties/route.ts) creates properties
- [app/api/tenants/route.ts](app/api/tenants/route.ts) creates tenants
- [app/api/payments/route.ts](app/api/payments/route.ts) creates payments
- [app/api/issues/route.ts](app/api/issues/route.ts) creates maintenance issues
- [app/api/app-data/route.ts](app/api/app-data/route.ts) aggregates portfolio data

These APIs are the system boundary between the UI and storage.

### Server-side database layer
The primary data access layer is in [lib/server/db.ts](lib/server/db.ts).

This file maps database rows to application objects and vice versa. It contains the actual logic for:

- user lookup and creation
- property CRUD
- tenant CRUD
- payment CRUD
- issue CRUD
- unit CRUD
- property summary recalculation
- app data assembly for dashboards

This is the real backbone of the app.

### Types and data model
The database contract is defined in [types/supabase.ts](types/supabase.ts). This file defines table columns for:

- users
- properties
- tenants
- units
- payments
- issues
- notifications
- activity
- revenue_data

This is important because it tells us the code expects a normalized relational schema, not a single flat file or ad hoc storage model.

---

## 4. Data model the code expects

Based on the application code and database types, the schema is organized as follows:

### users
Stores the landlord account.
Required fields include:

- id
- name
- email
- role
- location
- phone
- company
- initials
- password_hash

### properties
Each landlord can own many properties.
Required data includes:

- id
- owner_id
- name
- location
- type
- total_units
- occupied_units
- monthly_revenue

### tenants
Each tenant belongs to a property and generally occupies a unit.
Required data includes:

- id
- owner_id
- name
- initials
- unit
- property_id
- property_name
- rent
- lease_start
- lease_end
- status
- email
- phone
- nrc
- sex

### units
Units are tracked separately from tenants and linked to properties.
Required fields include:

- id
- owner_id
- property_id
- unit_name
- unit_number
- floor
- bedrooms
- bathrooms
- square_feet
- rent_amount
- status
- tenant_id
- notes

This is a good example of how the system distinguishes between a physical unit and the person occupying it.

### payments
Rent/payment entries are related to a tenant and associated with a unit.
Required fields include:

- id
- owner_id
- tenant_id
- tenant
- unit
- amount
- method
- ref
- status
- date
- period

### issues
Maintenance and work-order records are attached to a tenant and unit.
Required fields include:

- id
- owner_id
- title
- description
- tenant
- tenant_id
- unit
- category
- status
- priority
- date
- assignee
- icon

### notifications and activity
These are operational feed records for UI activity and alerts.

### revenue_data
This table supports dashboard and reporting calculations for monthly summaries.

---

## 5. Auth and user flow

### Registration flow
The registration route in [app/api/auth/register/route.ts](app/api/auth/register/route.ts) validates input and calls the account creation logic in [lib/server/db.ts](lib/server/db.ts).

The app does not ship with a built-in seeded landlord account as a normal runtime behavior. The schema cleanup in [scripts/setup-supabase.sql](scripts/setup-supabase.sql) confirms that users are meant to be created through the application flow.

### Login flow
The app uses an authentication flow that validates credentials and creates a session cookie. The session logic is configured in the server utilities, and the app checks auth state from the session endpoint.

### Session model
The application tracks whether a user is logged in and populates the dashboard from the protected app-data endpoint. If there is no valid session, the UI stays in a logged-out state.

---

## 6. What the system does in practice

### Dashboard
The dashboard page in [app/(dashboard)/dashboard/page.tsx](app/(dashboard)/dashboard/page.tsx) compiles summary metrics such as:

- active tenants
- paid, pending, and overdue payments
- open and urgent maintenance issues
- occupancy and revenue totals

### Property management
The property page is centered on:

- creating property records
- listing units by property
- editing occupancy details
- updating revenue and summary totals

### Tenant management
The tenant workflow supports:

- tenant profile creation
- assignment to a property and unit
- lease dates and status tracking
- income relationship with payments

### Payment management
The payment module tracks:

- due/paid/overdue status
- payment method
- reference numbers
- dates and periods

### Maintenance queue
The maintenance page is built for:

- issue intake
- categorization
- priority tracking
- work-order status update

### Reports
The reporting area aggregates data for the landlord to understand portfolio trends and health across time.

---

## 7. Security and access control

The project includes explicit security patterns:

- password hashing via bcrypt
- secure session cookies
- row-level security on database tables
- per-user owner_id ownership checks
- production secret requirement for session configuration
- host restrictions in the Next.js config

The main security-related files are:

- [lib/server/config.ts](lib/server/config.ts)
- [lib/server/session.ts](lib/server/session.ts)
- [lib/server/password.ts](lib/server/password.ts)
- [supabase-complete-rls-policies.sql](supabase-complete-rls-policies.sql)
- [supabase-rls-policies.sql](supabase-rls-policies.sql)

These show that the design intent is to restrict each landlord to only their own records.

---

## 8. Hardcoded users: actual status

This is the most important fact for the clean setup question.

### What is not present in the app runtime
The application code does not include a built-in landlord account as part of normal app startup. The app requires registration, and the cleaned schema script in [scripts/setup-supabase.sql](scripts/setup-supabase.sql) intentionally does not seed any user.

### What does still exist
There are local/test scripts that reference example credentials, such as:

- [scripts/sanity-check.js](scripts/sanity-check.js)

This is a local verification script, not production application logic. It uses a sample login like `testuser@example.com` and `password123` for an automated smoke test. That is not the same as a hardcoded production user in the app itself.

So the accurate statement is:

- the application is designed to create users at runtime
- the shipped schema is clean and avoids seed-user creation
- one local smoke script still contains example credentials for testing convenience

---

## 9. Deployment and operational readiness signal

The project is not just a mock UI. It is a functional Next.js application with real API routes and a relational data model. The project is organized for real usage, but deployment readiness still depends on environment configuration and hosting setup.

The most relevant operational files are:

- [package.json](package.json)
- [next.config.js](next.config.js)
- [lib/server/config.ts](lib/server/config.ts)
- [scripts/setup-supabase.sql](scripts/setup-supabase.sql)
- [README.md](README.md)

The codebase is structured as a real property management system rather than a toy prototype.

---

## 10. Bottom line

Pamodzi is a landlord-focused property management system with the following real scope:

- property and unit management
- tenant onboarding and lease tracking
- payment tracking and confirmations
- maintenance issue management
- reporting and dashboard summary views
- secure, per-user access control

The clean setup is intended to create user accounts through the application instead of embedding a default user in the database. The project is therefore built for real operational use, with a clean auth model and data isolation plan.
