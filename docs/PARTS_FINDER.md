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
