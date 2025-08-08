# Kingland: Royale

MVP monorepo with client (Phaser + Vite), server (Node/TS + WebSocket), and shared types.

## Quick start

Prerequisites: Node 18+

```bash
# from repo root
npm install
npm run dev
# server: ws://localhost:8080
# client: http://localhost:5173
```

Open the client, click Queue, then click on the board to deploy units. This is a barebones MVP loop.

## Packages

- `@kingland/shared`: Types and minimal card data
- `@kingland/server`: Authoritative WebSocket server with simple simulation
- `@kingland/client`: Phaser-rendered board and basic HUD

## Deploying Client to GitHub Pages

- Configure base path for Pages builds:
  - If your repo is `username/kingland-royale`, run:
    ```bash
    npm --workspace @kingland/client run build:gh
    ```
    This produces `packages/client/dist` with `base: /kingland-royale/`.
- Serve the built `dist` folder via GitHub Pages (e.g., gh-pages branch or `/docs`):
  - Option A: push `packages/client/dist` to `gh-pages` branch
  - Option B: copy to `packages/client/docs` and configure Pages to serve from `/docs`

WebSocket server
- Set Vite env `VITE_WS_URL` to your backend URL when building for Pages, e.g.:
  ```bash
  VITE_WS_URL=wss://your-domain.example/ws npm --workspace @kingland/client run build:gh
  ```
  The client will connect to that WebSocket in production.

## Hosting the Server

Option A: Render (recommended for quick test)
- Click “New Web Service” → “Use render.yaml”, select this repo
- After deploy, note your server URL, e.g. `https://kingland-royale-server.onrender.com`
- The WebSocket URL will be `wss://kingland-royale-server.onrender.com`
- Set GitHub Actions secret `VITE_WS_URL` to that value
- Re-run the Deploy Pages workflow

Option B: Docker
```bash
# build and run locally
docker build -t kingland-server -f server/Dockerfile .
docker run -p 8080:8080 kingland-server
# WebSocket: ws://localhost:8080 (use wss behind TLS in production)
```