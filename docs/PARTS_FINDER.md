# OSP Parts Finder / Buscador de partes

Added 2026-10-31. Open **Parts finder / Buscador de partes** in the workspace menu.

## Included

- 636 bilingual part names/aliases and repair/material references from the existing catalog, across 14 systems; these are generic references, not product SKUs or vehicle-specific fitment records.
- Registered vehicle and order selection; shared year/make/model/engine catalog and NHTSA VIN decoding, with manual entry for unsupported vehicles.
- Workshop inventory search, with saved product image display where present.
- 37 supplier/catalog destinations: OEM diagrams, new, used, remanufactured and paint. Vehicle make filters apply where coverage is known. Broad distributors remain visible; this does not guarantee they stock a part.
- Explicit provider catalog links and contextual web searches. PartSouq has a part-number search and an opt-in VIN/frame link. Other generic web searches do not pass VIN or customer information.
- Wikimedia Commons reference image search, enlarging dialog and attribution/license/source links. Images are references, never exact VIN matches or seller stock photos. Missing images and service failures have explicit empty/error states.
- Optional official eBay Browse API integration: up to 24 current listings with seller photos, price/currency, condition, seller and provider compatibility status. Partial/unknown compatibility is preserved. Results are not automatically certified to fit.
- Review-before-save inventory drafts and work-order part drafts. Non-USD listing prices are not silently converted to USD. Shipping, taxes, core charges and any required programming/calibration must be checked separately.

## Enable live eBay offers

The **OSP platform owner** opens **Settings → Parts search · eBay connection**. Enter the production **App ID / Client ID** and **Cert ID / Client secret** from an eBay developer application with production Browse API access. Enable and save the connection. Blank fields retain stored credentials; the separate remove checkbox clears them. The secret is encrypted server-side using the existing `PAYMENT_ENCRYPTION_KEY`. That encryption key must be retained for restarts and migration. Secrets/tokens are not returned to workshops, put in links, exported or committed.

The server uses the documented client-credentials OAuth grant, caches a valid token in memory until shortly before expiry, and calls Browse API with marketplace `EBAY_US`, category `6000` and year/make/model compatibility attributes. The VIN is not sent to eBay. Provider access requirements may vary; saving credentials is not proof that eBay has granted production access. Actual live offers cannot be verified without those credentials. The adapter is tested with controlled API responses.

No OpenAI key is required for local part search, catalog links or reference images. Amayama, PartSouq and other provider inventories are not mirrored or scraped; their product content requires provider-supported access for a full in-app integration. Catalog searches may require JavaScript, cookies, accounts, region/dealer selection or subscriptions.

## Data maintenance

- `public/parts-providers.json`: bilingual descriptions, provider type, make scope, VIN/diagram capabilities, source and inspection status. `entry` means landing-page research only; `limited` means the entry could not be fully inspected. It does not certify every product, lookup or image.
- `lib/parts-finder.ts`: matching, privacy-preserving links, API adapters and response normalization.
- `tests/parts-finder.ts`: source data, bilingual matching, VIN controls, safe URLs, API normalization, OAuth reuse and license metadata.
- `tests/integration.ts`: authentication, trial gate, owner-only configuration, encrypted secret storage and mocked API boundary.

## Official references reviewed

- https://www.amayama.com/en
- https://meta.partsouq.com/en/how-to-place-an-order-on-the-partsouq-com-368.html
- https://www.rockauto.com/help/?page=1
- https://developer.ebay.com/api-docs/buy/api-browse.html
- https://developer.ebay.com/develop/guides/sell/authorization
- https://www.mediawiki.org/wiki/API:Imageinfo
- https://www.mediawiki.org/wiki/API:Search

## Uso en español

Seleccione el vehículo registrado o ingrese VIN/año/marca/modelo. Elija una orden si quiere agregar piezas a su borrador. Escriba nombre, alias o número de parte y pulse **Buscar partes**. Revise **Catálogo**, **Inventario**, **Proveedores**, **Ofertas** y **Fotos**. Las fotos de referencia no confirman compatibilidad. En proveedores use **Abrir catálogo**, **Buscar web en este sitio** o la consulta de número de parte de PartSouq. El VIN solo se envía a PartSouq al activar su opción y abrir su botón específico; los demás catálogos permiten copiarlo y consultarlo manualmente. Confirme el número OEM, motor, versión, posición, condición y precio final antes de comprar.

## Simplified combined search

The default view now keeps local part/stock matches, an interactive local component diagram, internet photos and internet diagram references together. Quick example buttons and each local result’s **Photo + diagram / Foto + diagrama** button start the complete search with one click. Detailed inventory, supplier and live-offer tabs remain available through the optional detailed-views control. Spanish catalog names also resolve to English inventory names.

