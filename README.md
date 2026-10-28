# OSP AutoCare — Mechanical, body & paint workshop management

## Copia del Site para el entorno de pruebas

El código de esta copia coincide con la versión 8 del Site. La base portable está
en `data/snapshots/osp-autocare.sqlite`: es una copia de los registros actuales de
D1, con el perfil completo del taller y su logo, usuarios y biblioteca técnica.
`data/snapshots/osp-autocare.json` indica la fecha de captura, los conteos y SHA-256.
No contiene contraseñas, sesiones, bloqueos temporales ni claves de OpenAI/Stripe/webhook.
Al iniciar, el administrador local de esta copia recibe la contraseña de
`BOOTSTRAP_ADMIN_PASSWORD`; no se modifica una contraseña que ya esté inicializada.
Las claves se configuran por separado en el entorno de pruebas.

El entorno Docker y Nginx se administra fuera de este repositorio. En tu estructura,
`remoto_ssh/docker-compose.yml` monta `remoto_ssh/apps/OSP_AutoCare` en `/app`.
Desde la carpeta `remoto_ssh`, ejecutar:

```bash
docker compose -f docker-compose.yml stop osp-autocare
git -C apps/OSP_AutoCare pull --ff-only
docker compose -f docker-compose.yml run --rm --no-deps -T --entrypoint node osp-autocare scripts/restore-test-db.mjs --app-stopped
docker compose -f docker-compose.yml up -d osp-autocare
```

Ejecutar cada paso solo si el anterior termina correctamente. El comando de
restauración verifica la integridad y el checksum; si existe una base local,
primero crea un respaldo consistente en `runtime/backups/` y después la reemplaza
por la copia del Site. Los datos locales adicionales quedan en ese respaldo,
no se fusionan con los del Site. Detener también cualquier otro proceso que use
el mismo archivo SQLite antes de restaurar.

El archivo de trabajo `runtime/osp-autocare.sqlite` sigue fuera de Git. `git pull`
descarga la copia guardada, pero solo el comando explícito de restauración cambia
la base local. Las escrituras posteriores del Site no actualizan automáticamente
el archivo del repositorio: una nueva sincronización requiere otra captura.

English / Español. Dark green, black and white. This package includes the complete source, hosted Sites configuration, SQLite schema and Node standalone server. Docker Compose, Dockerfiles and Nginx configuration are maintained in the separate local infrastructure directory.

## Administrator

- Username: `osp`
- Initial password: set `BOOTSTRAP_ADMIN_PASSWORD` in your local environment.
- OSP is the platform owner/administrator. Sign in directly; no signup, trial or subscription is required for this account. Public registration is for independent workshop moderators. Login clears the previous selected workshop; an invalid stored workshop falls back safely to the owner workspace. The owner Subscription page manages collection settings, not a personal paid plan.
- The hosted review is public and opens the OSP application login directly; no ChatGPT account is required. Workshop records remain protected by the application session and tenant permissions.
- Change it from Settings → Account security. Changing it invalidates existing sessions.
- The initial account is created server-side on the first sign-in, using `BOOTSTRAP_ADMIN_PASSWORD`. Passwords are stored with PBKDF2-SHA256, unique salts and 100,000 iterations.

## Local execution

Requires Node 24 and pnpm 11.25.0. The application repository contains the code,
assets, dependency manifests, migrations and portable test database. The local
infrastructure directory contains `docker-compose.yml`, `.env`, Docker and Nginx
configuration; none of those infrastructure files is maintained in this repository.

Your layout:

| Location relative to `remoto_ssh` | Purpose |
| --- | --- |
| `apps/OSP_AutoCare/` | This Git repository, mounted at `/app` |
| `docker-compose.yml` | External service configuration |
| `nginx/default.conf` | External reverse proxy configuration |
| `docker/` | External infrastructure assets |

Use your external Compose with service `osp-autocare`, Node 24, the `/app` working
directory and `DATABASE_PATH=/app/runtime/osp-autocare.sqlite`. Keep
`PAYMENT_ENCRYPTION_KEY` stable and configure `BOOTSTRAP_ADMIN_PASSWORD` in your
external environment. Set `APP_ORIGIN` to the actual browser-facing origin.
The runtime SQLite file persists through the bind mount at
`apps/OSP_AutoCare/runtime/osp-autocare.sqlite`.

