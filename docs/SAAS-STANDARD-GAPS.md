# Šta još ima smisla dodati (samo papir)

**Status:** istraživanje. **Ne implementirati** dok Jovica ne odobri stavku.
**Datum:** 18. septembar 2026.
**Pitanje:** šta je standard kod ovakvog B2B SaaS-a, šta bi korisnika učinilo da mu je Hansala zanimljivija, i šta je to **u kodu**.

Izvori (javni standard, ne nagađanje): Google Search Central (crawlable HTML, ProfilePage); Clutch / Trustpilot TrustBox / G2 (widget, shortlist, CRM, badge); WorkOS enterprise checklist 2026 (SSO, SCIM, audit, RBAC); agent-native SaaS 2026 (`llms.txt`, hosted MCP, `.well-known`, OpenAPI, webhooks); D&B / Credly (PDF fajl, share-to-LinkedIn). Hansalino pravo ostaje iznad svega: public samo `confirmed`, autor immutable, ne prodajemo marku ni rank, AI ne potvrđuje.

---

## Već imamo (ne ponavljati)

Profil + confirm loop, widgeti (Pro), sertifikat, one-pager, testimonials, assessment, mapa, `/best`, public API, Agent API, MCP (`npx`), webhooks (Pro), Slack, tim, verifikacija domena, insights, scheduling, grupe, OAuth, `llms.txt` / `llm.md`, direktorijum `/companies`, IndexNow, SearchAction.

Rupa nije „nemamo proizvod“. Rupa je što **korisnik ne može da ponese dokaz tamo gde radi** (mejl, LinkedIn, CRM, tender PDF, agent u tuđem runtime-u) i što **buyer** na Hansali još nema alat da poredi firme.

---

## Šta namerno ne dodajemo

| Ideja | Zašto ne |
| --- | --- |
| Zvezdice, complaint, „disputed“ javno | Krši proizvod |
| Auto-confirm, AI confirmed | Krši proizvod |
| Prodaja pozicije kao da je zaslužena | Featured sme, ali mora biti označeno |
| SSO/SCIM/SIEM sad | Standard za enterprise $50k+, ne za sadašnji ICP |
| Scraping LinkedIn / lažni klijenti | Zabranjeno |
| Keyword stuffing radi Googlea | Spam politika + prazan sajt |

---

## A. Da korisnik ima šta da pokaže (Clutch / Trustpilot / Credly)

Ovo je najbliže „zanimljivije“. Kod njih se plaća **punošenje dokaza**, ne API.

### A1. HTML potpis / widget za mejl
Trustpilot ima TrustBox za outgoing email. Kod: mali, statičan HTML snippet (logo zid ili jedna linija „Confirmed partners on Hansala“) za Gmail/Outlook potpis. Isti CSP/verify-line kao iframe. **Posao:** novi embed variant + copy u studio. **Rizik:** nizak. **Vrednost:** visoka (svaki mejl je distribucija).

### A2. Share to LinkedIn (sertifikat / partnerstvo)
Credly: Add to profile / Share to feed. Kod: dugme na `/c/{slug}/with/{partner}` koje otvara LinkedIn share sa naslovom i URL-om sertifikata (ne lažni badge na LinkedIn API-ju ako nema app). **Posao:** mali. **Vrednost:** ime firme + Hansala URL izlaze sa njihovog neta.

### A3. Tender / RFP pack (PDF ili ZIP)
D&B prodaje „fajl“. Mi imamo one-pager. Kod: jedan download „Commercial proof pack“: lista confirmed partnera (ime, slug, UUID, `confirmed_at`), reference, linkovi na sertifikate. Samo confirmed. **Posao:** srednji. **Vrednost:** procurement / NOMOS-klasa kupca.

### A4. CSV export partnera i referenci
G2/Clutch sales enablement. Kod: Workspace → Partners → Export CSV. Ista polja kao public API. **Posao:** mali. **Vrednost:** odmah korisno za ponude.

### A5. WordPress / Webflow / GTM one-click
Trustpilot: paste ili e-commerce plugin. Kod: 1) GTM snippet vodič, 2) Webflow embed instrukcija u studio, 3) WP plugin kasnije (odvojen repo). **Posao:** dokument + 1 stranica; plugin je veći. **Vrednost:** smanjuje „ne znam gde da nalepim iframe“.

### A6. Email widget u transactional mejlima korisnika
Ne naš signup mejl — njihov. To je A1. Ne mešati sa Resend template-ima.

---

## B. Da buyer ostane na Hansali (Clutch / G2)

Bez ovoga smo samo CMS za tuđi sajt.

### B1. Shortlist
Clutch: dodaj u shortlist, podeli sa kolegom. Kod: ulogovan buyer `saved_shortlist` (slugovi), share-link read-only. Samo claimed profili. **Posao:** srednji. **Vrednost:** razlog da se vrati.

### B2. Uporedi 2–3 firme (graf, ne ocena)
Ne „ko je bolji“. Tabela: broj confirmed partnera, ongoing refs, domain verified da/ne, assessment samo ako ≥3. **Posao:** srednji. **Rizik:** lako sklizne u ranking-as-judgement — copy mora biti činjeničan.

### B3. Watch / alert na relaciju
D&B: inquiry alerts. Kod: „javi mi ako se ova confirmed relacija skine s javnog“ ili „ako Vera dobije novog partnera“. Email. **Posao:** srednji. **Vrednost:** NOMOS-stilu (observed_at) + retention.

