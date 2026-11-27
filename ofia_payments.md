# OFIA PAYMENT INFRASTRUCTURE AUDIT & IMPLEMENTATION
## Agent Instructions — Storefront, ERP, BYOK, Managed Payments and Protected Payments (Escrow)

## 1. Project context

Ofia is a multi-tenant commerce platform consisting of two separate applications:

1. **`Ofia_storefront`** — controls public storefronts, customer shopping experiences, product listings, cart, checkout and order creation.
2. **`Ofia_ERP`** — controls tenant ERP, merchant dashboards, Shop Manager, business settings, payment configuration, order management and financial reporting.

These are separate projects. Do not assume they share a codebase, database, authentication implementation or deployment environment.

Your assignment is to audit both projects and implement a unified payment and order-management architecture across them.

The implementation must support:

- Merchant Bring Your Own Key (BYOK) payments.
- Ofia-managed standard payments.
- Protected Payments using an approved escrow provider.
- Central order tracking across both applications.
- Webhook communication and payment verification.
- Merchant settlement visibility.
- Escrow tracking and release management.
- Refunds, disputes and reconciliation.
- Tenant-level financial reporting.
- Ofia Super Admin financial oversight.

**Audit before implementation. Do not rebuild existing working functionality unnecessarily.**

---

# PART A — FIRST PHASE: COMPLETE TECHNICAL AUDIT

## 2. Audit both repositories independently

Inspect the complete structure of `Ofia_storefront` and `Ofia_ERP`.

For each project, identify:

- Frontend framework and version.
- Backend framework and version.
- Database and ORM.
- Authentication and authorization.
- Tenant identification and isolation.
- Existing order models and order creation logic.
- Existing checkout implementation.
- Existing payment integrations.
- Existing webhook endpoints.
- Existing merchant settings.
- Existing Shop Manager functionality.
- Existing financial dashboards.
- Existing APIs and API contracts.
- Existing background jobs and event-processing mechanisms.
- Existing deployment configuration and environment variables.

Do not assume that functionality exists merely because a screen has been designed. Trace each feature from frontend to backend to database and external provider.

### Required audit deliverable

Produce an audit report with these columns:

| Area | Storefront | ERP | Status | Required action |
|---|---|---|---|---|
| Tenant resolution | Inspect | Inspect | Existing/Partial/Missing | Document |
| Order creation | Inspect | Inspect | Existing/Partial/Missing | Document |
| Checkout | Inspect | Inspect | Existing/Partial/Missing | Document |
| BYOK configuration | Inspect | Inspect | Existing/Partial/Missing | Document |
| Managed payments | Inspect | Inspect | Existing/Partial/Missing | Document |
| Escrow | Inspect | Inspect | Existing/Partial/Missing | Document |
| Webhooks | Inspect | Inspect | Existing/Partial/Missing | Document |
| Payment ledger | Inspect | Inspect | Existing/Partial/Missing | Document |
| Settlements | Inspect | Inspect | Existing/Partial/Missing | Document |
| Refunds | Inspect | Inspect | Existing/Partial/Missing | Document |
| Disputes | Inspect | Inspect | Existing/Partial/Missing | Document |
| Merchant dashboard | Inspect | Inspect | Existing/Partial/Missing | Document |
| Super Admin dashboard | Inspect | Inspect | Existing/Partial/Missing | Document |

Identify duplicated services, conflicting models, incomplete integrations and security gaps.

Do not modify production data or existing payment configurations during the audit.

---

# PART B — THE PAYMENT ARCHITECTURE

## 3. Implement three payment routes

Ofia must support three distinct payment configurations.

### Route 1: Merchant BYOK

The merchant connects their own payment provider account.

Initial provider support:

- Paystack.
- Nomba, subject to approved API access and integration.

The merchant enters their own provider credentials in Ofia ERP.

For example:

- Merchant A connects Paystack.
- Merchant B connects Nomba.
- Merchant C has not connected a provider.

When Merchant A receives a normal order, the payment is processed through Merchant A's Paystack account.

When Merchant B receives a normal order, the payment is processed through Merchant B's Nomba account.

The money follows the merchant's normal provider settlement arrangement.

Ofia receives transaction notifications, verifies the payment and updates its internal order and financial records.

Ofia must not receive or control these merchants' ordinary sales proceeds merely because it provides the storefront.

### Route 2: Ofia Managed Payments

When a merchant has not connected their own payment credentials, the merchant can use Ofia Managed Payments.