Without Docker, install packages with `pnpm install --frozen-lockfile`, build with
`pnpm exec vite build --config standalone/vite.config.ts`, configure the application
environment variables, and run `node --experimental-strip-types standalone/server.ts`.
Never serve the SQLite database or environment files publicly.

## Workflow

1. The workshop owner chooses **Create workshop · 7 days free** on the login page and provides business name, owner name, email, phone, address, username, password and an optional logo. Registration creates an isolated workshop and moderator account and signs them in. OSP may also create workshops manually from Workshops (these do not receive a trial automatically).
2. Self-registered workshops receive exactly 7 days of full operational access from server registration time, without a card. The expiration date is visible on the dashboard and subscription page. After expiry, the moderator must subscribe for $49.99 USD/month; operations are blocked server-side for both moderator and employees, including existing sessions. Records are retained. Billing, profile and security settings remain accessible. Subscribing during the free trial starts paid billing immediately; there is no automatic charge without subscribing. Disabled shops are blocked regardless of trial/payment.
3. During the trial or paid access, the moderator creates employee accounts under Team members. The business logo, name, address, phone and email are used in printed work orders/invoices and PDFs.
4. Add customers, vehicles, suppliers and stock. Work orders now include an inline year/make/model catalog: register the vehicle and automatically select it in the order, without closing or losing the order draft. Open repair/body/paint work orders and assign technicians. Track labor, parts/materials, tax, due dates, damage descriptions and paint processes/codes.
5. Move orders through Draft, Approved, In progress, Paint booth, Quality check, Completed and Delivered. Print/save a work order as PDF using the print view.
6. Record maintenance history and purchase orders. Purchase receiving status is a record: stock quantities are updated manually. Work order parts costs do not automatically consume inventory.
7. Export workshop records from Settings → Your data. The JSON export excludes password hashes, sessions and payment secrets. It is an export; no in-app restore/import is implemented.

## Roles and isolation

- `owner`: OSP platform administrator, can select independent workshops, create moderators, enable/disable access, verify externally paid periods and configure platform payments.
- `moderator`: workshop owner/manager; manages its profile, employees, records and own payment settings.
- `employee`: operates only within its workshop; cannot administer subscriptions, payment settings, users, exports or delete records.

Tenant selection is checked server-side; employee/moderator requests cannot change shop by passing another ID. Usernames are globally unique. Employee disabling/reset revokes that employee's sessions. Public signup passwords require 8–128 characters; existing administrator-created credentials and password changes retain the six-character minimum. Sign-in throttles failed attempts for 15 minutes. Public signup is rate limited, usernames are unique, and the original normalized registration email can receive only one trial. Profile edits and sign-ins never reset the trial; the expiry is stored separately from the editable profile. Email ownership is not verified in this release; different emails can create separate workshops. Existing workshops are not retroactively granted trials. The review Site is publicly reachable for self-service registration; its workspace records remain protected by app login.

## Stripe and Autobooks

OSP Settings → Payment methods controls the **$49.99 monthly platform subscription**. Provide publishable key, secret key, webhook signing secret, and optional HTTPS Autobooks payment link. Keys are never included in a client bundle or export; secret/webhook values are AES-GCM encrypted at rest.

Create a Stripe webhook pointing to `https://YOUR_DOMAIN/api/webhook`. Subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. The webhook checks the signature and timestamp, then retrieves the current Stripe subscription to avoid stale event state. The app creates a Stripe-hosted recurring Checkout session for USD 49.99/month. The return page verifies the checkout server-side; access is never activated just by visiting a success URL. No live card charge has been tested or performed in this deliverable because account credentials were not provided.

Enable Stripe Customer Portal in your Stripe account for the Manage / cancel subscription button. Expired shops with an existing subscription should use that portal to repair payment. The software blocks creation of another subscription while an existing one is active, incomplete, or past due.

