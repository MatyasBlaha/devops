# Car Rental API

Semestralni prace z predmetu DevOps. Jednoduche REST API pro spravu aut v autopujcovne - zakladni CRUD operace, PostgreSQL databaze, kontejnerizace a deploy pres CI/CD do Kubernetes.

## Tech stack

- **Backend:** Node.js, Express
- **Databaze:** PostgreSQL, Prisma ORM
- **Kontejnerizace:** Docker, docker-compose
- **Orchestrace:** Kubernetes (Kustomize pro spravu konfiguraci)
- **CI/CD:** GitHub Actions
- **Registry:** ghcr.io

## Jak to funguje

Appka ma tri vrstvy - routes (HTTP), service (logika + validace), Prisma (databaze). Nic sloziteho, je to hlavne zaklad pro DevOps pipeline.

```
Client -> Express routes -> carService -> Prisma -> PostgreSQL
```

### API endpointy

| Metoda | URL | Co dela |
|--------|-----|---------|
| GET | /health | Health check |
| GET | /api/cars | Vypis vsech aut |
| GET | /api/cars/:id | Detail auta |
| POST | /api/cars | Pridani auta |
| PUT | /api/cars/:id | Uprava auta |

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
