// server.js — NANCY AI face-match backend
// Mirrors the exact matching logic used client-side in index.html
// (euclideanDistance + FACE_MATCH_THRESHOLD = 0.6) so results stay identical.
//
//   Camera → face-api.js → 128-D descriptor → [THIS BACKEND] → "Rahul" / "Unknown"
//
const express = require('express');
const cors = require('cors');
const { enrollFace, listFaces, deleteFace, faceCount } = require('./db');

const PORT = process.env.PORT || 3000;
const DESCRIPTOR_LENGTH = 128; // face-api.js FaceRecognitionNet output size
const FACE_MATCH_THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD || 0.6); // lower = stricter

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---------- helpers ----------
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function isValidDescriptor(desc) {
  return Array.isArray(desc) && desc.length === DESCRIPTOR_LENGTH && desc.every(n => typeof n === 'number' && Number.isFinite(n));
}

function getOwnerId(req) {
  // The "owner id" scopes faces to one account so the same person's
  // enrolled faces sync across their devices, while staying separate
  // from everyone else's. The app should generate a UUID once on first
  // run, store it locally, and send it on every request.
  const id = req.header('x-owner-id') || req.body?.ownerId || req.query?.ownerId;
  return typeof id === 'string' && id.trim() ? id.trim() : null;
}

function requireOwnerId(req, res, next) {
  const ownerId = getOwnerId(req);
  if (!ownerId) {
    return res.status(400).json({ error: 'Missing owner id. Send header "X-Owner-Id: <uuid>".' });
  }
  req.ownerId = ownerId;
  next();
}

// ---------- routes ----------

app.get('/health', (req, res) => {
  res.json({ ok: true, threshold: FACE_MATCH_THRESHOLD });
});

// Enroll (or update) a named face
// POST /api/faces/enroll   body: { name, descriptor: number[128] }
app.post('/api/faces/enroll', requireOwnerId, (req, res) => {
  const { name, descriptor } = req.body || {};
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!isValidDescriptor(descriptor)) {
    return res.status(400).json({ error: `descriptor must be an array of ${DESCRIPTOR_LENGTH} numbers` });
  }
  enrollFace(req.ownerId, name.trim(), descriptor);
  res.json({ ok: true, name: name.trim(), total: faceCount(req.ownerId) });
});

// Match a live descriptor against this owner's known faces
// POST /api/faces/match   body: { descriptor: number[128] }
app.post('/api/faces/match', requireOwnerId, (req, res) => {
  const { descriptor } = req.body || {};
  if (!isValidDescriptor(descriptor)) {
    return res.status(400).json({ error: `descriptor must be an array of ${DESCRIPTOR_LENGTH} numbers` });
  }

  const known = listFaces(req.ownerId);
  if (!known.length) {
    return res.json({ name: 'Unknown', dist: null });
  }

  let best = null;
  let bestDist = Infinity;
  for (const f of known) {
    const d = euclideanDistance(descriptor, f.descriptor);
    if (d < bestDist) {
      bestDist = d;
      best = f.name;
    }
  }

  if (bestDist <= FACE_MATCH_THRESHOLD) {
    return res.json({ name: best, dist: bestDist });
  }
  res.json({ name: 'Unknown', dist: bestDist });
});

// List known faces (names only — for display lists; descriptors never leave the DB here)
// GET /api/faces
app.get('/api/faces', requireOwnerId, (req, res) => {
  const known = listFaces(req.ownerId).map(f => ({ name: f.name, enrolledAt: f.enrolledAt, updatedAt: f.updatedAt }));
  res.json({ faces: known, total: known.length });
});

// Full sync — names + descriptors, for the app to mirror locally so
// real-time matching runs on-device (no network round trip per video frame).
// GET /api/faces/sync
app.get('/api/faces/sync', requireOwnerId, (req, res) => {
  const known = listFaces(req.ownerId).map(f => ({ name: f.name, descriptor: f.descriptor }));
  res.json({ faces: known, total: known.length });
});

// Delete a known face by name
// DELETE /api/faces/:name
app.delete('/api/faces/:name', requireOwnerId, (req, res) => {
  const removed = deleteFace(req.ownerId, req.params.name);
  if (!removed) return res.status(404).json({ error: 'face not found' });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`NANCY face-match backend running on http://localhost:${PORT}`);
});