Autobooks links open externally. There is no verified Autobooks webhook integration: OSP must verify that payment and save a manual paid-through date in Workshops. This does not automatically create a recurring Autobooks payment schedule. Configure the payment schedule in Autobooks itself if available in your account.

Moderators also have separate publishable/secret key and Autobooks fields for **their own workshop**; these are saved securely and do not replace the OSP subscription credentials. Customer invoice charging with these moderator keys is not implemented in this release.

Keep Stripe test and live modes consistent. Do not enter actual card data into OSP AutoCare; card entry happens in Stripe Checkout.

## Vehicles and technical library

The vehicle form supports Year, Make, Model, VIN, engine, trim, plate, mileage, color and paint code. Choose a year and make to load models automatically. Select an engine/transmission/drivetrain configuration if needed. The same selector works inside new work orders. Save vehicle & use in this order stores the customer vehicle in the workshop and selects its returned record ID. Use Decode VIN for the live NHTSA vPIC service. The package includes an official vPIC snapshot of 12,416 make records downloaded on October 26, 2026 (America/New_York), plus a common-makes starter list. Make suggestions search this bundled snapshot. In addition, the local EPA/DOE catalog contains 50,407 actual vehicle configurations and 26,508 year/make/model combinations for 1984–2027. Year-specific model, engine, transmission and drivetrain menus load from bundled files without requiring NHTSA. Additional vehicles can be queried online or entered manually; VIN decoding still requires internet. This is not a complete offline worldwide make/model/year catalog. vPIC mainly covers US-regulated vehicles and VINs from 1981 onward; availability and data coverage vary. Manual entry remains available for older/non-US models, API interruptions or missing data.

Official references: https://vpic.nhtsa.dot.gov/api/ and https://www.fueleconomy.gov/feg/ws/
The local catalog is a snapshot of the EPA/DOE Find a Car dataset. It covers the vehicles/configurations represented in that dataset, not every vehicle worldwide or every heavy-duty model. Original ZIP SHA-256, download date and counts are recorded in data/catalog/epa-catalog-metadata.json. Rebuild with `python3 data/import-epa-catalog.py /path/to/vehicles.csv.zip`.
The optional `data/sync-vehicles.mjs` downloads all official make records and optionally the available models for selected make/year pairs. VINs sent for lookup are transmitted to NHTSA. OEM diagrams, wiring plans and repair manuals are not licensed or bundled; Technical library stores your authorized reference URLs and source/license notes.

## Database

The required tables are present: `users`, `customers`, `vehicles`, `suppliers`, `inventory`, `workorders`, `services`, `purchases`, `diagrams`. Supporting tables: `shops`, `sessions`, `auth_attempts`, `payment_settings`.

Operational tables use `id`, `shop_id`, JSON `data`, and `updated`. `data` holds the fields defined by `schema` in `app/page.tsx`. Linked customer/vehicle/supplier/workorder IDs are validated within the same shop. Linked records cannot be deleted until their references are removed. SQL schema is generated by Drizzle migrations. Local Node SQLite and hosted D1 use the same schema and API implementation; they are separate databases and do not sync automatically.

The separate data ZIP contains a ready-to-use initial SQLite database, schema and seed SQL, and empty JSON record files. Only the OSP admin and demo shop are seeded; there are no real customer records or actual Stripe credentials. Password hashes are not plaintext passwords.

Back up the Docker volume/SQLite database and encryption key separately. For an offline SQLite copy stop the app first, or use SQLite's backup API to avoid losing WAL data.

## Hosted preview

The hosted review version is owner-private and may request ChatGPT sign-in before the OSP login. The standalone VPS/Docker version uses the OSP login directly. The review deployment and downloadable initial database have separate data.

## Validation

`node --experimental-strip-types tests/integration.ts`

