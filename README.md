# NANCY AI — Face Match Backend

Cloud-sync backend for the face recognition part of NANCY AI. Same flow as before,
just moved off the phone's localStorage/IndexedDB and onto a server so faces
enrolled on one device are recognized on another:

```
Camera → face-api.js → 128-D descriptor → [this backend] → "Rahul" / "Unknown"
```

Everything else (camera, face-api.js models, UI) stays exactly as it is in
`index.html` — only the storage + matching step moves to the server.

## 1. Run it

```bash
npm install
npm start
```

Runs on `http://localhost:3000` by default. Uses a local SQLite file
(`nancy_faces.db`, created automatically) — no separate database server to set up.

Env vars (optional):
- `PORT` — server port (default 3000)
- `DB_PATH` — path to the SQLite file
- `FACE_MATCH_THRESHOLD` — match strictness (default `0.6`, same as the app)

To make it reachable from your phone (not just localhost), deploy it
(Render, Railway, a VPS, etc.) or run it on your PC and use your PC's
LAN IP in place of `localhost` while testing on the same Wi-Fi.

## 2. How faces are scoped ("cloud sync")

Every request needs an `X-Owner-Id` header — a UUID that identifies one
person's account. Generate it once on first app launch, save it in
localStorage, and send it on every request. Use the **same** ownerId on
all of that person's devices to sync their known faces across them.

```js
function getOwnerId(){
  let id = localStorage.getItem('nancy_owner_id');
  if(!id){ id = crypto.randomUUID(); localStorage.setItem('nancy_owner_id', id); }
  return id;
}
```

## 3. API

| Method | Path                  | Body                          | Returns                              |
|--------|-----------------------|--------------------------------|---------------------------------------|
| POST   | `/api/faces/enroll`   | `{ name, descriptor: number[128] }` | `{ ok, name, total }`            |
| POST   | `/api/faces/match`    | `{ descriptor: number[128] }`  | `{ name, dist }`                      |
| GET    | `/api/faces`          | —                               | `{ faces: [{name, enrolledAt}], total }` |
| GET    | `/api/faces/sync`     | —                               | `{ faces: [{name, descriptor}], total }` |
| DELETE | `/api/faces/:name`    | —                               | `{ ok }`                               |
| GET    | `/health`             | —                               | `{ ok, threshold }`                    |

All routes except `/health` require the `X-Owner-Id` header.

## 4. `index.html` — already integrated

The final `index.html` (in this same delivery) has this wired in already —
you don't need to hand-edit anything. Architecture used:

- **Matching stays on-device** (`matchFaceDescriptor` is unchanged, still
  synchronous, still runs every ~350ms against the local `knownFaces`
  array). This keeps the live camera overlay fast — no network round trip
  per video frame.
- **The source of truth is the cloud.** On startup, `loadKnownFaces()`
  pulls this owner's full descriptors from `GET /api/faces/sync` and
  mirrors them into `knownFaces` + `localStorage` (`vision_known_faces`).
  If the backend is unreachable, it silently keeps using whatever was
  last cached — the app still works offline.
- **Enroll/delete push to the cloud in the background.** `enrollFaceTrim`
  saves to the local mirror immediately (so it's usable instantly), then
  calls `POST /api/faces/enroll`. `deleteKnownFace` does the same with
  `DELETE /api/faces/:name`. Either failing just means "not synced to
  other devices yet" — it never blocks the local feature.
- Before shipping, set `window.NANCY_FACE_API_BASE` to your deployed
  backend URL (add a `<script>window.NANCY_FACE_API_BASE = "https://your-backend-url.com";</script>`
  before the face-recognition script block, or edit the `FACE_API_BASE`
  constant directly) — it currently defaults to `http://localhost:3000`
  for local testing.
- Same `ownerId` (a UUID auto-generated into `localStorage['nancy_owner_id']`
  on first run) on two devices = faces enrolled on one are recognized on
  the other after their next sync.
