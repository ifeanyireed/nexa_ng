# OFIA — REDIS INFRASTRUCTURE AUDIT, ARCHITECTURE AND IMPLEMENTATION ACROSS ALL MICROSERVICES

## 1. Project objective

Conduct a comprehensive technical audit of Ofia's existing infrastructure and implement a properly structured Redis integration across all six microservices.

The objective is not simply to install Redis or add caching to a few API endpoints.

The objective is to establish a reliable, scalable, secure and maintainable Redis infrastructure that supports Ofia's multi-tenant architecture and improves application performance, without compromising tenant isolation, data consistency or existing business operations.

The assignment has three stages:

1. Audit the existing architecture and identify where Redis is needed.
2. Produce a detailed implementation plan and resolve outstanding architectural questions.
3. Implement, integrate and test Redis across the approved microservices.

**Important: Begin with the audit. Do not start changing production code before completing the audit and presenting the proposed implementation plan.**

---

# 2. Existing architectural context

The following information should guide the audit.

- Ofia currently operates six microservices.
- The services have their own responsibilities, application logic and database interactions.
- Neon is already part of the existing infrastructure and remains the authoritative database.
- Most existing database tables already have tenant-related fields, including `tenant_id`.
- Ofia is a multi-tenant platform. Multiple businesses operate on shared application infrastructure, and strict tenant separation is mandatory.
- Frontend applications and backend services are deployed through Vercel.
- We are considering one shared Upstash Redis instance connected to the six microservices, rather than six separate Redis deployments.
- Each service must have its own Redis namespace and clearly defined access patterns.
- Redis should improve performance and support appropriate short-lived operational data, not duplicate the entire Neon database.

Do not assume that the existing architecture is perfectly implemented. Verify these details against the actual repositories, deployments, database schemas and configuration.

---

# 3. Stage One: Comprehensive infrastructure audit

Before implementation, inspect all six microservices.

For each service, document:

- Service name and business responsibility.
- Repository and deployment project.
- Backend framework and runtime.
- Existing API routes and middleware.
- Existing authentication and authorisation mechanisms.
- How tenant identity is resolved.
- How tenant permissions are enforced.
- Existing Neon connection configuration.
- Database query patterns and high-frequency operations.
- Existing caching mechanisms, if any.
- Background jobs and scheduled tasks.
- External API calls.
- Current environment variables and secrets management.
- Existing performance bottlenecks and potential Redis use cases.

Do not make assumptions about the six services. Discover and document their actual names and responsibilities from the repositories.

## 3.1 Audit tenant isolation

This is one of the most important parts of the assignment.

Inspect the entire request lifecycle:

1. User authentication.
2. Tenant identification.
3. Tenant membership and role validation.
4. Authorisation.
5. Database query execution.
6. Cache lookup and cache writes.
7. Cache invalidation.
8. API response generation.

Verify that tenant identity is reliably established before any tenant-specific Redis operation.

Identify any endpoint where a user could potentially access another tenant's cached data.

Check whether tenant filtering is enforced at the backend rather than relying on frontend filtering.

Document all vulnerabilities and recommend corrections.

## 3.2 Audit current database usage

Inspect the existing Neon database interactions.

Identify:

- Frequently executed queries.
- Repeated queries returning identical or slowly changing data.
- Expensive joins and aggregations.
- Dashboard statistics and reporting queries.
- Frequently accessed configuration and settings.
- Session and authentication-related lookups.
- Data that changes frequently and would be dangerous to cache.
- Operations that require strong consistency.

Redis must not replace Neon as the authoritative source of business data.

Do not create a second database architecture or modify existing database ownership and tenant provisioning decisions as part of this assignment.

---

# 4. Stage Two: Redis architecture

## 4.1 Proposed infrastructure

Evaluate and, subject to the audit, implement one shared Upstash Redis instance for the six microservices.

The architecture should look conceptually like this:

Ofia applications and services
- Identity and user services
- Vendor/business services
- Logistics services
- Customer services
- Billing and payments services
- Other existing Ofia microservices

