<div align="center">

<img src="public/com_logo.png" alt="Structura AI Logo" width="100" />

# Structura AI

### AI-Powered UML Diagram Generator

**Turn a project title into a professional UML diagram in seconds.**
Powered by Groq LLaMA · Rendered by PlantUML · Stored in MongoDB Atlas

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=flat-square)](https://groq.com)
[![Deployed on Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)

### 🚀 [**Live Demo → structai-wptr.onrender.com**](https://structai-wptr.onrender.com/)

</div>

---

## What is Structura AI?

Structura AI is a full-stack web application that generates professional UML diagrams from a plain-text project description using a large language model. A user enters a project title, selects a diagram type and visual theme, and the system uses **Groq's LLaMA 3.3 70B** model to produce valid PlantUML syntax — which is then rendered into a PNG diagram by the PlantUML rendering API and saved to the user's history in MongoDB.

> ⚠️ The app is hosted on Render's free tier, so the first request after a period of inactivity may take 30–60 seconds while the instance cold-starts.

---

## Key Features

- **10 UML diagram types** — Class, Sequence, Use Case, Activity, Component, Deployment, State, Object, Timing, and ER diagrams
- **9 visual themes** — Classic Blue, Dark Neon, Sunset Orange, Forest Green, Royal Purple, Midnight Dark, Ocean Teal, Rose Gold, and Default
- **Persistent diagram history** — every generated diagram (including its rendered PNG) is stored in MongoDB and viewable/downloadable from the history page at any time
- **Secure authentication** — bcrypt password hashing (cost factor 12), server-side sessions persisted in MongoDB via `connect-mongo`, `httpOnly` + `sameSite` cookies, rate limiting on auth and generation endpoints
- **One-click PNG download** — download any diagram directly from the history page
- **Fully deployed** — live on Render with MongoDB Atlas as the cloud database

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Templating** | EJS + ejs-mate (layouts) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI / LLM** | Groq API — LLaMA 3.3 70B Versatile |
| **Diagram Rendering** | PlantUML public rendering API |
| **Auth** | bcryptjs + express-session + connect-mongo |
| **Styling** | Tailwind CSS (CDN) + custom glassmorphism UI |
| **Deployment** | Render (Node web service) |
| **Security** | express-rate-limit, proxy-aware secure cookies |

---

## Architecture Overview

```
Browser
  │
  ├── GET  /try          →  EJS template (generate.ejs)
  │
  └── POST /generate
          │
          ├── Groq API (LLaMA 3.3 70B)
          │     └── returns PlantUML syntax
          │
          ├── PlantUML Rendering API
          │     └── returns PNG (Buffer)
          │
          └── MongoDB Atlas
                ├── diagrams  collection  ← PNG + syntax + metadata saved
                ├── users     collection  ← bcrypt-hashed credentials
                └── sessions  collection  ← server-side session store
```

The PlantUML encoding is a JavaScript port of the standard zlib/base64 algorithm — raw-deflate compressed, then mapped through PlantUML's custom URL-safe alphabet — keeping the rendering pipeline dependency-free on the server side.

---

## Project Structure

```
├── server.js                  Express entry point, session config, middleware
├── config/
│   └── db.js                  MongoDB connection with reconnection handling
├── models/
│   ├── User.js                Mongoose schema — bcrypt pre-save hook
│   └── Diagram.js             Mongoose schema — PNG stored as Buffer
├── routes/
│   ├── auth.js                /login  /signup  /logout
│   └── app.js                 /  /try  /history  /generate  /api/history
├── middleware/
│   └── auth.js                loginRequired / apiLoginRequired guards
├── utils/
│   ├── groq.js                Groq API client + PlantUML syntax cleanup
│   ├── plantuml.js            PlantUML text encoder + PNG fetcher
│   ├── themes.js               9 skinparam theme definitions
│   └── diagramCatalogue.js    10 diagram types + LLM prompt templates
└── views/
    ├── layout.ejs              Base layout (navbar, footer, particle canvas)
    ├── index.ejs                Landing page
    ├── login.ejs                Login page
    ├── signup.ejs               Signup with live password strength meter
    ├── generate.ejs             Diagram generator UI
    └── history.ejs              Saved diagrams grid + detail modal
```

---

## Getting Started (Local Development)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your own values:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Local (`mongodb://127.0.0.1:27017/structura`) or MongoDB Atlas connection string. **Make sure the database name (e.g. `/structura`) is included in the path** — otherwise Mongoose silently defaults to a database called `test`. |
| `SESSION_SECRET` | Any long, random string. Generate one with `openssl rand -hex 32`. |
| `GROQ_API_KEY` | From [console.groq.com/keys](https://console.groq.com/keys) — must start with `gsk_`. |
| `PORT` | Local dev port (default `5000`). Not needed in production — Render sets this automatically. |
| `NODE_ENV` | `development` locally, `production` when deployed. |

### 3. Run MongoDB locally (or use Atlas — no local install needed)
```bash
# macOS (Homebrew)
brew services start mongodb-community

# or Docker
docker run -d -p 27017:27017 --name structura-mongo mongo:7
```

### 4. Start the server
```bash
npm start      # production mode
npm run dev    # nodemon — auto-restarts on file changes
```

### 5. Open it
```
http://localhost:5000
```

---

## Deploying to Render

The app is live at **https://structai-wptr.onrender.com/**, deployed as a Render Web Service. To deploy your own instance:

1. Push this repo to GitHub.
2. On Render: **New → Web Service** → connect the repo.
3. **Language:** Node
4. **Build Command:**
   ```
   npm install
   ```
5. **Start Command:**
   ```
   node server.js
   ```
   > Render does **not** read the `Procfile` automatically (that's a Heroku convention) — the Start Command must be set explicitly here or in a `render.yaml` blueprint.
6. **Environment Variables** — add `MONGODB_URI`, `SESSION_SECRET`, `GROQ_API_KEY`, and `NODE_ENV=production` (see table above).
7. **Health Check Path:** `/health`
8. Click **Deploy Web Service**.

Any Node-friendly host (Railway, Fly.io, etc.) works the same way — just set the same environment variables and use `node server.js` as the start command.

---

## What Makes This Interesting (Engineering Notes)

**PNG storage in MongoDB** — rendered diagrams are stored as `Buffer` directly in the `diagrams` collection rather than on the filesystem. This means history is portable across deployments, works correctly on ephemeral PaaS hosts like Render where the local filesystem is wiped on each deploy, and requires no object storage service (S3, GCS, etc.) to operate.

**LLM output sanitization** — the Groq response goes through a cleaning pipeline before being sent to PlantUML: markdown fences are stripped, `!theme` directives are removed (they cause rendering failures on the public server), double braces from LLM hallucinations are collapsed to single braces, and the skinparam theme block is injected at the correct position inside the `@startuml` block. If the LLM omits the `@startuml`/`@enduml` tags entirely, they are added automatically.

**Proxy-aware session security** — Render terminates TLS at its edge and forwards plain HTTP internally. Without `app.set('trust proxy', 1)` and `secure: 'auto'` on the session cookie, Express would silently refuse to send the session cookie over what it perceives as an insecure connection — causing login to silently fail even with correct credentials. Both are correctly configured.

**Safe history rendering** — diagram syntax and metadata shown on the history page are passed to the browser via HTML `data-*` attributes (which EJS auto-escapes), rather than being spliced into inline `onclick` JavaScript strings. This avoids the page breaking (or an XSS hole opening up) when AI-generated PlantUML syntax contains quotes, angle brackets, or other special characters.

**Rate limiting** — login/signup endpoints are limited to 30 requests per 15-minute window; the `/generate` endpoint is limited to 10 requests per minute, protecting both the Groq API quota and the MongoDB write budget.

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | Landing page |
| `GET/POST` | `/signup` | — | Create account |
| `GET/POST` | `/login` | — | Authenticate |
| `GET` | `/logout` | ✓ | Destroy session |
| `GET` | `/try` | ✓ | Generator UI |
| `POST` | `/generate` | ✓ | Generate + persist diagram |
| `GET` | `/history` | ✓ | History page |
| `GET` | `/api/history` | ✓ | History as JSON |
| `DELETE` | `/api/history/:id` | ✓ | Delete a diagram |
| `GET` | `/diagram/:id/image` | ✓ | Stream PNG from MongoDB |
| `GET` | `/health` | — | Health check |

---

<div align="center">

Built with Node.js · Express · MongoDB · Groq AI · PlantUML

**[structai-wptr.onrender.com](https://structai-wptr.onrender.com/)**

</div>