The photo API can additionally retrieve diagram references with `includeDiagrams: true`. Each service result has its own unavailable flag, so a failed diagram request does not discard successful photos. Results retain attribution and source links; PDF book covers and other non-image documents are excluded. A generic local 3D illustration is not an OEM drawing or a confirmed VIN fitment. Web photo/diagram buttons provide a wider contextual search when the reference service has no matching image. External prices still require the optional provider connection; image and diagram references do not require an OpenAI or eBay key.

## Expanded image gallery

The image section has no numbered heading or filename captions. Responsive photo tiles preserve compact author/license links and open the full image dialog. Photo queries request up to 24 records per page and use the official response continuation offset for **Load more photos / Cargar más fotos**. Results append without duplicate source URLs; changing the query invalidates pending loads. Offsets are validated and bounded to the provider's 10,000-record search window. A missing continuation hides the load-more control. Failure preserves already loaded photos and allows retry. Source coverage and relevance vary; the wider web-search link remains available. The alternator category was checked against two live pages (24 + 24 distinct images).

## Bundled PNG library (initial selection)

The finder now displays **30 local PNGs for 15 representative components across all 14 existing systems** before internet results. This is initial coverage, not an image for each of the 636 references. Every included component has an original illustration and an annotated schematic with three bilingual identification callouts. These are **generic, not OEM, not to scale, and not repair/installation instructions**. There are no torque specifications, wiring pinouts or verified VIN applications.

- Browse immediately on opening the finder, or filter by English/Spanish name, accent-insensitive aliases and system. The local catalog's stable `part-*` IDs constrain media results, and catalog cards link to included illustrations.
- Switch between illustrations, annotated diagrams and all images. The gallery shows up to 24 local assets initially and supports showing more. Click to enlarge or download the PNG. The same library is available in the detailed images view.
- The existing registered vehicle/work-order/shared vehicle catalog selection supplies display/search context. No VIN, customer details, make/model or year are added to local media URLs. The library makes **no fitment claim**, even when a vehicle has been selected. A different vehicle does not turn a generic reference into an exact part match.
- Local lookups need no image API, database request or credentials. PNGs are same-origin static files in the application release. Internet photos, diagrams, pagination, attribution and optional seller offers remain complementary. This does not add a service-worker offline cache or promise an offline app launch; the app/static files must already be available.

### Files, provenance and regeneration

`public/parts-media/<system>/<component-id>/{illustration,diagram}.png` contains the bundled assets. `public/parts-media/manifest.json` records stable component IDs, bilingual names/aliases, system/category, media kind, original provenance, author, license, generic vehicle scope, explicit `oem: false`, `fitment: unverified`, editable SVG source and PNG SHA-256. `lib/parts-media.ts` performs pure local matching. Images and manifest are part of source control; no database migration, seed change, customer data change or production connection is required.

All 30 images are original programmatic vector drawings, rasterized to PNG. The drawings/SVGs/PNGs in this selection are dedicated under **CC0-1.0** by OSP AutoCare; the attribution record is retained in the manifest and `public/parts-media/ATTRIBUTION.md`. This dedication covers these artwork files, not the application's code or other images. **No third-party photographs are stored or redistributed by this change.** Existing live Wikimedia results stay external and retain their own author/license/source links.

To extend coverage, add an existing catalog component ID, system slug, drawing and translated callouts to `assets/parts-media/components.json` and `scripts/generate-parts-media.py`. With Python 3, Node and installed app dependencies (including Next.js's `sharp` optional dependency), run:

```sh
python scripts/generate-parts-media.py
npm run test:parts-media
```

The generator never downloads images or contacts a database. Review the regenerated SVG and PNG visually and commit both with the manifest. Raster output hashes can differ between rendering/font versions; regenerate and commit hashes together. Text uses DejaVu Sans; install that font for the intended appearance. Do not attach an unlicensed third-party asset or relabel these drawings as OEM. Future third-party additions must document the actual source, creator, redistribution/storage permission, license version/link, attribution, modifications and any share-alike obligations before acceptance. Future OEM assets additionally require authorized provenance and explicit application metadata; no OEM artwork is included today.

### Validation

`npm run test:parts-media` checks PNG signatures/dimensions/hashes, coverage of 14 systems, stable catalog linkage, EN/ES/alias parity, provenance and fitment flags, filtering, missing coverage, VIN-free display context, network-independent lookup, bilingual React output and default finder integration with network disabled. The PR workflow runs it with existing catalog/finder regressions and TypeScript checks. Tests use fixtures/static files; they do not access or modify production data.