All connect through a controlled Redis integration layer to:

**Shared Upstash Redis infrastructure**

Each service accesses its own namespace and only the keys required by its responsibilities.

Neon remains the source of truth.

The shared Redis instance must not mean unrestricted shared access between services.

## 4.2 Redis namespaces

Establish a consistent naming convention.

For example:

`ofia:{service}:{tenant_id}:{resource}:{identifier}`

Examples:

- `ofia:vendors:tenant_123:profile:456`
- `ofia:logistics:tenant_123:availability:riders`
- `ofia:customers:tenant_123:profile:789`
- `ofia:billing:tenant_123:subscription:456`
- `ofia:identity:tenant_123:permissions:user_789`

These are illustrative conventions, not assumed existing identifiers.

For genuinely global resources, use a clearly separate global namespace.

Where data is shared between services, define an explicit contract for ownership, access and invalidation. Do not allow accidental cross-service access simply because services use the same Redis instance.

The namespace must distinguish:

- Environment: development, staging and production.
- Microservice.
- Tenant.
- Resource type.
- Resource identifier.

Use a consistent format and document it.

## 4.3 Tenant isolation requirements

Every tenant-specific Redis key must include the authenticated tenant context.

Requirements:

1. Resolve tenant identity from trusted server-side authentication and membership context.
2. Never trust a tenant ID supplied solely by the browser or request body.
3. Never allow one tenant's cache key to resolve to another tenant's data.
4. Ensure tenant-specific cache reads and writes use the same validated tenant context.
5. Ensure cache invalidation is tenant-scoped.
6. Prevent cache key collisions between services.
7. Protect global resources from accidental tenant-specific overwrites.
8. Do not expose Redis credentials to frontend applications.
9. Do not allow direct client-side access to the shared Redis instance.

Test these requirements using multiple tenants and multiple user roles.

## 4.4 Shared Redis integration library

Evaluate whether a common internal Redis integration package or library should be introduced.

The goal is to avoid six independently implemented Redis integrations with different conventions.

The shared library should provide reusable functionality for:

- Redis connection management.
- Environment configuration.
- Namespace generation.
- Tenant-aware key generation.
- Cache reads and writes.
- TTL management.
- Cache invalidation.
- Serialization and deserialization.
- Error handling.
- Logging and metrics.
- Health checks.
- Retry and timeout policies.

Each microservice should import the shared integration library while retaining its own service-specific cache policies.

Avoid creating unnecessary architectural coupling between the six services.

If the repositories do not support a shared package cleanly, recommend the least disruptive alternative and explain why.

---

# 5. Stage Three: Identify and implement Redis use cases

Do not cache everything indiscriminately.

For every proposed Redis use case, document:

- The data being cached.
- The owning microservice.
- The originating Neon query or other source.
- Expected access frequency.
- Expected data freshness.
- TTL.
- Invalidation trigger.
- Consequences of stale data.
- Whether the operation can safely fall back to Neon.

Consider the following use cases, but verify that they apply to the actual implementation.

## 5.1 Application and API caching

Potential candidates:

- Frequently accessed business profiles.
- Tenant configuration and settings.
- Public storefront configuration.
- Product category information.
- Frequently requested catalogue data.
- Public directory information.
- Read-heavy dashboard summaries.
- Other expensive, repetitive read operations.

Use cache-aside where appropriate:

1. Application requests data.
2. Check Redis.
3. If present and valid, return cached data.
4. If absent, retrieve from Neon.
5. Populate Redis with an appropriate TTL.
6. Return the result.

Neon must remain the authoritative source.

## 5.2 Authentication and permissions

Evaluate whether Redis can improve:

- Session lookups.
- Short-lived authentication state.
- Permission lookups.
- Revocation or invalidation signals.
- Temporary verification tokens.
- Other short-lived identity operations.

Do not weaken authentication or authorisation to improve performance.

Ensure permission changes, account suspensions and tenant membership changes invalidate relevant cached state promptly.

Do not cache sensitive authentication material without an explicit security review.

