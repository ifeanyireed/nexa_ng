# NETS ERP Performance Review Implementation Progress Tracker

This tracker monitors the status of each page screen and the corresponding backend services (Prisma schema models, routing, API CRUD handlers, and seeding scripts) required to support it.

## Live Database Fetch Checklist

All pages utilizing the ERP Store are now fully integrated with dynamic backend fetches and updates. Below is the verification checklist:

- [x] **Login & Landing Page (`/`)** - Dynamically fetches and matches user directory data from database endpoint `/users`.
- [x] **Employee Dashboard (`/employee`)** - Dynamically fetches active review and timeline details from `/reviews?employeeId=...`.
- [x] **My Performance Reviews (`/employee/reviews`)** - Dynamically fetches active performance review cycles from `/cycles`.
- [x] **Performance Review Form (`/employee/reviews/[id]`)** - Dynamically loads evaluation details, populates categorized objectives, and submits evaluations to `/reviews` (`POST`/`PUT`).
- [x] **Employee Profile (`/employee/profile`)** - Fetches personal user metrics and details dynamically from `/users?id=...`.
- [x] **Line Manager Dashboard (`/manager`)** - Fetches list of reviews and user directories dynamically from `/reviews` and `/users`.
- [x] **Manager Review Screen (`/manager/review/[employeeId]`)** - Loads employee answers, self-scores, and competency categories, and updates manager scores and feedback to `/reviews` (`PUT`).
- [x] **HR Dashboard (`/hr`)** - Dynamically fetches reviews progress, department averages, and completion stats from `/reviews`.
- [x] **HR Review Screen (`/hr/review/[employeeId]`)** - Dynamically audits evaluations and writes sign-offs or returns review forms to `/reviews`.
- [x] **Review Cycle Management (`/hr/cycle`)** - Creates, updates status, and publishes active cycle timelines to `/cycles`.
- [x] **Objective Management (`/hr/objectives`)** - Performs dynamic CRUD actions on performance items (added/updated items synced to `/objectives` via `POST`, and deleted items synced via `DELETE`).
- [x] **User & Role Management (`/hr/users`)** - Fetches and manages global user list directory dynamically from `/users`.
- [x] **Admin Dashboard (`/admin`)** - Manages bulk email campaigns and password reset token dispatches dynamically.
- [x] **MD Dashboard (`/md`)** - Fetches overall stats and computes company-wide department comparison charts dynamically using live `/reviews` and `/users` data.
- [x] **Department Performance (`/md/department/[deptId]`)** - Dynamically queries department-specific performance scores from `/reviews`.

---

## 1. Core Database Schema & API Setup