Covers bootstrap login, bad password rejection, CRUD across required modules, isolated shops, cross-shop reference rejection, role checks, subscription gating, immediate workshop disabling, encrypted key storage, safe exports, linked-record deletion protection, mocked Stripe subscription checkout ($49.99), cross-workshop payment rejection, signed/forged webhooks and logout. Visual review covered the sign-in page and the vehicle-catalog component, including selecting a 2024 Toyota Camry and its engine/transmission/drivetrain configuration. Integration checks verified saving the new vehicle, returning its ID, and linking that ID in a work order. Authenticated browser sign-in and live Stripe / Autobooks transactions were not performed. Build validation covers the hosted and standalone frontends. The external Docker infrastructure was not run in this environment.


## Work orders: fast vehicle intake, parts and supplier directory

Every new work order opens the year/make/model catalog directly, even when the workshop already has saved vehicles. Alternatively choose a registered vehicle. Saving the work order registers an unsaved selected vehicle automatically and links its returned ID. The separate Save vehicle button remains available. Catalog coverage is documented above.

A bilingual parts selector includes 284 general part names across 14 categories. Search by English or Spanish, choose workshop inventory, or enter any custom part. Each order line stores part name/number, New/Used/Repair/Remanufactured condition, supplier, quantity, unit price and notes. Add each line with Add part to order. Additional parts/materials remains a separate optional amount; totals include lines plus this extra amount, labor and tax. Existing orders without lines keep their original totals. Part lines are printed on the work order/PDF. The server validates quantities/prices, recomputes the total and rejects suppliers or inventory IDs from another workshop. Inventory is not automatically depleted by adding an order line.

The supplier directory has 20 initial entries covering new, used, remanufactured, paint and collision supplies. It is a starting directory, not an exhaustive list of every supplier. Select a directory entry in an order, save it to the workshop's Suppliers, or add any local supplier/repair service. Directory URLs were checked against official company sources when this update was prepared. Manufacturers and marketplaces are identified by their names/type; purchase terms, availability and pricing are checked with the supplier. No supplier API account, live stock synchronization, automatic fitment guarantee or part ordering is included. Supplier URLs are in public/parts-catalog.json, and the same file contains the reusable part-name library.

## Appearance

The logo palette is deep teal, charcoal/black, ivory/white and metallic gold. Use Light/Dark in the login page or top bar. The choice persists on the current browser/device. Printed work orders use a light print layout regardless of the screen theme. Custom workshop logos remain supported.

Additional validation covers itemized totals, invalid quantities/prices, supplier/inventory tenant boundaries and protection against deleting referenced stock/suppliers. Browser component QA confirmed catalog selection, adding two used brake rotors from LKQ at $25 each, a $159 total with $100 labor and 6% tax, and switching the dark/light theme. Live ordering or payment to suppliers was not performed.


## Technician help hub

Technician help / Ayuda al técnico is available from the sidebar, dashboard and saved work-order row actions. The Technical help button in a work-order form opens a separate overlay and preserves the order draft below it. Save or discard an edited technical worksheet before closing that overlay.

The researched directory contains 25 external resources in 10 categories, including CarCareKiosk/1A Auto videos, PartSouq/Amayama/RealOEM/7zap parts diagrams, ALLDATA/ProDemand repair and wiring systems, selected official OEM service portals, NASTF, NHTSA recalls/manufacturer communications, I-CAR collision information, 3M processes, PPG product sheets, Pico guided testing and ASE/DENSO training. Directory entries include a description, access label, provider evidence URL and check date. Read the access label: external subscriptions, accounts, market coverage and equipment are separate from OSP AutoCare. External paid manuals are linked, not licensed, embedded or downloaded into OSP. Third-party part illustrations describe component arrangement, not an installation procedure or universal torque specification.

Choose a saved work order/vehicle and a component or topic. Resource filters support category, access and make. Search this site by vehicle/topic opens an external Google site search for year/make/model/topic and worksheet DTCs; it does not transmit VIN, plate or customer identity. Provider sites may separately ask for VIN. Save reference creates a workshop-scoped Technical library record linked to the selected vehicle/order. The directory and source URLs are in public/technical-resources.json, checked October 26, 2026 (America/New_York); access and coverage may change.