Ofia uses its centrally approved payment-provider integration.

For example:

- Merchant C has no Paystack credentials.
- Merchant C enables Ofia Managed Payments.
- The customer places an ordinary order.
- Ofia initializes the payment using the central managed integration.
- The payment is linked to the merchant's tenant and order.
- The applicable approved settlement arrangement determines how the merchant receives their funds.

Important:

The managed-payment arrangement must be approved by the provider for Ofia's multi-tenant marketplace structure.

Do not assume that a central payment account can automatically collect and redistribute funds to multiple merchants.

Document the actual approved settlement arrangement before enabling live transactions.

### Route 3: Protected Payment — Escrow

Protected Payment is a separate financial product.

It must use a dedicated escrow partner that has explicitly approved the proposed marketplace arrangement and custody structure.

**The entire escrow transaction must be handled through the approved escrow provider's infrastructure.**

This means:

- Escrow collection goes through the escrow provider.
- Escrow funds are held under the provider's approved custody arrangement.
- Escrow funding is verified through the provider's API and webhooks.
- Escrow release is requested through the provider.
- Escrow refunds are requested through the provider.
- Escrow disputes follow the provider's approved process.

Do not route escrow funds through:

- The merchant's normal Paystack account.
- The merchant's normal Nomba account.
- Ofia's ordinary managed-payment collection account.

Ofia manages the customer experience, order tracking, merchant workflow, notifications, release requests and reporting.

The escrow provider manages the actual funds.

Do not assume that any provider's ordinary payment and transfer APIs constitute an approved escrow arrangement. Obtain written confirmation of custody, safeguarding, marketplace use, release conditions and refunds.

---

## 4. Checkout routing logic

The payment route must be selected using the order's payment mode.

The process:

1. Customer visits a merchant storefront.
2. Storefront resolves the tenant.
3. Customer adds products to the cart.
4. Customer proceeds to checkout.
5. Ofia displays available payment options.
6. Customer chooses either:
   - Standard Payment.
   - Protected Payment, where enabled and eligible.
7. Backend creates the order.
8. Backend identifies the payment mode.
9. Backend initializes the correct payment provider.
10. Backend stores the provider reference against the order.
11. Customer completes payment.
12. Provider sends a webhook.
13. Ofia verifies the event.
14. Ofia updates the order and financial records.

### Routing rules

| Order type | Payment route |
|---|---|
| Normal order, merchant has BYOK | Merchant's provider |
| Normal order, merchant has no BYOK | Ofia Managed Payments |
| Protected order | Approved escrow partner |
| Protected order, escrow partner unavailable | Do not fall back to standard payments |

Never silently convert a Protected Payment into a normal payment.

The customer must explicitly choose Protected Payment and see any applicable protection fee before payment.

The payment mode must be immutable after the payment attempt has been initialized, except through an explicitly authorized cancellation and new payment attempt.

---

# PART C — HOW THE TWO APPLICATIONS COMMUNICATE

## 5. Implement a central integration layer

The storefront and ERP are separate applications, but both must work with the same authoritative order and payment records.

Implement or reuse a central backend payment and order integration layer.

If a shared backend service already exists, audit and extend it instead of creating another one.

The preferred logical architecture is:

```text
                    OFIA STOREFRONT
                (Ofia_storefront project)
                         |
                         |
                  Order API / Checkout
                         |
                         v
              OFIA CENTRAL BACKEND
             Order & Payment Services
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
          BYOK       Managed       Escrow
         Adapter     Payment       Adapter
             |        Adapter         |
             v           v           v
          Merchant    Ofia         Approved
          Provider   Provider      Escrow Partner
             |           |           |
             +-----------+-----------+
                         |
                    Webhooks/API
                         |
                         v
               Payment Event Processor
                         |
             +-----------+-----------+
             |                       |
             v                       v
       Order Database          Financial Ledger
             |                       |
             +-----------+-----------+
                         |
                         v
                     OFIA ERP
                  (Ofia_ERP project)
                         |
             +-----------+-----------+
             |                       |
             v                       v
        Shop Manager           Super Admin
        Merchant View          Platform View
```

This is a logical architecture. The implementation must reuse existing services and database boundaries where possible.

Do not introduce unnecessary microservices or duplicate order databases simply to match this diagram.

## 6. Communication contract between storefront and ERP

The storefront must communicate with the central backend through authenticated APIs.

