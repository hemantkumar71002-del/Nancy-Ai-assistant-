// db.js — SQLite storage for face descriptors (no external DB server needed)
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'nancy_faces.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS faces (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id    TEXT NOT NULL,
    name        TEXT NOT NULL,
    descriptor  TEXT NOT NULL,   -- JSON array of 128 floats
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(owner_id, name)
  );
  CREATE INDEX IF NOT EXISTS idx_faces_owner ON faces(owner_id);
`);

const stmts = {
  upsert: db.prepare(`
    INSERT INTO faces (owner_id, name, descriptor, updated_at)
    VALUES (@owner_id, @name, @descriptor, datetime('now'))
    ON CONFLICT(owner_id, name)
    DO UPDATE SET descriptor = excluded.descriptor, updated_at = datetime('now')
  `),
  listByOwner: db.prepare(`
    SELECT name, descriptor, created_at, updated_at
    FROM faces WHERE owner_id = ?
    ORDER BY name COLLATE NOCASE
  `),
  deleteByName: db.prepare(`
    DELETE FROM faces WHERE owner_id = ? AND name = ?
  `),
  countByOwner: db.prepare(`SELECT COUNT(*) AS n FROM faces WHERE owner_id = ?`),
};

function enrollFace(ownerId, name, descriptor) {
  stmts.upsert.run({ owner_id: ownerId, name, descriptor: JSON.stringify(descriptor) });
}

function listFaces(ownerId) {
  return stmts.listByOwner.all(ownerId).map(row => ({
    name: row.name,
    descriptor: JSON.parse(row.descriptor),
    enrolledAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function deleteFace(ownerId, name) {
  const info = stmts.deleteByName.run(ownerId, name);
  return info.changes > 0;
}

function faceCount(ownerId) {
  return stmts.countByOwner.get(ownerId).n;
}

module.exports = { enrollFace, listFaces, deleteFace, faceCount };
