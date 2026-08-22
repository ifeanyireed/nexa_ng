# NETS ERP KPI Seeding Plan (extracted from NETS KPI Booklet.pdf)

Below is the structured plan to seed the database with real Key Performance Indicators (KPIs) extracted from the provided PDF, mapped to the six categories and specific departments.

## 1. Mapped KPIs by Department & Role

### A. Human Resources Department (Target Departments: `HR`, `All`)
* **Category: Role Specific** (Assigned to: `HR`)
  * **Turnover Target:** Reduce overall employee turnover rate to 10% or less within 12 months (Weight: 20%)
  * **Onboarding & Recruitment:** Ensure 100% confirmation letter delivery in first week of 7th month, onboarding within one week (Weight: 15%)
  * **Payroll Accuracy:** Achieve payroll accuracy rate of 99.5% or better, with under 0.5% processing errors (Weight: 25%)
* **Category: Leadership** (Assigned to: `HR`)
  * **Conflict Resolution:** Resolve 90% of employee grievances within 5 working days, achieve conflict resolution rate of 90% or better (Weight: 20%)
* **Category: Culture** (Assigned to: `All` / `HR`)
  * **Employee Engagement:** Increase employee engagement survey score to 75% or higher by the end of year (Weight: 20%)

### B. Finance Department (Target Departments: `Finance`)
* **Category: Role Specific**
  * **Cost Control:** Reduce operating costs by 10% through process optimization and vendor negotiations (Weight: 25%)
  * **Imprest Management:** Ensure 100% of approved petty cash payment requests are paid within 24 hours (Weight: 25%)
  * **Statutory Remittance:** Timely and accurate payment of PAYEE, Pension, VAT, WHT deductions before deadline (Weight: 25%)
  * **Invoicing cycle:** Prepare invoices for corporate clients within 48 hours of receiving PO (Weight: 25%)

### C. Legal Department (Target Departments: `Legal`)
* **Category: Role Specific**
  * **Contract Execution:** Review and execute contractual agreements within a 72-hour timeline (Weight: 40%)
  * **Drafting Agility:** Maintain a draft accuracy rate of 95% or better with legal documents reviewed in 24 hours (Weight: 30%)
* **Category: Culture**
  * **Regulatory Compliance:** Maintain a regulatory compliance rate of 100% with no material fines or penalties (Weight: 30%)

### D. Marketing Department (Target Departments: `Marketing`)
* **Category: Role Specific**
  * **Customer Acquisition:** Increase customer acquisition rate by 10% through targeted marketing campaigns (Weight: 40%)
  * **Brand Visibility:** Increase brand awareness by 15% and social media engagement (likes/shares/comments) by 20% (Weight: 30%)
  * **Budget Management:** Adhere to allocated marketing budget with under 5% variance (Weight: 30%)

### E. Operations Department (Target Departments: `Operations`)
* **Category: Role Specific**
  * **Fleet Utilization:** Maintain an active fleet utilization rate of at least 90% and limit vehicle downtime under 5% (Weight: 40%)
  * **On-time Delivery:** Increase on-time delivery rate by 15% through route optimization and driver training (Weight: 30%)
* **Category: Behavioural**
  * **Safety First:** Reduce fleet accident rates by 20% within the next 12 months (Weight: 30%)

### F. Kings House Learning Center / KHLC (Target Departments: `KHLC`)
* **Category: Role Specific**
  * **Class Delivery:** Ensure timely execution of all learning programmes by delivering >=95% of classes (Weight: 40%)
  * **Resource Adherence:** Ensure instructors use lesson plans 100% of the time during teaching sessions (Weight: 30%)
* **Category: Self-Development**
  * **Instructor Skill-up:** Complete at least 2 professional courses annually to improve skills and coordination (Weight: 30%)

---

## 2. Database Action Plan
If you approve this plan, I will:
1. Update `backend/seed_handlers.go` inside the `handleSeed` function to insert these exact objectives into the Hostinger MySQL database.
2. Re-trigger the seed process to apply them.
3. Update the frontend's default store seeding values in `erp-store.ts` to match.