The ERP must retrieve its order and payment information through the same authoritative backend APIs.

Do not implement direct frontend-to-frontend communication.

Do not allow the storefront to declare an order paid simply because a customer returns from a successful checkout page.

Only verified provider notifications or server-side transaction verification can confirm payment.

### Core API capabilities

Implement or audit these API capabilities:

**Orders**
- Create order.
- Retrieve order.
- Retrieve order by reference.
- Update fulfilment status.
- Cancel eligible order.
- List orders for a tenant.
- Retrieve order timeline.

**Payments**
- Initialize payment.
- Verify payment.
- Retrieve payment status.
- Retrieve payment attempts.
- Retrieve transaction history.
- Initiate refund where supported.
- Retrieve refund status.

**Escrow**
- Create escrow case.
- Retrieve escrow status.
- Submit fulfilment evidence.
- Confirm receipt.
- Request release.
- Initiate dispute.
- Request refund.
- Retrieve dispute and release history.

**Merchant settings**
- Retrieve payment configuration.
- Save provider credentials securely.
- Enable or disable BYOK.
- Enable or disable Ofia Managed Payments.
- Enable or disable Protected Payment.
- Retrieve provider connection status.

**Financial reporting**
- Retrieve sales summary.
- Retrieve pending settlements.
- Retrieve settled transactions.
- Retrieve fees and deductions.
- Retrieve escrow funds held.
- Retrieve escrow funds released.
- Retrieve refunds.
- Retrieve disputes.

The exact endpoints should follow the existing backend conventions.

Document all endpoints, request schemas, response schemas and authorization requirements.

---

# PART D — ORDER TRACKING

## 7. Establish one authoritative order lifecycle

Every order must have one unique Ofia order ID.

The order must remain identifiable regardless of which payment provider processes it.

Suggested order structure:

- `order_id`
- `order_number`
- `tenant_id`
- `customer_id`
- `store_id`
- `payment_mode`
- `payment_provider`
- `payment_status`
- `fulfilment_status`
- `order_status`
- `currency`
- `subtotal`
- `delivery_fee`
- `discount`
- `protection_fee`
- `total_amount`
- `created_at`
- `updated_at`

The `payment_provider` must identify the actual provider used.

The `payment_mode` should distinguish:

- `merchant_byok`
- `ofia_managed`
- `protected_escrow`

### Suggested order lifecycle

```text
ORDER_CREATED
      |
      v
AWAITING_PAYMENT
      |
      v
PAYMENT_CONFIRMED
      |
      v
PROCESSING
      |
      v
READY_FOR_FULFILMENT
      |
      v
SHIPPED / OUT_FOR_DELIVERY
      |
      v
DELIVERED
      |
      v
COMPLETED
```

Other possible states:

- `PAYMENT_FAILED`
- `PAYMENT_EXPIRED`
- `CANCELLED`
- `REFUND_PENDING`
- `REFUNDED`
- `DISPUTED`

Do not force all order types through exactly the same payment-state transitions.

For example, a standard paid order may proceed to fulfilment immediately after verified payment.

An escrow-funded order must remain identifiable as an escrow order until the approved release or refund process is completed.

## 8. Track payment and fulfilment separately

Do not combine payment status and delivery status into one field.

A product can be delivered while escrow funds remain held.

A standard payment can be successful while the order is still awaiting dispatch.

Use separate state machines.

### Payment states

- `pending`
- `processing`
- `successful`
- `failed`
- `expired`
- `partially_refunded`
- `refunded`

### Fulfilment states

- `unfulfilled`
- `processing`
- `ready`
- `shipped`
- `out_for_delivery`
- `delivered`
- `cancelled`

### Escrow states

- `created`
- `awaiting_funding`
- `funded`
- `held`
- `awaiting_fulfilment`
- `awaiting_buyer_confirmation`
- `release_eligible`
- `release_pending`
- `released`
- `refund_pending`
- `refunded`
- `disputed`
- `cancelled`

These states must be mapped to the actual escrow partner's API states.

Do not assume that every provider uses these exact status names.

---

# PART E — WEBHOOKS AND EVENT COMMUNICATION

## 9. Implement provider-specific webhook endpoints

Each payment provider may have its own webhook format, signature method and event structure.

Implement separate provider adapters or webhook handlers that normalize events into Ofia's internal event format.

Expected webhook sources:

- Merchant-connected Paystack accounts.
- Merchant-connected Nomba accounts.
- Ofia's central managed-payment provider.
- Approved escrow partner.

