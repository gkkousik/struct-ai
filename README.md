# Structura AI — Node.js + Express + MongoDB

This is a full rewrite of Structura AI's backend from Flask/SQLAlchemy to
**Node.js (Express) with MongoDB (Mongoose)**. All UI/UX, themes, diagram
types, and the PlantUML/Groq integration are preserved (and several bugs in
the original codebase are fixed — see below).

## What changed / what was fixed

1. **Broken `app.py`** — the original Flask file shipped with the `THEMES`
   dict cut off after one partial entry, and `DIAGRAM_PROMPTS` was referenced
   in `call_groq()` but **never defined anywhere**. Every `/generate` call
   would have crashed with a `NameError`. This rewrite ships a complete set
   of 9 themes and 10 diagram-type prompts in `utils/themes.js` and
   `utils/diagramCatalogue.js`.
2. **No real Node/MongoDB storage** — `storage_service/` only contained a
   `package.json`; there was no `server.js`, no models, nothing wired up.
   This is now a full Express app with Mongoose models for `User` and
   `Diagram`.
3. **Signup / login / history now persist properly in MongoDB:**
   - `models/User.js` — username/email (unique, indexed), bcrypt-hashed
     password (hashing happens automatically in a pre-save hook — plaintext
     passwords are never stored).
   - `models/Diagram.js` — one document per generated diagram, linked to the
     owning user via `ObjectId` ref, with the rendered PNG stored directly as
     `Buffer` in MongoDB (so history works identically on any host — no
     reliance on a local disk that can be wiped on redeploy).
   - **Sessions are stored in MongoDB too** (`connect-mongo`), so logins
     survive server restarts and work correctly even behind a load balancer
     with multiple instances — the original Flask app used Flask's
     client-side signed cookie sessions, which is fine, but doesn't give you
     server-side revocation or a session store you can inspect/manage.
4. **Security hardening:** bcrypt cost factor 12, `httpOnly`/`sameSite`
   cookies, secure cookies in production, and rate limiting on
   `/login`, `/signup`, and `/generate` to slow down brute-force/abuse.
5. **Diagram image serving** — images are streamed straight from MongoDB at
   `/diagram/:id/image` with an ownership check, instead of relying on
   filesystem paths.

## Project structure

```
server.js              Express app entry point
config/db.js           MongoDB connection
models/User.js         User schema + bcrypt hook
models/Diagram.js      Diagram/history schema
routes/auth.js         /login /signup /logout
routes/app.js          / /try /history /generate /api/history /diagram/:id/image
middleware/auth.js     loginRequired / apiLoginRequired guards
utils/plantuml.js      PlantUML text-encoding + rendering (port of the Python logic)
utils/groq.js          Groq AI client + PlantUML syntax cleanup
utils/themes.js        9 visual skinparam themes
utils/diagramCatalogue.js  10 diagram types + their Groq prompt templates
views/                 EJS templates (layout.ejs + page templates, via ejs-mate)
public/                Static assets (logo, etc.)
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and fill in:
   ```bash
   cp .env.example .env
   ```
   - `MONGODB_URI` — local Mongo (`mongodb://127.0.0.1:27017/structura`) or an
     Atlas connection string.
   - `SESSION_SECRET` — any long random string.
   - `GROQ_API_KEY` — from https://console.groq.com/keys (must start with `gsk_`).

3. **Run MongoDB** locally (or use MongoDB Atlas — no local install needed):
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   # or Docker
   docker run -d -p 27017:27017 --name structura-mongo mongo:7
   ```

4. **Start the server**
   ```bash
   npm start          # production
   npm run dev        # nodemon, auto-restart on changes
   ```

5. Visit `http://localhost:5000`.

## Deploying

Works on Render, Railway, Fly.io, or any Node host — just set the three
environment variables above (use MongoDB Atlas for the database in
production). The `Procfile` is already set to `web: node server.js`.

## API surface (unchanged route names from the original app)

| Method | Route                     | Auth | Description                        |
|--------|---------------------------|------|-------------------------------------|
| GET    | `/`                       | no   | Landing page                        |
| GET/POST | `/signup`               | no   | Create account                      |
| GET/POST | `/login`                | no   | Log in                              |
| GET    | `/logout`                 | yes  | Destroy session                     |
| GET    | `/try`                    | yes  | Diagram generator UI                |
| POST   | `/generate`               | yes  | Generate + save a diagram           |
| GET    | `/history`                | yes  | History page (HTML)                 |
| GET    | `/api/history`            | yes  | History as JSON                     |
| DELETE | `/api/history/:id`        | yes  | Delete a diagram                    |
| GET    | `/diagram/:id/image`      | yes  | Stream a diagram's PNG from MongoDB |
| GET    | `/health`                 | no   | Health check                        |