### B4. Javni compare URL
`/compare/vera/biovera` samo confirmed činjenice. SEO oprez: tanke stranice. Prvo internim shortlistom.

---

## C. Agent-native standard 2026 (pored onog što imamo)

Imamo REST, OpenAPI, `npx` MCP, `llms.txt`. Standard sada ide dalje: **hosted MCP**, discovery fajlovi, SDK.

### C1. Hosted MCP URL
`https://www.hansala.com/api/mcp` (public, keyless) pored `npx hansala-mcp-public`. Murat i Cursor ne instaliraju paket. **Posao:** srednji (Streamable HTTP). **Vrednost:** visoka za agente.

### C2. `/.well-known/mcp` + server-card.json
Kao agent.ai / GST. Kod: statički JSON koji kaže gde je MCP. **Posao:** mali.

### C3. `/.well-known/api-catalog` (RFC 9727)
Pokazivač na OpenAPI public + agent. **Posao:** mali.

### C4. Public npm SDK
`hansala` thin client: `verify(domain)`, `partners(slug)`. Wrapping public API. **Posao:** mali paket. **Vrednost:** developer-partneri.

### C5. Primer NOMOS evidence bundle
Stranica `/developers/evidence` : kanonska polja `id`, `confirmed_at`, šta heširati, da `generated_at` nije proof. **Posao:** dokument + 1 route. **Vrednost:** Murat + svaki agent posle njega.

### C6. Factual research tool (nije confirm)
Website vs Hansala graf, wording kao u pravilu: „nema zapisa“, nikad „laž“. `safe-fetch`, bez petlje po webu. **Posao:** veliki. **Rizik:** visok ako sklizne u sud.

---

## D. Integracije koje Clutch/Trustpilot naplaćuju

### D1. HubSpot / Salesforce: sync confirmed partnera
Ne lead-spam. Properties: partner name, slug, `confirmed_at`, Hansala URL. **Posao:** veliki (OAuth + mapping). **Vrednost:** sales team vidi fajl u CRM-u gde živi.

### D2. Slack već imamo
Ne prioritet. Možda: slash ` /hansala vera ` → proof. Mali add-on.

### D3. Calendly već imamo
Ne prioritet.

---

## E. Aktivacija i „aha“ u proizvodu

### E1. Bulk invite CSV
Clutch: dodaj klijente. Kod: CSV email+ime, cap 20/dan ostaje. **Posao:** srednji. **Vrednost:** prvi graf se puni.

### E2. In-app notification center
Inbox postoji za invite. Nedostaje: „BioVera je potvrdila“, „widget 12 pregleda“. Bell u headeru workspace. **Posao:** srednji.

### E3. Weekly digest (već delom Radar)
Za sve planove: „ova nedelja: 1 nova potvrda, 40 pregleda profila“. **Posao:** mali–srednji + cron.

### E4. Empty workspace koje vodi na jedan sledeći klik
Next-step strip postoji. Proveriti da li uvek vodi na: verify domain → 3 invite → nalepi widget. To je konverzija, ne feature-list.

---

## F. Enterprise table stakes — kasnije, ne sada

SSO (SAML/OIDC), SCIM, SIEM audit stream, DPA self-serve. WorkOS kaže da to zatvara dealove od ~$50k. Naš kupac još kupuje widget. **Ne u ovom ciklusu**, osim ako neko plaća implementaciju.

Audit log za Agent API već postoji. Customer-facing export „ko u mom nalogu je poslao invite“ je P2.

---

## G. SEO / ime firme — ostalo posle direktorijuma

Kod je urađen (`/companies`, ProfilePage `mainEntity.name`). Ostaje **operativa**: Search Console, link sa njihovog sajta, čist slug. To nije novi feature.

Eventualno u kodu: OG slika sa krupnim imenom (već postoji share image — proveriti da ime dominira). Ne prioritet nad A/B.

---

## Redosled ako odobravaš (samo predlog)

| # | Stavka | Zašto prvo | Veličina |
| --- | --- | --- | --- |
| 1 | A1 mejl potpis | Svaki mejl nosi Hansalu | S |
| 2 | A4 CSV export | Tender/ponuda sutra | S |
| 3 | C5 evidence stranica | Agent/NOMOS, već traže | S |
| 4 | C1+C2 hosted MCP | Standard 2026, Murat drugi transport | M |
| 5 | A2 LinkedIn share | Ime + URL sa tuđeg neta | S |
| 6 | A3 proof pack PDF | D&B-osećaj bez credit score | M |
| 7 | B1 shortlist | Buyer razlog da ostane | M |
| 8 | E1 bulk CSV invite | Punjenje grafa | M |
| 9 | A5 GTM/Webflow vodič | Manje trenja za widget | S |
| 10 | B3 watch/alert | Retention | M |
| 11 | C4 npm SDK | Developer-partneri | S |
| 12 | D1 HubSpot | Tek kad ima 20 Pro koji pitaju | L |

---

## Kako da odobriš

Napiši brojeve (npr. „radi 1, 2, 4“). Dok to ne stoji, **kod se ne dira** po ovom fajlu.

Ako nešto ovde trese pravilo proizvoda (B2 compare, C6 research AI), prvo recenica pravila, pa tek kod.