Each event must be associated with:

- Provider.
- Provider account or configuration.
- Tenant ID.
- Order ID.
- Payment attempt ID.
- Provider transaction reference.
- Event ID.
- Event type.
- Received timestamp.
- Processing status.

### Webhook processing rules

1. Receive the webhook.
2. Verify its signature using the correct provider credentials.
3. Validate the provider account and payment reference.
4. Retrieve the transaction from the provider API where required.
5. Verify amount, currency and reference.
6. Confirm the tenant and order association.
7. Check whether the event has already been processed.
8. Record the raw event securely.
9. Process the event idempotently.
10. Update the payment record.
11. Update the order's payment state.
12. Publish the corresponding internal event.
13. Update ERP-visible information.
14. Trigger applicable customer and merchant notifications.

A webhook must never be trusted solely because it contains `success: true`.

### Important event examples

Standard payments:

- `payment.initiated`
- `payment.successful`
- `payment.failed`
- `refund.initiated`
- `refund.successful`

Escrow:

- `escrow.created`
- `escrow.funded`
- `escrow.held`
- `escrow.release_requested`
- `escrow.released`
- `escrow.refund_requested`
- `escrow.refunded`
- `escrow.disputed`

These are Ofia's internal event names, not necessarily the external providers' actual event names.

### Reliability requirements

Implement:

- Signature verification.
- Idempotency.
- Retry handling.
- Failed-event monitoring.
- Dead-letter handling or equivalent recovery.
- Event processing logs.
- Duplicate webhook protection.
- Provider transaction reconciliation.

A provider webhook must not cause two payouts, two refunds or duplicate order updates.

---

# PART F — PAYMENT SETTINGS IN OFIA ERP

## 10. Merchant payment settings screen

Build or extend the merchant's Payment Settings section.

It must be accessible from the tenant's ERP dashboard.

### Screen: Payment Settings

Sections:

**A. Standard Payment Configuration**

Allow the merchant to:

- Select Paystack or another supported provider.
- Enter public key where applicable.
- Enter secret key securely.
- Connect or disconnect their provider account.
- Verify connection.
- See connection status.
- Enable or disable BYOK.

Do not expose secret credentials after they have been saved.

Encrypt credentials at rest and protect them from frontend access, logs and accidental disclosure.

**B. Ofia Managed Payments**

Show:

- Availability.
- Activation status.
- Applicable fees.
- Settlement arrangement.
- Merchant eligibility.
- Terms and conditions.

Merchants should be able to activate managed payments only where Ofia's central arrangement has approved them.

**C. Protected Payments**

Allow merchants to:

- Enable or disable Protected Payment.
- See whether the merchant is eligible.
- Review applicable protection fees.
- Select eligible products or order categories where supported.
- Configure approved delivery confirmation settings.
- View escrow terms.
- View escrow provider availability.

Do not allow merchants to invent release or custody rules that the escrow partner has not approved.

**D. Payment connection status**

Show:

- Connected.
- Pending verification.
- Disconnected.
- Invalid credentials.
- Provider unavailable.
- Action required.

---

# PART G — CUSTOMER CHECKOUT AND ORDER TRACKING

## 11. Customer checkout screen

Customers must see the appropriate payment options.

For an eligible order:

**Standard Payment**
- Pay through the merchant's normal payment provider.
- Display supported payment methods.
- Clearly explain any applicable fees.

**Protected Payment**
- Pay through Ofia's approved escrow partner.
- Explain that funds are held under the provider's approved arrangement.
- Explain when the merchant receives the funds.
- Explain how to report a problem.
- Display the protection fee, if applicable.
- Require customer acceptance of the applicable terms.

The customer must understand that Protected Payment is optional and is not the same as ordinary payment.

If Protected Payment is unavailable, explain that it is unavailable. Do not silently switch the payment route.

## 12. Customer order details screen

Create one unified customer order-details screen.

The screen should display:

- Order number.
- Merchant/store name.
- Products purchased.
- Quantity.
- Order total.
- Payment method.
- Payment reference.
- Payment status.
- Fulfilment status.
- Delivery information.
- Order timeline.
- Receipt.
- Refund information where applicable.

For Protected Payment, additionally show:

- Protected Payment badge or label.
- Escrow funding status.
- Funds-held status.
- Escrow provider reference where appropriate.
- Merchant fulfilment status.
- Delivery evidence.
- Buyer confirmation action.
- Dispute/report-problem action.
- Release status.
- Refund status.