## 5.3 Rate limiting

Evaluate Redis-backed rate limiting for:

- Login attempts.
- Registration.
- OTP requests.
- Password reset requests.
- Public API endpoints.
- Tenant API usage.
- Expensive operations.
- Other abuse-prone endpoints.

Rate limits should be configurable by endpoint, user, tenant or IP as appropriate.

Use atomic Redis operations or suitable scripts so concurrent requests cannot bypass limits.

Do not treat an IP address as a replacement for authenticated tenant identity.

## 5.4 Temporary operational data

Evaluate appropriate uses for:

- OTP expiry.
- Email verification state.
- Password reset state.
- Temporary onboarding state.
- Short-lived locks.
- Idempotency keys.
- Temporary workflow state.
- Other data that does not need to be permanent.

Ensure TTLs are explicitly defined.

Do not store permanent business records in Redis.

## 5.5 Logistics and real-time operations

Pay particular attention to the logistics and mobility-related services.

Evaluate whether Redis can support:

- Short-lived rider availability.
- Active dispatch state.
- Real-time operational status.
- Temporary assignment locks.
- Frequently changing operational counters.
- Short-lived location data, if applicable.
- High-frequency status lookups.

Do not assume Redis should replace any existing GPS, tracking or database architecture.

Document the write frequency, retention requirements and consistency requirements before introducing location caching.

## 5.6 Background jobs and asynchronous processing

Determine whether existing services have tasks that could benefit from Redis-backed queues or temporary coordination.

Only introduce a queue implementation if the existing workload justifies it.

If queues are required, document:

- Job ownership.
- Retry policy.
- Dead-letter handling.
- Idempotency.
- Job visibility.
- Failure recovery.
- Monitoring.

Do not introduce a second job-processing architecture without explaining why it is needed.

---

# 6. Cache consistency and invalidation

A cache is only useful if its data can be trusted.

Design a consistent invalidation strategy across all services.

For every cached resource, identify the events that invalidate it.

Examples:

- Business profile updated: invalidate the relevant business profile cache.
- Product updated: invalidate the relevant product cache.
- Tenant settings changed: invalidate the tenant configuration cache.
- User permissions changed: invalidate relevant permission caches.
- Subscription changed: invalidate the relevant subscription cache.
- Rider availability changed: update or invalidate the relevant operational cache.

Requirements:

1. Cache invalidation must happen after successful database writes.
2. A failed database transaction must not result in a successful-looking cache update.
3. Avoid stale data surviving indefinitely.
4. Use versioning or other safeguards where useful.
5. Prevent cache stampedes when popular keys expire.
6. Consider concurrent writes and race conditions.
7. Document acceptable consistency delays for each cached resource.

For critical writes, Neon must be updated successfully before Redis is updated or invalidated.

Consider an outbox or reliable event-delivery pattern if cache invalidation must survive application crashes after a database commit.

---

# 7. Failure handling and resilience

Redis must not become a single point of application failure.

Define the expected application behaviour when Redis is unavailable.

For cacheable read operations:

- Attempt Redis within a short timeout.
- If Redis is unavailable, fall back to Neon.
- Do not fail the entire user request merely because a non-critical cache lookup failed.
- Log the failure and monitor it.
- Avoid uncontrolled retry loops.

For security-sensitive operations, such as rate limiting or session validation, define an explicit fail-open or fail-closed policy for each operation.

Do not apply a universal fallback policy to all Redis operations.

For example, a cache outage may justify falling back to Neon, but an authentication or abuse-prevention control may require a different decision.

The application should recover automatically when Redis becomes available again.

---

# 8. Upstash configuration and deployment

Inspect current Vercel projects and deployment environments.

If Upstash is approved:

1. Verify the appropriate Upstash Redis product and plan.
2. Confirm pricing, quotas, throughput and connection limits.
3. Connect the Redis resource through the appropriate supported integration.
4. Configure the required environment variables in the relevant Vercel projects.
5. Separate development, staging and production configurations.
6. Ensure production services do not accidentally use development Redis.
7. Keep all Redis credentials server-side.
8. Ensure secrets are never committed to Git or exposed in frontend bundles.
9. Document credential rotation and access revocation.

