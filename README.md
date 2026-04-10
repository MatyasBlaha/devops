# Car Rental API

Semestralni prace z predmetu DevOps. Jednoduche REST API pro spravu aut v autopujcovne - zakladni CRUD operace, PostgreSQL databaze, kontejnerizace a deploy pres CI/CD do Kubernetes.

## Tech stack

- **Backend:** Node.js, Express
- **Databaze:** PostgreSQL, Prisma ORM
- **Kontejnerizace:** Docker, docker-compose
- **Orchestrace:** Kubernetes (Kustomize pro spravu konfiguraci)
- **CI/CD:** GitHub Actions
- **Registry:** ghcr.io

## API endpointy

| Metoda | URL | Co dela |
|--------|-----|---------|
| GET | /health | Health check |
| GET | /api/cars | Vypis vsech aut |
| GET | /api/cars/:id | Detail auta |
| POST | /api/cars | Pridani auta |
| PUT | /api/cars/:id | Uprava auta |
| GET | /api/customers | Vypis zakazniku |
| GET | /api/customers/:id | Detail zakaznika |
| POST | /api/customers | Vytvoreni zakaznika |
| PUT | /api/customers/:id | Uprava zakaznika |
| POST | /api/reservations | Vytvoreni rezervace |
| PATCH | /api/reservations/:id/confirm | Potvrzeni rezervace |
| PATCH | /api/reservations/:id/activate | Aktivace rezervace |
| PATCH | /api/reservations/:id/complete | Dokonceni rezervace |
| PATCH | /api/reservations/:id/cancel | Zruseni rezervace |
| PATCH | /api/reservations/:id/return | Vraceni auta |

---

## Domena a pravidla

Autopujcovna se tremi entitami:

```
Customer 1──N Reservation N──1 Car
```

- **Car** — znacka, model, rok, cena/den, kategorie (standard/premium), status (available/maintenance/retired)
- **Customer** — jmeno, email, telefon, cislo ridicskeho prukazu + datum vydani
- **Reservation** — datum od/do, stav, celkova cena, datum vraceni

### Business pravidla

1. **Validace RP** — ridicky prukaz musi byt vydany min. pred 1 rokem, datum nesmi byt v budoucnosti
2. **Vypocet ceny** — `pricePerDay * dny`, premium auta 1.5x, sleva 10 % pri 7+ dnech
3. **Kolize** — nelze rezervovat auto ktere uz ma rezervaci na prekryvajici se datumy
4. **Stavove prechody** — pending → confirmed → active → completed, zadne preskoceni
5. **Dostupnost** — nelze rezervovat auto ve stavu maintenance/retired
6. **Zruseni** — zrusit jde jen pending nebo confirmed
7. **Pozdni vraceni** — vracet jde jen aktivni rezervaci, za kazdy den navic prirazka 1.5x denni sazby

### Stavy rezervace

```
pending → confirmed → active → completed
  ↓           ↓
cancelled   cancelled
```

## Architektura

Tri vrstvy, kazda dela jednu vec:

```
HTTP request → Routes (src/routes/) → Services (src/services/) → Prisma → PostgreSQL
```

- **Routes** — parsovani requestu, HTTP kody, error handling
- **Services** — business logika, validace pravidel, stavovy automat
- **Prisma** — pristup k DB

Dulezite soubory:

- `reservationService.js` — vytvoreni rezervace, kolize, vraceni auta
- `priceCalculator.js` — vypocet ceny s pravidly
- `stateMachine.js` — povolene stavove prechody
- `validators.js` — spolecne validace (email, datum, vek RP)

---

## Testovaci strategie

Dva typy testu:

- **Unit testy** (`tests/unit/`) — testujou business logiku s mockovanou Prismou, bezi bez DB
- **Integracni testy** (`tests/integration/`) — testujou HTTP endpointy pres supertest, v CI bezi s realnym PostgreSQL

### Mocking

V unit testech mockujeme Prisma klienta (`jest.fn()`). Duvod — chceme testovat logiku, ne databazi. Diky tomu testy bezi rychle a nezavisi na stavu DB.

