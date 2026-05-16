# In-House Goal-Setting-Tracking Portal

## Overview

This repository provides a starter structure for an in-house goal-setting and tracking portal with:

- **Postgres** for persistent relational data
- **Redis** for caching and queue/state support
- **API** backend service
- **Web** frontend service

## Setup

1. Copy environment template:

   ```bash
   cp .env.example .env
   ```

2. Review and update `.env` values as needed.
   - `API_IMAGE` and `WEB_IMAGE` must point to valid, pullable images (replace sample GHCR paths with your own registry tags or local image tags).
   - Replace all `CHANGE_ME` secret values before running outside local development.

3. Start all services:

   ```bash
   docker compose up
   ```

   Use `docker compose up --build` only when building local images during development.

4. Stop services:

   ```bash
   docker compose down
   ```

## Environment Variables

All required variables are documented in `.env.example`.

Key groups:

- App environment and ports
- Postgres connection settings
- Redis connection settings
- API and Web service runtime values

## Quickstart

After running `docker compose up`:

- API: `http://localhost:4000`
- Web: `http://localhost:3000`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

Use `architecture.png` as the submitted architecture diagram artifact.