The technical worksheet stores complaint, DTCs/module, baseline findings, tests, measured values, sourced torque/fluid specifications, equipment/calibration notes, reference URL, verification and a documentation checklist. Data is saved server-side on the existing work order, with author name and timestamp. It is visible only within the authorized workshop; unpaid/disabled access gates apply. Financial order edits preserve the worksheet. The printed order includes its saved DTC/test/measurement/verification summary. The hub does not connect directly to an OBD adapter, infer vehicle diagnosis or automatically pull paid OEM specifications.

Calculators include torque, pressure, liquid volume, length and temperature conversions; basic DC Ohm's law; and a ratio-by-volume paint calculator. Values are user-entered. Use exact product TDS ratios and actual manufacturer procedures/specifications. The workflow/toolkit panel is a planning aid for mechanical, electrical, collision, ADAS and hybrid/EV jobs; it does not provide step-by-step high-voltage isolation or programming procedures.

Validation covers worksheet persistence, cross-workshop/anonymous denial, HTTPS references, preserving monetary totals and technical data across edits, calculator arithmetic/error cases, valid resource metadata and exclusion of VIN/plate from generated external searches. Component browser QA verified diagram-category filtering, make filtering, bookmarking and displayed converter/Ohm/mixing results. Authenticated full-workflow browser testing remains subject to the preview login limitation noted above.


## Interactive vehicle map and workshop assistant

Vehicle map + AI / Mapa vehicular + IA is available from the menu and the work-order form. Select a registered vehicle, saved order or a preview from the existing vehicle catalog. The EPA catalog now retains body class in each configuration; selecting the model supplies its class and selecting a configuration supplies engine/transmission/drive/fuel/body-class details. Supported VIN results also retain body class. An original procedural 3D reference model covers car, SUV, pickup truck and van/minivan. Rotate by drag/touch or arrow keys, zoom with buttons/wheel/pinch, use camera presets, reveal components through the body, or separate assemblies. The body class is preferred; model-name estimation is labelled and can be overridden.

Search/select the 284 general part names. Selected assemblies are highlighted in gold, with numbered location markers and axle/side controls where applicable. Internal engine parts are located at their parent assembly; paint materials use a whole-body reference. Confirm powertrain applicability before using a location. These are teaching/reference geometries, not licensed year/model/engine-specific factory CAD. Exact mounting, engine orientation, routing and fasteners require the correct OEM diagram. PartSouq and Amayama links provide starting points for vehicle/topic searches. With a saved order selected, Use part in work order adds a zero-priced draft line for review; it does not save or order automatically.

### Contemporary vehicle and component studio

The original 3D reference bodies now have sculpted wheel openings, modern LED signatures, panoramic roof glass, body seams, mirrors, multi-spoke wheels and visible cabin furnishings. Detailed mechanical assemblies include an illustrative inline-four turbo engine (coils, intake runners, turbo/manifold, accessory drive and oil pan), vented alternator, brake rotors/calipers, springs, radiator/fans and electric powertrain components where applicable. They are original procedural illustrations, not real OEM scans or a claim that every selected engine is an inline-four.

Tap a visible surface or numbered part marker to open Component Studio. It isolates the assembly in a separate rotatable/zoomable 3D viewport with camera presets and bilingual feature notes. Dedicated illustrative views cover piston/rod, spark plug, filters, brake pads and strut, as well as the main engine/alternator/brake assemblies. Other names show their parent assembly explicitly; a gasket, wire set or mount is not presented as an individual CAD model. The dropdown and Inspect part in 3D button provide the same workflow by keyboard. Native modal focus containment, Escape/close, background scroll locking, and a stacked mobile layout retain the main vehicle camera when dismissed. The example artwork supplied by the user informed the inspection interaction; its labels and geometry were not used as technical specifications.

Run `node --experimental-strip-types tests/vehicle-studio.ts` for geometry, powertrain, camera/picking, isolated fitting and component-versus-assembly checks. Browser QA covers direct mesh selection, marker selection, modal orbit/zoom/Escape and a 390px mobile layout. Exact installation, dimensions and compatibility still require the applicable OEM source.

### Embedded review login