| Service / Module | Component Details | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Prisma Schema** | `User`, `ReviewCycle`, `Objective`, `PerformanceReview` models | **[100% COMPLETED]** | Saved in [schema.prisma](file:///Users/user/Downloads/nets_erp/backend/prisma/schema.prisma) and pushed to Hostinger DB. |
| **API Router** | `backend/main.go` and separated handler files REST routing | **[100% COMPLETED]** | Routes request URI paths to corresponding CRUD handler functions. |
| **MySQL Seeder** | `/seed` API route for truncating and inserting mock ERP data | **[100% COMPLETED]** | Seeds users, cycles, classified objectives, and evaluations in Hostinger MySQL. |

---

## 2. Frontend Page & Backend Endpoint Progress Matrix

### 👤 Employee Views

#### Login & Landing Page (`/`)
* **Frontend File:** `src/app/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/users` (`GET` with ID / email verification)
  * Handler: `handleUsers` in [user_handlers.go](file:///Users/user/Downloads/nets_erp/backend/user_handlers.go)
  * Database: `User` model table query

#### Employee Dashboard (`/employee`)
* **Frontend File:** `src/app/employee/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews?employeeId=<id>` (fetch active evaluations)
  * Handler: `handleReviews` in [review_handlers.go](file:///Users/user/Downloads/nets_erp/backend/review_handlers.go)
  * Database: `PerformanceReview` model table query

#### My Performance Reviews Timelines (`/employee/reviews`)
* **Frontend File:** `src/app/employee/reviews/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/cycles` (fetch available performance evaluation windows)
  * Handler: `handleCycles` in [cycle_handlers.go](file:///Users/user/Downloads/nets_erp/backend/cycle_handlers.go)
  * Database: `ReviewCycle` model table query

#### Performance Self-Assessment Form (`/employee/reviews/[id]`)
* **Frontend File:** `src/app/employee/reviews/[id]/page.tsx` (uses `ReviewDetailClient.tsx`)
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews` (`GET` to load, `POST`/`PUT` to submit evaluations and comments)
  * Handler: `handleReviews` (saves JSON stringified objective evaluations)
  * Database: `PerformanceReview` updates
* **UI Features Added:** Category badges (e.g. Behavioural, Technical) display next to each core competency rating.

#### Employee Profile (`/employee/profile`)
* **Frontend File:** `src/app/employee/profile/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/users?id=<id>` (load personal profile info and performance trends)
  * Handler: `handleUsers`

---

### 👥 Line Manager Views

#### Line Manager Dashboard (`/manager`)
* **Frontend File:** `src/app/manager/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews` (fetch reviews of subordinate team members) and `/users` (fetch manager's team details)
  * Handlers: `handleReviews`, `handleUsers`

#### Manager Evaluation Screen (`/manager/review/[employeeId]`)
* **Frontend File:** `src/app/manager/review/[employeeId]/page.tsx` (uses `ManagerReviewClient.tsx`)
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews` (`PUT` to submit manager score ratings, overall comments, and approve/return)
  * Handler: `handleReviews` (performs score calculations and state updates)
* **UI Features Added:** Display of color-coded competency category tags next to expected rating levels.

---

### ⚙️ HR & Admin Views

#### HR Dashboard (`/hr`)
* **Frontend File:** `src/app/hr/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews` (fetch completion statistics and pending HR verification queue)
  * Handler: `handleReviews`

#### HR Review / Audit Screen (`/hr/review/[employeeId]`)
* **Frontend File:** `src/app/hr/review/[employeeId]/page.tsx` (uses `HRReviewClient.tsx`)
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews` (`PUT` to record final HR sign-off comments and approve or reject)
  * Handler: `handleReviews`
* **UI Features Added:** Shows competency category badges inline on the review card during the audit process.

#### Review Cycle Management (`/hr/cycle`)
* **Frontend File:** `src/app/hr/cycle/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/cycles` (`GET` to list, `POST` to create draft cycles, `PUT` to activate/close cycle timelines)
  * Handler: `handleCycles`
  * Database: `ReviewCycle` table modifications

#### Objective Management (`/hr/objectives`)
* **Frontend File:** `src/app/hr/objectives/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/objectives` (`GET` to fetch, `POST` to upsert, `DELETE` to delete)
  * Handler: `handleObjectives` in [objective_handlers.go](file:///Users/user/Downloads/nets_erp/backend/objective_handlers.go)
  * Database: `Objective` table mutations
* **UI Features Added:** Swapped layout (Objective Type is now above Weight), integrated Competency Category select picker, added target department checkbox selectors for work objectives, bulk split-by-comma multi-objective insertion, filter list dropdown by department, and an inline `+ Add Dept` dynamic creator.

#### User & Role Management (`/hr/users`)
* **Frontend File:** `src/app/hr/users/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/users` (`GET` to list directory, `POST` to edit/assign roles)
  * Handler: `handleUsers`

#### Admin Dashboard (`/admin`)
* **Frontend File:** `src/app/admin/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoints: `/send-reset-email` (`POST`), `/send-bulk-notification` (`POST`)
  * Handler: `handleSendResetEmail`, `handleSendBulkNotification` in [email_handlers.go](file:///Users/user/Downloads/nets_erp/backend/email_handlers.go)

---

### 📊 MD (Managing Director) Views

#### MD Dashboard (`/md`)
* **Frontend File:** `src/app/md/page.tsx`
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews` and `/users` (calculates averages, company-wide scores, top/low performers)
  * Handlers: `handleReviews`, `handleUsers`

#### Department Performance Breakdown (`/md/department/[deptId]`)
* **Frontend File:** `src/app/md/department/[deptId]/page.tsx` (uses `DepartmentPerformanceClient.tsx`)
* **Status:** **[100% COMPLETED]**
* **Backend Services Needed:**
  * Endpoint: `/reviews` (filtered by target department identifier)
  * Handler: `handleReviews`
