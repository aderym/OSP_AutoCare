# OSP AutoCare — workshop management starter

A bilingual (English / Spanish) responsive shop management application using **Python 3 standard library + SQLite**, with no pip/npm installation required.

## Start

On Windows: double-click `START_WINDOWS.bat`, or open a terminal in the folder and run `python server.py`.

On Mac/Linux: `python3 server.py`.

Open **http://localhost:8080**.

Initial administrator access:
- Username: `osp`
- Password: `8432137633`

**IMPORTANT:** The credentials above are set only when the database is first initialized. Change the default password immediately using Settings → Employees → Edit → Password. For a public deployment, set `OSO_INITIAL_PASSWORD` in your environment **before first launch**, use HTTPS reverse proxy, configure server firewall and backups, and restrict access. SQLite file `oso.db` contains private customer information and must not be exposed to the web. Sessions are kept in server memory and expire after 12 hours. Do not use this starter as an internet-facing production system without additional hardening, CSRF defense, rate limits, audit logs and deployment review.

## Included
- Admin & employee accounts with per-role editing restrictions and password hashing
- Customers, vehicle records and repair/service histories
- VIN decoder via the U.S. NHTSA vPIC service (internet required)
- Work orders with technician assignments, stages and price fields
- Parts inventory, low-stock alerts and supplier profiles
- Purchase order records (manual), saved technical references
- Basic component **illustrations** by system (not vehicle-specific)
- Links to licensed OEM repair-data providers (not integrated)
- Custom replaceable logo (saved in each browser), English/Spanish UI, responsive layout, print tables

## Not included yet
Actual OEM year/make/model-specific diagrams, labor guides, wiring diagrams, procedures, live supplier stock/prices, supplier ordering accounts, SMS, payment processing, tax calculation, photo attachments, PDF invoices, VIN-based fitment, appointment scheduling, backups automation, or a hosted website. These require separate licensed datasets, integrations and production work.

## Data backup
Stop the server and copy `oso.db` to a safe location. For multi-user, Internet-facing production deployments use a properly secured database service and a managed hosting setup.

## Technical providers
- ALLDATA Repair: https://www.alldata.com/us/en/repair
- Mitchell 1 ProDemand: https://mitchell1.com/prodemand/
- AutoZone Pro: https://www.autozonepro.com/
- Advance Professional: https://www.advancepro.com/
- NAPA PROLink: https://www.napaprolink.com/
- O'Reilly First Call: https://www.firstcallonline.com/
- NHTSA vPIC VIN decoder: https://vpic.nhtsa.dot.gov/api/

## Brand and compatibility
Application display name is OSP AutoCare, prepared for ospautocare.com. Existing `oso_*` browser storage keys, `oso_session` cookie, `OSO_DB`/`OSO_INITIAL_PASSWORD` environment variables and `oso.db` default database filename are intentionally retained for backward compatibility. A name change does not publish the app or make it production-secure.