The customer must be able to revisit this screen after checkout.

Do not make the payment-success page the only place where customers can see their order status.

---

# PART H — MERCHANT SHOP MANAGER DASHBOARD

## 13. Merchant order management

The Shop Manager inside Ofia ERP must show all orders for the merchant's tenant.

Provide filters for:

- All orders.
- Awaiting payment.
- Paid.
- Processing.
- Ready for dispatch.
- Shipped.
- Delivered.
- Completed.
- Cancelled.
- Refunded.
- Protected Payments.
- Disputed orders.

Each order row should display:

- Order number.
- Customer.
- Order date.
- Amount.
- Payment mode.
- Payment status.
- Fulfilment status.
- Delivery status.
- Actions.

Clicking an order must open a complete order-details page.

### Merchant order details

Show:

1. Customer and delivery information.
2. Products and quantities.
3. Order amount.
4. Payment provider.
5. Payment mode.
6. Payment reference.
7. Payment status.
8. Fulfilment timeline.
9. Delivery information.
10. Refund or dispute status.
11. Transaction history.

The merchant must be able to update fulfilment status and submit delivery evidence where required.

For escrow orders, the merchant must not be able to mark funds as released manually.

Only verified provider events can confirm that the escrow partner released the funds.

---

# PART I — MERCHANT FINANCIAL DASHBOARD

## 14. Create a unified Payments & Settlements dashboard

This dashboard must combine information from the merchant's standard BYOK transactions, Ofia Managed Payments and Protected Payments.

However, these must remain separate financial categories.

### Main dashboard summary cards

Display:

- Total sales.
- Successful payments.
- Pending payments.
- Failed payments.
- Pending settlements.
- Settled funds.
- Payment fees.
- Refunds.
- Escrow funds held.
- Escrow funds eligible for release.
- Escrow funds released.
- Disputed escrow funds.

Do not label funds held by an escrow partner as available merchant balance.

Do not imply that Ofia possesses money that is held by an external provider.

### Transactions screen

Provide a searchable transaction table:

| Field | Description |
|---|---|
| Transaction ID | Ofia transaction identifier |
| Order number | Associated order |
| Customer | Buyer |
| Payment mode | BYOK, managed or escrow |
| Provider | Paystack, Nomba or escrow partner |
| Gross amount | Customer payment |
| Provider fee | Provider charges |
| Ofia fee | Applicable platform fee |
| Net amount | Amount attributable to merchant |
| Payment status | Verified status |
| Settlement status | Settlement visibility |
| Date | Transaction timestamp |

Allow filtering by:

- Date range.
- Payment provider.
- Payment mode.
- Payment status.
- Settlement status.
- Order number.

### Settlements screen

Show:

- Pending settlement.
- Settled amount.
- Settlement date.
- Bank destination where appropriate.
- Settlement reference.
- Provider.
- Associated transactions.
- Fees and deductions.

Where provider APIs expose settlement information, retrieve and reconcile it.

Where a merchant uses BYOK, settlement information must come from that merchant's provider account, using authorized credentials and supported API capabilities.

Where the provider does not expose settlement information, clearly label the data as unavailable rather than estimating it.

**A successful payment is not necessarily a settled payment.** Keep these statuses separate.

### Escrow screen

Provide a separate escrow section with:

- Funds held.
- Awaiting fulfilment.
- Awaiting buyer confirmation.
- Release eligible.
- Release pending.
- Released.
- Refund pending.
- Refunded.
- Disputed.

Display each escrow transaction with its associated order and provider reference.

---

# PART J — ESCROW MANAGEMENT

## 15. Escrow lifecycle

The intended workflow:

1. Customer selects Protected Payment.
2. Ofia creates the order.
3. Ofia creates an escrow case with the approved provider.
4. Provider collects the customer's funds.
5. Provider confirms funding through its API/webhook.
6. Ofia marks the escrow case as funded/held.
7. Merchant receives the order and fulfils it.
8. Merchant submits tracking information or proof of delivery.
9. Customer receives a delivery notification.
10. Customer confirms receipt or reports a problem.
11. Ofia checks the agreed release conditions.
12. Ofia sends a release request to the escrow partner.
13. Provider executes the release and confirms the outcome.
14. Ofia updates the escrow ledger and merchant dashboard.

If the customer reports a problem:

1. Open a dispute.
2. Freeze or suspend release where supported by the provider.
3. Notify the merchant.
4. Record evidence from both parties.
5. Apply the agreed dispute-resolution procedure.
6. Request the approved release or refund outcome.
7. Update all records after provider confirmation.

Do not implement automatic release merely because a timer expires.

Any automatic release must be explicitly supported by the provider agreement and must follow the agreed dispute and complaint rules.

## 16. Escrow customer screens

Build:

- Protected Payment checkout.
- Escrow order details.
- Funding confirmation.
- Funds held status.
- Delivery tracking.
- Confirm receipt.
- Report a problem.
- Dispute details.
- Refund status.
- Release confirmation/history.

## 17. Escrow merchant screens

Build:

- Protected orders.
- Funds held.
- Awaiting fulfilment.
- Awaiting customer confirmation.
- Release pending.
- Released.
- Disputed.
- Refunded.
- Escrow order details.
- Submit fulfilment evidence.
- Tracking details.
- Dispute response and evidence submission.

## 18. Ofia Super Admin escrow screens

Build a central escrow administration section.

Include:

- All escrow cases.
- Provider account status.
- Total funds reported as held by provider.
- Total releases.
- Total refunds.
- Outstanding disputes.
- Reconciliation differences.
- Provider webhook logs.
- Failed API requests.
- Release and refund audit history.

Super Admin actions must respect the escrow provider's actual permissions and the agreed custody arrangement.

Ofia must not display a button that claims to release or refund money unless it actually invokes an authorized provider operation.

---

# PART K — ORDER AND PAYMENT VISIBILITY ACROSS APPLICATIONS

## 19. How an order moves between Storefront and ERP

Use this example to verify the complete integration.

Merchant: Fumai Clothing.

Storefront: `fumaiclothing.ofia.shop`.

Tenant ID: `TENANT_001`.

Customer places an order for ₦120,000.

### Scenario A: Standard BYOK order

1. Customer places order in `Ofia_storefront`.
2. Storefront sends the order to the central backend.
3. Backend resolves `TENANT_001`.
4. Backend retrieves the merchant's configured payment provider.
5. Backend initializes payment through the merchant's provider.
6. Customer completes payment.
7. Provider sends webhook to Ofia.
8. Ofia verifies the webhook and transaction.
9. Payment record changes to successful.
10. Order payment status changes to paid.
11. ERP receives the updated order/payment information through the central backend.
12. Merchant sees the order in Shop Manager.
13. Merchant processes and dispatches the order.
14. Customer sees fulfilment updates on their order-details screen.
15. Provider settlement information is reconciled.
16. Merchant sees the settlement status in Payments & Settlements.

### Scenario B: Ofia Managed standard order

1. Customer places order.
2. Backend identifies that the merchant has no BYOK credentials and has enabled managed payments.
3. Backend initializes payment through Ofia's central approved provider arrangement.
4. Provider collects payment.
5. Webhook reaches Ofia.
6. Ofia verifies payment.
7. Order is updated.
8. ERP displays the transaction under Ofia Managed Payments.
9. Settlement information is reconciled using the approved merchant settlement arrangement.

### Scenario C: Protected Payment order

1. Customer places order.
2. Customer explicitly selects Protected Payment.
3. Backend sets `payment_mode = protected_escrow`.
4. Backend creates the escrow case.
5. Backend initializes funding through the approved escrow provider.
6. Provider collects and safeguards the funds under its approved arrangement.
7. Provider confirms funding.
8. Ofia records the escrow as funded/held.
9. Merchant sees the order in Shop Manager under Protected Orders.
10. Merchant fulfils the order.
11. Customer receives delivery updates.
12. Customer confirms receipt.
13. Ofia checks the release conditions and dispute status.
14. Ofia requests release from the escrow provider.
15. Provider executes release.
16. Provider sends confirmation.
17. Ofia updates the escrow ledger and merchant dashboard.
18. Customer and merchant can see the completed transaction.

**The escrow provider handles the money throughout the protected-payment lifecycle. Ofia handles the application workflow and records verified financial events.**

---

# PART L — DATABASE AND DATA MODEL

## 20. Required entities

Audit existing database models before adding new ones.

Reuse existing entities where appropriate.

Potential entities include:

### Tenant and configuration

- `tenants`
- `tenant_payment_settings`
- `payment_provider_accounts`
- `payment_configurations`
- `payment_provider_credentials`

### Orders

