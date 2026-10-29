# OSP AutoCare — operational review

Review date: 2026-10-29. Scope: current source, local automated tests, build and managed-browser interface review. Live payment transactions, physical-device installation and a licensed OEM data feed are outside this verification.

## Changes completed

- Dark is the new initial theme, including the server-rendered page. A versioned preference starts existing installations on dark once; subsequent explicit light/dark choices persist.
- Menu has stronger text/icon contrast, a distinct selected row, keyboard focus and labelled navigation groups. The complete menu scrolls on short displays. The mobile toggle exposes its state and Escape closes it.
- Work orders reject invalid, negative and over-100% tax rates at the API boundary, as business profiles already do.
- Employee edits validate input before mutation and atomically save identity, optional password and session invalidation. Invalid passwords or duplicate usernames leave the existing account and session unchanged.

## Verified in local tests

| Area | Evidence |
| --- | --- |
| Owner login and tenant isolation | Owner bypasses subscription; moderators and employees remain scoped to their shop; cross-shop references rejected. |
| Signup / subscription gates | Seven-day trial duration, expiration, suspension and restored access checked. |
| Business / customer invoices | Per-shop fiscal identity, logo and customer/vehicle references; itemized totals and tax validation. |
| Employee management | Permission checks; failed edits roll back and preserve active sessions. |
| Workshop records | CRUD, linked-record deletion rules, parts quantity/price checks and export without credential hashes. |
| Payment and AI configuration | Stored secrets encrypted; provider calls tested with mocks, not real charges or live AI. |
| Vehicle studio | Body layouts, drivetrain / EV component rules, camera math, isolated parts and lower assemblies. |
| Installable app | Device selection, dismissal timing, manifest/icon dimensions, service-worker exclusions for private data. |

## Remaining product work for broader commercial operation

| Priority | Need | Current behavior |
| --- | --- | --- |
| High | Invoice payment ledger and balances | Customer documents show order amounts. No customer payment/refund/deposit ledger or balance reconciliation is implemented. Workshop subscriptions are a separate flow. |
| High | Inventory movements | Receiving a purchase is a record; stock quantities are adjusted manually. Purchase receipt and parts consumption need transactional movements and history. |
| High | Backup restore and recovery drill | Per-shop export exists; import/restore, scheduled backup and a documented recovery drill are not part of the application workflow. |
| High | Account recovery and audit trail | Admin can manage employee credentials. Self-service moderator recovery, owner MFA and a business change log require dedicated implementation. |
| Before charging | Live Stripe / webhook verification | Price and lifecycle are tested with mocks. Configure real platform credentials and verify checkout, renewal and failed-payment behavior in the target deployment. |
| Before relying on AI | Live configured-provider verification | Missing-key behavior and scoped context are tested; verify actual configured model/key behavior and costs separately. |
| For OEM accuracy | Licensed fitment / repair data | Catalog and VIN references exist; 3D meshes are generic teaching references. Exact engine variants, part fitment, torque and OEM procedures require verified licensed sources. |
| Before fiscal issuance | Applicable invoice numbering / authorization workflow | Optional document number and fiscal identifiers are printed; no jurisdiction-specific electronic invoicing or government authorization integration exists. |
| For production installation | Real-device acceptance | Android, iPhone/iPad, Windows and Mac installation and printed multi-page invoices require acceptance on target devices/browsers. |

The review records implemented behavior and concrete remaining work. It does not represent certification of every vehicle, fiscal workflow or live provider integration.