Do not create separate Redis instances for every microservice unless the audit identifies a concrete isolation, scaling, compliance or operational reason.

Do not make paid-plan purchases, accept new billing commitments or deploy infrastructure changes to production without the required approval.

The agent may prepare the configuration and implementation plan before approval.

---

# 9. Monitoring and observability

Implement sufficient visibility to understand whether Redis is actually improving Ofia.

Track, where supported:

- Cache hit rate.
- Cache miss rate.
- Redis latency.
- Redis connection failures.
- Redis command errors.
- Cache invalidation failures.
- Memory usage and limits.
- Request volume.
- Rate-limit events.
- Queue depth and job failures, if queues are introduced.
- Fallback-to-Neon frequency.

Provide service-level visibility so problems can be traced to the responsible microservice.

Logs must not contain Redis passwords, tokens, sensitive cached values or unnecessary personal data.

Include health checks that distinguish between:

- Redis available.
- Redis degraded.
- Redis unavailable.

Do not expose internal Redis infrastructure or sensitive diagnostic information through public endpoints.

---

# 10. Implementation requirements

Once the audit and architecture are approved, implement the integration incrementally.

For each microservice:

1. Install the appropriate Redis SDK.
2. Configure the server-side Redis connection.
3. Integrate the common Redis library or approved equivalent.
4. Implement the approved cache use cases.
5. Apply tenant-aware key generation.
6. Implement TTL and invalidation policies.
7. Add failure handling.
8. Add monitoring and structured logging.
9. Run automated tests.
10. Verify existing functionality has not been broken.

Do not introduce broad caching changes without measuring the existing behaviour first.

Do not rewrite existing services unnecessarily.

Do not alter Neon database schemas or move authoritative business data into Redis as part of this assignment unless separately proposed and explicitly approved.

---

# 11. Testing and acceptance criteria

The implementation is not complete simply because Redis connects successfully.

The agent must demonstrate the following.

## Infrastructure tests

- All six microservices can connect to the approved Redis instance.
- Each service uses its correct namespace.
- Development, staging and production are isolated.
- Redis credentials are not exposed to frontend clients.
- Connection failures are handled safely.

## Tenant isolation tests

Create at least two test tenants.

Demonstrate that:

- Tenant A cannot read Tenant B's cached data.
- Tenant A cannot overwrite Tenant B's cached data.
- Tenant A cannot invalidate Tenant B's tenant-specific cache.
- Changing the tenant ID in a client request cannot bypass server-side tenant resolution.
- Global cache entries cannot accidentally expose tenant-specific information.

## Cache behaviour tests

Demonstrate:

- Cache miss followed by a Neon lookup.
- Cache population after a successful lookup.
- Cache hit on a subsequent request.
- Correct TTL expiration.
- Correct invalidation after updates.
- No stale cache after relevant permission or configuration changes.
- Safe fallback when Redis is unavailable.

## Performance tests

Measure representative operations before and after Redis.

Provide:

- Baseline response time.
- Redis-enabled response time.
- Database query reduction.
- Cache hit and miss rates.
- Redis latency.
- Any additional infrastructure cost.

Do not claim a performance improvement without measurements.

## Regression tests

Verify that:

- Existing authentication still works.
- Tenant routing still works.
- Existing Neon database connections remain functional.
- Existing CRUD operations still work.
- Existing integrations are unaffected.
- All six microservices continue to function independently.

---

# 12. Required audit and planning deliverables

Before implementation, present a report containing:

1. The actual names and responsibilities of all six microservices.
2. Their current repositories and deployment environments.
3. Existing database and infrastructure architecture.
4. Current tenant identification and isolation mechanisms.
5. Existing caching, if any.
6. Redis use cases recommended for each service.
7. Redis use cases that should not be implemented.
8. Proposed shared Upstash architecture.
9. Proposed namespace and key conventions.
10. Cache TTL and invalidation policies.
11. Security and tenant-isolation risks.
12. Required code changes by repository.
13. Required environment variable changes.
14. Estimated infrastructure and usage costs.
15. Testing and rollout strategy.
16. Outstanding questions requiring the owner's decision.

