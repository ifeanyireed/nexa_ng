# NETS ERP Performance Review App Slugs

This file maps the frontend page routes (slugs), their respective file paths in the codebase, and a brief description of their functionality.

## Frontend Pages

| URL / Slug | Codebase Path | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | User login & landing screen | Public |
| `/employee` | `src/app/employee/page.tsx` | Employee home dashboard (active reviews and notifications) | Employee |
| `/employee/profile` | `src/app/employee/profile/page.tsx` | Employee details and review history chart | Employee |
| `/employee/reviews` | `src/app/employee/reviews/page.tsx` | List of review cycles | Employee |
| `/employee/reviews/[id]` | `src/app/employee/reviews/[id]/page.tsx` | Performance review self-assessment form | Employee |
| `/manager` | `src/app/manager/page.tsx` | Line manager overview dashboard (team progress and metrics) | Manager |
| `/manager/review/[employeeId]` | `src/app/manager/review/[employeeId]/page.tsx` | Manager evaluation review form for a team member | Manager |
| `/hr` | `src/app/hr/page.tsx` | HR auditor home dashboard (completion queue and department progress) | HR |
| `/hr/review/[employeeId]` | `src/app/hr/review/[employeeId]/page.tsx` | HR auditor feedback and sign-off panel | HR |
| `/hr/cycle` | `src/app/hr/cycle/page.tsx` | Review cycle creation and timeline management | HR |
| `/hr/objectives` | `src/app/hr/objectives/page.tsx` | Objective and Core Competencies management (KPIs, weights, categories) | HR |
| `/hr/users` | `src/app/hr/users/page.tsx` | User list and roles directory | HR |
| `/md` | `src/app/md/page.tsx` | Executive MD home dashboard (company KPIs and department comparison stats) | MD |
| `/md/department/[deptId]` | `src/app/md/department/[deptId]/page.tsx` | Executive breakdown of department performance details | MD |

## Backend API Endpoints (Go REST API)

* API Location: `backend/main.go`

| Endpoint | Method | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/users` | `GET` | `?id=<id>` (optional) | Retrieves all users or a specific user by ID |
| `/users` | `POST`/`PUT` | Request body JSON | Creates/Updates user details |
| `/objectives` | `GET` | None | Retrieves all active performance and competency objectives |
| `/objectives` | `POST` | Request body JSON | Creates or updates an objective/competency details |
| `/objectives` | `DELETE` | `?id=<id>` | Deletes an objective by ID |
| `/cycles` | `GET` | None | Retrieves all review cycle timelines |
| `/cycles` | `POST`/`PUT` | Request body JSON | Creates or updates review cycle details |
| `/reviews` | `GET` | `?employeeId=<id>` or `?id=<revId>` | Retrieves evaluations |
| `/reviews` | `POST`/`PUT` | Request body JSON | Creates or updates evaluation scores and comments |
| `/seed` | `POST` | None | Drops database tables and seeds them with fresh mock data |
