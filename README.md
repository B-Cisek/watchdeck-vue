# watchdeck-vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
bun lint
```

## Deploy (Docker + GHCR + Traefik)

Każdy push na `main` uruchamia `.github/workflows/deploy.yml`: CI (`ci.yml`: oxlint, ESLint, type-check, testy),
potem buduje obraz z `Dockerfile` (build Vite → statyczne pliki serwowane przez nginx na porcie 8080), wypycha go do
`ghcr.io/<owner>/watchdeck-vue:sha-<commit>` (oraz `:latest`), wgrywa `deploy/docker-compose.yml` na VPS
i robi `docker compose pull && up -d --wait`. Ręcznie można go odpalić z zakładki Actions (`workflow_dispatch`).

Frontend (np. `watchdeck.example.com`) i backend (`../watchdeck`, własna domena API) stoją na różnych domenach,
ale przeglądarka rozmawia tylko z domeną frontendu: aplikacja woła względne `/api`, a router Traefika
`watchdeck-vue-api` (`Host(DOMAIN) && PathPrefix(/api)`) przekazuje to do serwisu backendu `watchdeck@docker`.
Dzięki temu cookie sesji jest first-party i nie trzeba CORS. Backend bez zmian, jego domena API działa dalej.
`VITE_API_URL=/api` i `VITE_APP_ENV=production` są wbudowywane w obraz w czasie buildu (`Dockerfile`).

### Jednorazowy setup

**VPS** (użytkownik `deploy` i login do GHCR już istnieją, jeśli backend jest wdrożony)
```bash
sudo mkdir -p /opt/watchdeck-vue && sudo chown deploy: /opt/watchdeck-vue
# jako deploy:
nano /opt/watchdeck-vue/.env   # treść wg deploy/.env.example, DOMAIN = domena frontendu
```

**Sekrety repo** (Settings → Secrets and variables → Actions, environment `production`) — te same co w backendzie:
| Sekret | Wartość |
|---|---|
| `SSH_HOST` | IP/host VPS |
| `SSH_KEY` | prywatny klucz deploy |
| `SSH_KNOWN_HOSTS` | wynik `ssh-keyscan -p <port> <SSH_HOST>` |
| `SSH_USER` | opcjonalnie, domyślnie `deploy` |
| `SSH_PORT` | opcjonalnie, domyślnie `22` |

### Rollback
```bash
cd /opt/watchdeck-vue
echo IMAGE_TAG=sha-<poprzedni> > .deploy.env
docker compose --env-file .env --env-file .deploy.env up -d
```

### Lokalny test obrazu
```bash
docker build -t watchdeck-vue .
docker run --rm -p 8080:8080 watchdeck-vue   # http://localhost:8080 (bez backendu /api zwróci index.html)
```