Include a service-by-service implementation matrix.

| Microservice | Audit findings | Redis use cases | Files/modules to change | Tests |
|---|---|---|---|---|
| Service 1 | Actual findings | Approved use cases | Actual files | Required tests |
| Service 2 | Actual findings | Approved use cases | Actual files | Required tests |
| Service 3 | Actual findings | Approved use cases | Actual files | Required tests |
| Service 4 | Actual findings | Approved use cases | Actual files | Required tests |
| Service 5 | Actual findings | Approved use cases | Actual files | Required tests |
| Service 6 | Actual findings | Approved use cases | Actual files | Required tests |

Do not fill this table with assumptions. Populate it after inspecting the repositories.

---

# 13. Questions the agent must resolve before implementation

The agent should identify and present any unresolved architectural decisions, including:

- Do all six services need Redis immediately, or should implementation be phased?
- Which services have the highest-value caching opportunities?
- Which data must never be cached?
- What consistency requirements apply to each resource?
- What should happen if Redis becomes unavailable for each operation?
- Are there existing shared packages or conventions that should be reused?
- Does the current Vercel deployment structure support a shared Redis integration cleanly?
- Are any workloads likely to exceed the proposed Upstash plan's limits?
- Do any services require dedicated Redis resources for isolation or performance?

Where the codebase provides sufficient evidence, make a recommendation instead of asking the owner to decide unnecessarily.

The proposed starting point remains one shared Upstash Redis resource with strict service and tenant namespaces.

---

# 14. Rollout strategy

Use a phased rollout.

**Phase 1 — Audit and architecture**

Inspect all six microservices and produce the findings, risk assessment and implementation plan.

**Phase 2 — Infrastructure preparation**

Prepare Upstash integration, environment configuration, shared library and test environments, subject to approval.

**Phase 3 — Pilot integration**

Select the service with the clearest, highest-value caching opportunity. Implement and test the integration before expanding.

**Phase 4 — Remaining microservices**

Implement the approved Redis use cases in the other services, following the established conventions.

**Phase 5 — Performance and security validation**

Run tenant-isolation tests, failure simulations, regression tests and before-and-after performance measurements.

**Phase 6 — Production rollout**

Present the completed test results, rollout plan and production risks for approval before deployment.

---

# 15. Non-negotiable engineering principles

1. Neon remains the source of truth.
2. Redis is an optimisation and short-lived operational data layer, not a replacement database.
3. Tenant isolation is mandatory at every cache operation.
4. One shared Upstash instance is the proposed starting architecture, not permission to share data indiscriminately.
5. Each microservice must have a clearly defined namespace and access boundary.
6. Redis credentials must never reach frontend applications.
7. Every cached resource must have an explicit TTL and invalidation strategy.
8. Redis failures must not unnecessarily take down the application.
9. Security-sensitive operations must have explicit failure policies.
10. Do not cache sensitive information simply because it is technically possible.
11. Do not introduce unnecessary dependencies or rewrite existing services.
12. Do not alter existing Neon provisioning, database ownership or tenant architecture.
13. Do not make unapproved infrastructure purchases or production changes.
14. All implementation must be backed by automated tests and measurable results.

## Final instruction to the development agent

Start by auditing the existing Ofia codebase and infrastructure across all six microservices.

Do not assume the current implementation matches the architectural description in this brief. Verify the actual code, schemas, deployment configuration and request flows.

Return the audit report, proposed architecture, service-by-service implementation matrix, identified risks and outstanding decisions.

Only after the audit and implementation plan have been reviewed and approved should you proceed with the full Redis implementation.

The final outcome must be a functioning, secure and measurable Redis integration across the approved Ofia microservices, with strict multi-tenant isolation and Neon retained as the authoritative database.