- `orders`
- `order_items`
- `order_status_history`
- `order_fulfilments`
- `order_delivery_events`

### Standard payments

- `payment_attempts`
- `payment_transactions`
- `payment_webhook_events`
- `payment_fees`
- `payment_refunds`
- `merchant_settlements`

### Escrow

- `escrow_provider_accounts`
- `escrow_cases`
- `escrow_funding_transactions`
- `escrow_conditions`
- `escrow_milestones`
- `escrow_release_requests`
- `escrow_refund_requests`
- `escrow_disputes`
- `escrow_ledger_entries`
- `escrow_webhook_events`

### Audit and reconciliation

- `financial_ledger_entries`
- `provider_reconciliation_records`
- `payment_audit_logs`
- `provider_api_logs`

All tenant-owned financial records must carry an appropriate tenant association.

All financial events must retain their external provider references.

Use immutable or append-only audit records for important financial state transitions.

Do not delete historical financial records simply because an order is cancelled or refunded.

---

# PART M — SECURITY AND TENANT ISOLATION

## 21. Security requirements

Implement and test:

- Encrypted provider credentials at rest.
- No secret keys in frontend code.
- No secret keys in browser storage.
- No credentials in application logs.
- Provider-specific webhook signature validation.
- Idempotent transaction processing.
- Unique provider transaction references.
- Tenant-level data authorization.
- Role-based access control.
- Audit logging for financial actions.
- Server-side payment initialization.
- Server-side transaction verification.
- Secure refund authorization.
- Secure escrow release authorization.
- API rate limiting and abuse protection.

Never trust a tenant ID supplied by the browser without validating it against the authenticated tenant and resolved storefront.

A merchant must not be able to view another merchant's:

- Orders.
- Customers.
- Transactions.
- Payment credentials.
- Settlement records.
- Escrow cases.
- Refunds.
- Disputes.

Ofia Super Admin may have cross-tenant oversight, subject to role permissions and audit logging.

---

# PART N — NOTIFICATIONS

## 22. Customer and merchant notifications

Build a unified notification mechanism for:

- Order created.
- Payment successful.
- Payment failed.
- Payment pending.
- Order processing.
- Order dispatched.
- Order delivered.
- Escrow funded.
- Escrow funds held.
- Buyer confirmation required.
- Escrow release requested.
- Escrow released.
- Refund initiated.
- Refund completed.
- Dispute opened.
- Dispute resolved.

Notifications must be triggered by verified backend state changes, not by unverified frontend events.

Support the existing Ofia notification channels where available.

Do not duplicate notification infrastructure if an existing central notification service already exists.

---

# PART O — IMPLEMENTATION SEQUENCE

## 23. Required development phases

### Phase 1: Audit and architecture

- Inspect both projects.
- Produce audit report.
- Identify existing backend services.
- Map existing database entities.
- Document API contracts.
- Identify missing integrations.
- Identify security gaps.
- Confirm provider capabilities and commercial approval requirements.

Do not begin a major rewrite before completing this phase.

### Phase 2: Core payment infrastructure

- Implement or extend central payment service.
- Implement provider adapter architecture.
- Implement BYOK configuration.
- Implement Ofia Managed Payments.
- Implement payment initialization.
- Implement transaction verification.
- Implement webhook processing.
- Implement idempotency and reconciliation.

### Phase 3: Order communication

- Ensure storefront creates authoritative orders.
- Connect order creation to payment initialization.
- Connect payment events to order updates.
- Connect order data to ERP.
- Implement order timeline.
- Implement customer order tracking.
- Implement merchant order tracking.

### Phase 4: Merchant financial dashboard

- Payments overview.
- Transactions.
- Settlement reporting.
- Fees and deductions.
- Refunds.
- Financial exports.
- Reconciliation visibility.

### Phase 5: Escrow integration

Do not enable live escrow until an approved partner and custody arrangement are confirmed.

- Implement escrow provider adapter.
- Implement escrow case creation.
- Implement funding verification.
- Implement fulfilment evidence.
- Implement buyer confirmation.
- Implement release requests.
- Implement refunds.
- Implement disputes.
- Implement escrow ledger and dashboards.
- Implement provider reconciliation.

Use sandbox environments for development and testing.

### Phase 6: Super Admin and operational controls

- Cross-tenant payment oversight.
- Provider configuration.
- Webhook monitoring.
- Failed-event management.
- Reconciliation exceptions.
- Escrow case oversight.
- Audit history.
- Operational reporting.