The login password has an accessible bilingual show/hide control. HTTPS embedded reviews request an HttpOnly, Secure, SameSite=None, Partitioned session cookie; normal top-level sessions retain SameSite=Lax. Origin validation and access controls remain enforced. After login/signup, the app verifies that the browser retained the session and explains how to open the full app if it did not. Embedded reviews also show an open-in-new-tab link. Browser privacy policies can still prevent embedded storage. Tests cover cookie attributes, logout clearing and cross-origin rejection; live third-party browser authentication must be checked in the target browser.


### Local search

Local search works without an external key. It searches this workshop's saved records, the part-name library and the curated resource directory. It is explicitly labelled as search, not AI. Record results are scoped server-side and can be opened in the application. General part-area information is illustrative. Queries are not a scan-tool connection, live supplier lookup or diagnosis.

### AI configuration and behavior

OSP owner Settings → AI assistant → enter an OpenAI API key, Responses API model ID (default `gpt-4.1-mini`) and enable AI. Keys are AES-GCM encrypted with the existing runtime encryption key, never returned to the browser or exported. A blank key preserves the existing value. The setting is separate from Stripe credentials and is owner-only. The endpoint accepts a `clear` flag for administrative key removal. Alternatively, a server-only OPENAI_API_KEY environment value can be provided to the standalone runtime; the first local search reports its availability. The UI configuration is the usual supported setup path.

AI runs only when the user sends an AI question. It uses the official OpenAI Responses endpoint with `store:false`, selected vehicle technical fields, optional saved-order diagnostic context, matching operational records and curated resource metadata. VIN, plate and customer contact fields are excluded from the constructed vehicle context; customer table results are excluded from AI context. User-typed questions and free-text order notes can still contain information the operator entered, so review what you send. The provider receives that request and bills API usage to the configured account. `store:false` is a response-storage setting, not a claim of zero provider retention. This release does not enable web browsing, paid-manual retrieval, model fine-tuning or a vector upload of the whole database.

The assistant provides read-only suggestions, clearly distinguishes AI output from local results, does not alter records or payments, and is instructed to avoid unsupported OEM specifications/diagnoses and treat record content as untrusted. Exact specifications, pinouts, torque and part locations require the applicable OEM source. Provider references are starting points, not evidence the model opened their pages. Other workshops and payment secrets are never included. Requests enforce subscription/access gates and an 8-request/minute/user limit. Recent chat turns live only in the current UI; they reset when vehicle/order/part context changes.

API integration was tested with mocked OpenAI responses, including key encryption, unconfigured behavior, tenant boundaries, input context minimization and response parsing. No actual model request or charge was made: configure your own key and account billing before live use. Browser component QA verified selecting a radiator and changing car/SUV layouts. Tests verify the four body classes and ambiguous axle handling. The app is not a licensed OEM-specific diagram service or an autonomous diagnostic system.

Official API references checked for implementation:
- https://developers.openai.com/api/docs/guides/text
- https://developers.openai.com/api/docs/guides/migrate-to-responses
- https://developers.openai.com/api/docs/models/gpt-4.1-mini

## Versioned database copy

See [`database/README.md`](database/README.md) for the portable SQLite database, SQL schema/data, JSON snapshot, capture counts and restore instructions. This repository copy excludes live password hashes, sessions and payment/API credentials. The large custom demo logo was truncated by the hosted data reader and is omitted; this limitation is documented in the manifest. All snapshot accounts are disabled with empty password fields. Run `database/initialize_owner.py` on a copied runtime database to set a local OSP credential; no password hash is committed. It is a fixed portable snapshot, not automatic live database synchronization.

## Manufacturer technical library

Technical library includes a manufacturer-portal directory above the workshop's saved references, with make and text filters. Fifteen additional OEM portals bring the directory to 21 manufacturer portals and 40 total help resources. New links cover GM/ACDelco, Stellantis, Mercedes-Benz, Audi, Mazda, Subaru, Hyundai, Kia, Genesis, Volvo, Jaguar/Land Rover, Porsche, Tesla, MINI and Mitsubishi. Existing Toyota/Lexus, Ford/Lincoln, Honda/Acura, BMW, Nissan/INFINITI and Volkswagen remain. Explicit brand arrays preserve multi-word makes (Land Rover, Mercedes-Benz) in both Technical library and Technician help. Links open at the provider; no paid manuals are copied and no provider subscription is included in OSP. Provider URLs and access guidance were checked against manufacturer portals and the NASTF OEM directory on 2026-10-28.

