# Setup — Charge Arena

Charge Arena has a **Vue + PixiJS frontend** and a **PHP + MySQL backend**. The frontend
also runs in an **offline mode** (localStorage) without the backend, but global chat and
the global leaderboard need the server.

## Prerequisites

- **Node.js 22+** and **pnpm** (frontend)
- **PHP 8+** and **MySQL / MariaDB** for the backend (XAMPP is the simplest way to get both on Windows)

## 1. Frontend

```
pnpm install
pnpm dev        # start the dev server (http://localhost:5173)
pnpm build      # type-check and build for production
pnpm test       # run the unit tests
```

The dev server proxies `/api` to the PHP backend. Copy `.env.example` to `.env` and set
`VITE_API_PROXY_TARGET` if your backend is not at `http://localhost`.

## 2. Backend (PHP + MySQL)

1. **Configure the database connection.** Copy `api/config.example.php` to `api/config.php`
   and fill in your database name, user, and password. `config.php` is gitignored, so real
   credentials never reach the repository.
2. **Import the schema.**
   - **phpMyAdmin:** open `http://localhost/phpmyadmin` → **Import** → choose `db/schema.sql` → **Go**.
   - **CLI:**
     ```
     mysql -u root < db/schema.sql
     ```
   This creates the `charge_arena` database, its tables, and seed leaderboard/chat data.
3. **Serve the API.** With XAMPP, start **Apache** and make the `api/` folder reachable
   (for example under `htdocs`), or point the frontend proxy at your PHP host.

> Schema updates use `DROP` + recreate, so re-importing `db/schema.sql` resets the data
> and restores the seed bots.

### Wallet verification

Wallet verification needs **Phantom** installed and a browser that supports **Web Crypto
Ed25519** (recent Chrome/Edge). The signature is verified client-side; the server only
stores the `linked` status. In production, verify the Ed25519 signature on the server with
`sodium_crypto_sign_verify_detached`.

## 3. Check the API (optional)

Open an endpoint in a browser:

- `.../api/leaderboard.php` should return JSON like `{"ok":true,...}`.
- `{"ok":false,"error":"db_unavailable"}` means MySQL is not running or the credentials are wrong.

## Project structure

```
index.html              Vite entry
src/main.ts             app bootstrap (Vue + Pinia)
src/domain/             framework-free game rules + Vitest tests
src/engine/             PixiJS renderer and isometric math
src/bridge/             Vue <-> Pixi seam
src/ui/                 Vue menus, HUD, overlays
api/config.example.php  copy to config.php and fill in credentials
api/player.php          register / load / save / match
api/leaderboard.php     top 100 by rating
api/chat.php            post / fetch global chat
api/presence.php        per-map player position heartbeats
api/profile.php         wallet set/verify + one-time username change
api/farm.php            list owned pens (renders Farm Island)
api/king.php            King of the Arena (state + challenge)
db/schema.sql           schema + seed data
```