### Phase 7: End-to-end testing

Test all three payment routes using separate test merchants and tenants.

Do not use live customer funds for development tests.

---

# PART P — ACCEPTANCE TESTS

## 24. Mandatory test scenarios

The implementation is not complete until the following tests pass.

### BYOK

- Merchant connects Paystack.
- Merchant connects Nomba where supported.
- Invalid credentials are rejected.
- Credentials remain protected.
- Normal order routes through the merchant's provider.
- Webhook updates the correct order.
- Duplicate webhooks do not duplicate transactions.
- Merchant sees only their own transactions.

### Managed Payments

- Merchant without BYOK can activate managed payments if eligible.
- Normal order routes through the approved central integration.
- Provider webhook updates the correct tenant's order.
- Settlement information is accurately represented.
- No unauthorized cross-merchant fund distribution occurs.

### Protected Payments

- Customer can select Protected Payment.
- Escrow case is created.
- Funding uses the approved escrow provider.
- Funding webhook is verified.
- Merchant sees the protected order.
- Customer sees the held-funds status.
- Merchant submits fulfilment evidence.
- Customer confirms receipt.
- Release request is sent to the provider.
- Release is confirmed by the provider.
- Refund and dispute paths work.
- Escrow funds are never shown as ordinary available merchant balance.
- Escrow does not silently fall back to ordinary managed payments.

### Cross-application communication

- Storefront creates an order.
- ERP receives the order.
- Payment changes appear in ERP.
- Fulfilment changes appear in customer tracking.
- Customer can revisit order details.
- Merchant can revisit order details.
- Failed webhook processing can be recovered.
- Tenant isolation is maintained.

### Financial integrity

- Gross payment amount is accurate.
- Provider fees are accurately recorded.
- Ofia fees are accurately recorded.
- Merchant net amount is correctly calculated.
- Settlement status is not confused with payment status.
- Refunds update the correct ledger entries.
- No duplicate release or refund can occur.
- Reconciliation identifies missing or mismatched transactions.

---

# PART Q — FINAL DELIVERABLES

## 25. What the agent must deliver

At the end of the assignment, provide:

1. Full technical audit report for `Ofia_storefront`.
2. Full technical audit report for `Ofia_ERP`.
3. Architecture diagram showing how both applications communicate.
4. Documented API contracts.
5. Database schema changes and migrations.
6. Provider adapter implementation.
7. Merchant payment settings screens.
8. Customer checkout changes.
9. Customer order tracking screens.
10. Merchant Shop Manager order screens.
11. Merchant Payments & Settlements dashboard.
12. Escrow screens for customers.
13. Escrow screens for merchants.
14. Escrow Super Admin screens.
15. Webhook handlers and event-processing logic.
16. Refund and dispute workflows.
17. Reconciliation functionality.
18. Security and tenant-isolation test results.
19. End-to-end payment test results.
20. List of external provider approvals and credentials still required.

For every feature, report whether it is:

- Existing and verified.
- Existing but incomplete.
- Newly implemented.
- Blocked by an external provider.
- Awaiting business or compliance approval.

Do not mark an integration as complete merely because its UI has been built.

Do not claim that escrow is operational until the provider has approved the arrangement, live credentials are available, and the complete funding-to-release lifecycle has been tested.

## 26. Final architectural principles

The implementation must preserve these decisions:

1. `Ofia_storefront` and `Ofia_ERP` remain separate applications.
2. Both applications communicate through authenticated backend APIs and verified events.
3. There must be one authoritative order record.
4. Every order must be associated with the correct tenant.
5. Normal BYOK payments use the merchant's own provider credentials.
6. Normal managed payments use Ofia's approved central payment arrangement.
7. Protected Payments use a dedicated, approved escrow provider.
8. Escrow funds never pass through Ofia's ordinary managed-payment collection account.
9. The customer explicitly chooses Protected Payment.
10. The merchant can enable or disable Protected Payment where eligible.
11. The merchant dashboard combines financial visibility without confusing standard settlement with escrow custody.
12. All payment and escrow updates must be verified server-side.
13. Financial records must be auditable and reconcilable.
14. No duplicate screens, databases or services should be created unnecessarily.
15. Existing working functionality must be preserved.

**The objective is one coherent Ofia commerce experience, with separate storefront and ERP applications, unified order tracking, multiple payment routes and a properly separated escrow infrastructure.**