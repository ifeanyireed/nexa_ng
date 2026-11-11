Right, just looking through the voting setup. Okay, so here's how I'd structure it inside your Ofia ERP. So, an awards and voting module where HR manages the event. So, create the end of year, set the categories, select nominees from your existing employee database, and publish them under each award type. Employees just go into their own dashboard, see the categories, and pick one nominee per category and submit. So, rules I would set, one vote per person per category, no self-voting, votes locked after submission unless HR opens edits, and keep results hidden until published. So your HR side needs a dashboard to create the event, set dates, add categories, pick nominees, and track results in real time. On the database side, you just add tables like award_events, award_categories, award_nominees, and award_votes, with tenant IDs if you're multi-company. You can reuse the same voting engine in future for other polls, not just the end-of-year awards.

I would build this as an Employee Awards & Voting module within the HR section of the Ofia ERP. It should be a self-service voting platform where HR manages the awards and employees participate directly from their existing employee dashboards.

The system should have two distinct interfaces: the HR administration interface and the employee voting interface.

## 1. HR administration dashboard

HR administrators should be able to create and manage an entire awards event.

A. Awards event management

- Create an awards event (e.g. 2026 End-of-Year Awards).
- Set event name, description, banner and award year.
- Configure opening and closing dates for voting.
- Publish, pause or close voting.
- View overall participation statistics.

B. Award categories

HR should be able to create unlimited award categories, for example:

| Award category             | Example nominees        |
| -------------------------- | ----------------------- |
| Employee of the Year       | Employee A, B, C        |
| Most Punctual Employee     | Employee D, E, F        |
| Best Team Player           | Employee G, H           |
| Most Innovative Employee   | Employee I, J           |
| Outstanding Leadership     | Employee K, L           |
| Best Performing Department | Operations, Finance, IT |

Each category should have:

- Category name.
- Description and award criteria.
- Nominee selection.
- Optional category image or icon.
- Maximum number of winners (normally one).
- Voting eligibility settings.

C. Nominee management

HR should be able to select nominees from the existing employee database rather than manually entering employee information.

Each nominee should display:

- Employee photograph.
- Full name.
- Department.
- Job title.
- Short nomination statement.

HR can add, remove or replace nominees before voting opens.

## 2. Employee voting dashboard

Employees should access the awards directly from their existing ERP dashboard.

2026 Employee Awards

Voting open

