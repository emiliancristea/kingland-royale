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