V integracnich testech se nemockuje nic — jde o overeni ze cely stack funguje dohromady.

### AAA pattern

Testy jsou psane jako Arrange-Act-Assert:

```javascript
it('should reject reservation for car in maintenance', async () => {
  // Arrange
  const car = createTestCar({ status: 'maintenance' });
  mockPrisma.car.findUnique.mockResolvedValue(car);

  // Act + Assert
  await expect(reservationService.create({ carId: 1, ... }))
    .rejects.toThrow('car is not available');
});
```

### Coverage

Mereni pres `jest --coverage`, threshold 70 % (lines, branches, functions, statements) v `jest.config.js`. Report se uploaduje jako artefakt v CI.

Co se netestuje:
- `server.js` — jen `app.listen()`, nema zadnou logiku
- Routes nemaji 100 % — nektere vetve (PUT endpointy) se pokryjou az integracnimi testy s DB v CI

### TDD postup

Domenova logika vznikala v cyklu red-green-refactor. Typicky postup na priklade reservation state machine:

1. **RED** — napsat test na stavovy prechod (`test: add reservation states`), test failuje protoze service jeste nema logiku
2. **GREEN** — napsat minimalní implementaci (`feat: add reservation states`), testy prochazi
3. **REFACTOR** — vycistit kod, extrahovat state machine do vlastniho modulu (`refactor: extract states reservation`)

Stejny postup u customer service (nejdriv testy na validaci RP, pak implementace, pak extrakce validatoru do `utils/validators.js`) a u price calculatoru.

Ne vsechny commity jsou striktne 1:1 red/green — nekdy jsem spojil test + implementaci do jednoho commitu kdyz to bylo male. Ale refaktory jsou vzdy samostatne.

---

## CI/CD

### CI (`ci.yml`)

Spousti se na push a PR do main. Kroky:

1. `npm ci` + `prisma generate`
2. ESLint
3. Unit + integracni testy (Jest, Supertest, postgres bezi jako service v CI)
4. Coverage report + JUnit XML jako artefakty
5. Docker build a push do ghcr.io (jen na main branchi)

### CD (`cd.yml`)

- **Staging** — automaticky po uspesnem CI na main, deploy do k3d clusteru + smoke test
- **Production** — manualne pres workflow_dispatch, stejny postup

## Docker

Dockerfile pouziva multi-stage build (build stage pro prisma generate, production stage s node:22-alpine). Bezi pod non-root userem, ma HEALTHCHECK.

```bash
# spusteni pres docker-compose (app + postgres)
cp .env.example .env
docker-compose up
```

API pak bezi na `http://localhost:3000`.

## Kubernetes

Manifesty v `k8s/`, rozdelene pres Kustomize na base a overlaye:

- `base/` — Deployment, Service, StatefulSet (postgres), ConfigMap, Secret, Ingress
- `staging/` — 1 replika, LOG_LEVEL=debug, namespace car-rental-staging
- `production/` — 2 repliky, vyssi resource limity, LOG_LEVEL=info, namespace car-rental-production

Obe prostredi maji vlastni ingress host, resource limity a secretGenerator.

### Proc Kustomize

Vybral jsem Kustomize protoze je primo v kubectl (nic navic instalovat), pracuje se s cistym YAML bez sablon a vsechno je verzovane v gitu — takze to splnuje IaC pristup.

## Testy

```bash
npx jest                    # vse
npx jest tests/unit         # unit testy
npx jest tests/integration  # integracni (potrebuje postgres)
npx jest --coverage         # s coverage reportem
```

V jest configu je nastaveny coverage threshold na 70% — kdyz nekdo prida kod bez testu a pokryti klesne, CI neprojde. Super featura navic.

## Secrets

- `secret.yml` v base je jen sablona (CHANGE_ME), skutecne hodnoty se tam nedavaji
- v CI se pouziva GITHUB_TOKEN pres GitHub Secrets
- lokalne `.env` soubor (v .gitignore), v repu je `.env.example` jako vzor

## Spusteni lokalne

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm start
```