[10 Ways to Celebrate Employees and Boost Engagement — Bookkeeping - Human Resources - Medical Billing  | Salsbury & Co. | Vancouver, WA](https://images.openai.com/static-rsc-4/MMfRo8gobiTcb900ypuHeuL-virM2KDSA0BIWLyz_7MVSj_ggswUSc9JOvKx2Tyk4ILQeJXqJM_sKmdq9XKjhJwTh-pFt5cYOVOoePwg18av8neB5JitEZMBjggH4GTYdsYLc1N_ymUJyZZhv9OZE7VY5Mh8G9zqiR23xKI3rA4?purpose=inline)

[salsburyandco.com](https://salsburyandco.com/small-business-qa/10-ways-to-celebrate-employees?utm_source=chatgpt.com)

# Celebrate Excellence

Vote for colleagues who have made outstanding contributions this year.

6 award categories

Voting closes December 15

1\. Employee of the Year

Recognising exceptional performance and contribution.

[The Nigerian Economic Summit Group (NESG)](https://images.openai.com/static-rsc-4/9TYAVnCEbTNKcDt2U0fjspeQzJeShi4bb1tb_a6VJORS_MemJRMUQznvzhdKKnk96uD1nRtO9eMVxCi4aHyEms3sNlPqqyMSQNN6Sd_MUjJNL_cfo3BvtikrNvSv-vVvcfKBqUIEPxkonJaYgxVcfRA9xo1yyd9mBpARGdJ3tng?purpose=inline)

Nominee A

Finance Department

Selected

[Elite Computer Tech | #1 Computer Training & ICT Academy in Oyo Town, Oyo State, Nigeria](https://images.openai.com/static-rsc-4/vaFeZT6krTifTTT4hTROsV2SKOryFvcluESPaCrQeUHpMcHBTaqQIJmumXS9Ncy03epGvkS_GD9OU5TX9Mtj12RCHUU4TDBzgsbPmbwuLQkKAlh2lqqsBoB_KA-jUed6mmqHWneY-BvmnFILJ9bWqr7qqbgY4kWTZ0HFLox29go?purpose=inline)

Nominee B

Operations

Select nominee

Illustrative interface — actual nominees come from the employee database.

Submit votesEmployees can review their selections before submitting.

The employee experience should work as follows:

1. Employee logs into the ERP.
2. Opens HR → Employee Awards.
3. Sees the active awards event.
4. Opens each award category.
5. Reviews nominees and their profiles.
6. Selects one nominee per category.
7. Reviews all selections.
8. Submits votes.
9. Receives a confirmation that their votes have been recorded.

## 3. Voting rules and security

This is particularly important because employees should not be able to manipulate the results.

I recommend:

- One vote per employee per category.
- Employees cannot vote for themselves.
- Employees cannot vote twice in the same category.
- Employees can vote in some categories without necessarily completing every category.
- Employees cannot change submitted votes unless HR explicitly enables vote editing.
- Voting is restricted to active, eligible employees.
- Results remain hidden from employees until HR publishes them.
- HR can configure whether voting is anonymous.

My recommendation: Make voting anonymous by default. The system should retain an internal audit record confirming that an eligible employee voted, without exposing their individual choices to other employees or ordinary HR users.

## 4. HR results and analytics

HR should have a results dashboard showing:

- Total eligible employees.
- Total employees who have voted.
- Voting participation percentage.
- Votes received by each nominee.
- Leading nominees by category.
- Department-level participation.
- Uncompleted voting categories.

The system should support:

- Live results for authorised administrators.
- Exporting results to Excel/PDF.
- Finalising winners.
- Publishing the winners.
- Generating award certificates.

## 5. Suggested application structure

ERP → HR Module

Employee Awards

&#x20;Awards Events

&#x20;Award Categories

&#x20;Nominee Management

&#x20;Voting Management

&#x20;Results & Analytics

&#x20;Winners & Certificates

Employee Dashboard

&#x20;Cast Your Vote

&#x20;My Voting Status

&#x20;Published Winners

## 6. Database structure

I would introduce these tables into the existing ERP database:

| Table               | Purpose                            |
| ------------------- | ---------------------------------- |
| `award_events`      | Awards event configuration         |
| `award_categories`  | Individual award categories        |
| `award_nominees`    | Employees nominated for categories |
| `award_eligibility` | Employees eligible to vote         |
| `award_votes`       | Submitted votes                    |
| `award_results`     | Finalised category results         |
| `award_winners`     | Confirmed winners                  |
| `award_audit_logs`  | Administrative and voting activity |

All records should be tenant-scoped if the ERP supports multiple companies.

## 7. Additional features worth considering

Beyond the end-of-year awards, this can become a permanent HR feature:

- Monthly employee recognition.
- Employee of the month.
- Peer-to-peer nominations.
- Manager nominations.
- Department awards.
- Long-service awards.
- Annual performance recognition.

This gives the HR module a reusable employee engagement and recognition system rather than a one-off voting application.

One important architectural decision: I would keep the voting engine independent of the awards presentation. That way, HR can reuse the same engine for elections, staff representative selection, departmental polls and other internal voting exercises without rebuilding the functionality.

My recommendation is to build the end-of-year awards as the first implementation, with the underlying system designed for reuse.

Lemme just pull all that together for you. Yeah, I actually love that idea. I'd make three screens: so, HR admin setup, employee voting, and a results or hall of fame screen. First, the admin setup. HR creates the awards event, sets the dates, adds categories, picks nominees, reviews results. Second, the employee voting screen. Inside their normal ERP dashboard, they open "Awards", see categories, click one nominee per category, submit once, with confirmation. Third, this results or hall of fame screen, which I think should live permanently in the HR module, where employees can look back at this year's winners or even browse past years. Then, an optional public link, like awards.ofia.ng slash company name slash 2026, if you're okay with sharing outside the ERP. And don't forget graphics, like photos, departments, animations for the announcement screen, so the big day feels celebratory, not flat. Underneath, make sure results are finalized and locked before publishing, so nobody can tamper with them. I hope that brief gives your dev everything they need without guessing.

I actually think that is an excellent idea. I would go a step further and build a dedicated Awards Results & Hall of Fame screen within Ofia ERP, with an optional public display mode.

This gives the awards programme a life beyond the voting period. Employees can return later to see who won, revisit previous years and celebrate their colleagues.

I recommend three complementary screens.

## 1. Live awards results screen



Recommended

&#x20;For the awards day



This is a visually attractive screen that can be displayed on a large television, projector or conference-room screen during the end-of-year event.

2026 AWARDS

OFIA CORPORATE CELEBRATION

# Celebrating Excellence

[World Excellence Council | Global Recognition & Award Platform](https://images.openai.com/static-rsc-4/IKqqXURhGpFnjF7pn5jkVeXVpGrQZa8ZOmBpaHTGAqKenkWX431IEQsCDCX8KY1aLrVQhrpGQ8sQWmSc6O7kXFLxY8gbbHpGdD1MWK7CgfmW-Zw-mPKOIE-kBwSGUvPFPqJxLg24zkeeIhvqATXWUkySHQ77V8LvnR482KZO5vk?purpose=inline)

[worldexcellencecouncil.com](https://worldexcellencecouncil.com/?utm_source=chatgpt.com)

# Employee of the Year

[Godwin Ezekiel - Data Analyst - Skymit Motors | XING](https://images.openai.com/static-rsc-4/gAt_eCbT2Tk6eMLUAza3YAv2XrBa7CBPPEaSTCOH_9cHIpit8VjnT4GDDXHAXET5sdYwzBGUfZqR4sZiK0FHsUwUyOlrYRVEvfH8bBsadrSkDTM-qb998gxpQgC4DTJygZ3IFdvkJ37vNxe_5DHVVjXFmb8r3Iy9NYkSupdR7KE?purpose=inline)

# Winner's Name

2026 AWARD WINNER

Other category winners

Best Team Player

Winner's Name

Most Innovative

Winner's Name

Most Punctual

Winner's Name

Illustrative design concept — actual winners populate this screen.

Features:

- Full-screen presentation mode.
- Company branding and awards graphics.
- Category-by-category winner announcements.
- Winner photographs and departments.
- Animated winner reveals.
- Optional countdown to the next category.
- Automatic transition between categories.
- Keyboard or remote-control navigation.
- Manual presenter controls.

I would make this screen accessible through a dedicated presentation URL generated by the ERP.

## 2. Awards Results Portal

For employees to revisit at any time.

This is a permanent page accessible from the employee dashboard.

Employees should see:

- Current year's awards.
- All published winners.
- Award categories.
- Winner photographs.
- Departments and designations.
- Award descriptions.
- Previous years' awards.

The page should have a year selector.

For example:

# Awards Hall of Fame

Recognising the people who make us exceptional.

202620252024

Employee of the Year

[Our Leadership – Waltersmith](https://images.openai.com/static-rsc-4/41eI0qAxS8JS2M3s41bzoW2jD2xrL6G5A6LULfhufnwrG0wjfCRL0tBHFwCz-e83jFeqGNCvAY4y-5p0IyBbMO4u7DVjmHw56Foi13q3ymvZ96DR0VvUmuOYA05qU3Oc9EIaikylvyGY9X_UXKsX9nh07LN9IWr9g38RSXs_OF4?purpose=inline)

[waltersmithng.com](https://waltersmithng.com/our-leadership/?utm_source=chatgpt.com)

## Award Winner

2026 · Outstanding contribution

Best Team Player

Winner profile

Most Innovative

Winner profile

Illustrative portal preview, not actual award records.

Employees can revisit this page throughout the year, even after the voting event has closed.

## 3. Public display screen

This is slightly different from the employee portal.

I would allow HR to generate a public, read-only link that can be opened without logging into the ERP.

Possible URL structure:

- `awards.ofia.ng/company-name/2026`
- Or a dedicated company-branded route within the ERP.

This can be shared on:

- Company WhatsApp groups.
- Internal newsletters.
- Company websites.
- LinkedIn and other social media.
- Digital signage in company offices.

However, the public portal must only expose information explicitly approved for publication. It should never expose individual voting records, employee IDs, confidential participation data or unpublished results.

## 4. Additional HR screens to include

I would add these screens to the implementation brief:

| Screen                  | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| Awards Presentation     | Full-screen event-day presentation             |
| Results Portal          | Permanent employee-facing results              |
| Hall of Fame            | Historical awards archive                      |
| Winner Profiles         | Individual winner biographies and achievements |
| Public Results Settings | Configure public visibility and sharing        |
| Presentation Controls   | HR controls for live announcements             |

## 5. Important implementation decision

Separate the voting results from the presentation layer.

The voting engine should calculate and securely finalise the results. The presentation layer should only consume approved, published results.

That way:

- HR can conduct voting privately.
- HR can verify and approve the results.
- Winners can be announced at the physical event.
- Employees can revisit the results afterwards.
- Previous years remain accessible.

I would also support a manual announcement mode. For example, HR can have all winners finalised but reveal each category individually during the ceremony.

My recommendation: Make the Awards Hall of Fame a permanent feature of the HR module, not just a temporary end-of-year voting page. The presentation screen and public results page should be different viewing modes of the same awards data.

This turns a simple voting feature into a reusable employee recognition platform.