## Aerodynamic reference body update

The previous squared reference exterior is replaced by continuous curved hood, side and bumper surfaces, raked glazing, a descending rear roofline, integrated LED lighting, flush handles and turbine-style wheels. Car, SUV, pickup and van retain separate roof/cabin proportions. Body dimensions also drive roof markers. This is an original aerodynamic concept reference, not a representation of a named production model or a guaranteed match to the selected vehicle.

The viewport uses a depth-tested, smoothly lit WebGL renderer where supported, with the canvas renderer retained for environments without WebGL or after a graphics-context loss. Closed-body canvas views conceal interior assemblies; see-through mode, exploded views, part markers and isolated inspection continue to work. Geometry tests cover the revised proportions and curved side widths. Browser QA in this review environment exercised the canvas fallback because WebGL was unavailable; live accelerated rendering was not verified here.

## Service-lift underbody view

The Underbody preset now looks broadly upward from below and enters a dedicated lift view. The exterior/cabin is removed and markers switch to lower components; returning to Perspective restores the exterior. The floor is raised above the driveline instead of being an opaque low slab. The canvas and WebGL paths share this visibility filter, and the ground shadow is suppressed when viewed from below.

The original reference meshes include the engine oil pan and drain plug, transmission, propeller shaft, universal joints/yokes, CV half-shafts with bellows, differential, AWD transfer assembly, fuel tank/straps, catalytic converter, exhaust/muffler, brake and fuel routing, parking-brake routing, rails/crossmembers, steering and suspension. Isolated inspections are available for the oil pan, universal joint, CV shaft, driveshaft and differential; other selections retain the explicit parent-assembly treatment. Spanish search also recognizes cardán/cardan, cruceta/criseta, flecha and cárter/carter.

Reference layout is inferred from the saved drive field: FWD omits the rear propeller shaft/universal joints, RWD drives the rear axle, AWD includes the reference front and rear drive paths. Unknown drive fields use an explicitly labelled AWD reference. Electric layouts omit combustion oil pans, fuel/exhaust and mechanical propeller shafts. Generic geometry does not prove actual fitment, suspension type or routing; the exact configuration requires the appropriate OEM diagram. Tests cover floor clearance, visible lower tags, layout exclusions and isolated components. Browser QA checked the lift preset, joint inspection and FWD/EV markers in the canvas fallback.

### Customer invoices and business identity

Create workshop, self-service signup and Settings → Business profile now collect the workshop logo, legal name, tax ID, business registration, repair-shop license, street/suite, city, state/province, postal code, country, phone, email, website and invoice terms. The tax identifier is separate from the sales tax percentage (0–100%). Owner-created shops persist these fields immediately; existing workshops can be edited through Workshops → Edit business / invoice profile. Uploaded PNG/JPG/WebP logos are validated and stored in the existing per-tenant JSON profile; no schema migration is needed.

Settings → Preview customer invoice / PDF opens a clearly marked sample without writing a customer or order. Work order → Invoice / PDF uses the saved customer/vehicle records and the current order draft, including an optional document number; otherwise the order identifier is used. Customer tax ID is optional. The customer document has separate workshop and OSP logos, business/fiscal/contact information, itemized parts, labor, additional materials, subtotal, tax amount and total in USD. It supports English/Spanish, white paper output even in dark mode, repeated table headers and page-safe rows. Print / Save PDF opens the browser’s print dialog; choose Save as PDF or a printer. Invoice data is operational documentation; no government fiscal authorization or payment confirmation is generated.

Validation: TypeScript and local API integration suite passed, including identity persistence across creation/signup/profile updates, logo/type and tax validation, and tenant isolation. Invoice UI was reviewed with sample data in the managed browser; native printer output depends on the user’s browser print settings.
