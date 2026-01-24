/**
 * Firebase Admin SDK Setup
 * 
 * Expects GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 * Or a serviceAccount.json file in the project root (gitignored)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

let db = null;

export function initFirebase() {
  if (getApps().length > 0) {
    db = getFirestore();
    return db;
  }

  // Try to load service account from file
  const serviceAccountPath = join(ROOT, 'serviceAccount.json');
  
  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('🔥 Firebase initialized with service account');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use default credentials from env
    initializeApp();
    console.log('🔥 Firebase initialized with default credentials');
  } else {
    console.warn('⚠️  No Firebase credentials found. Running in mock mode.');
    return null;
  }

  db = getFirestore();
  return db;
}

export function getDb() {
  if (!db) {
    initFirebase();
  }
  return db;
}

/**
 * Puzzle operations
 */
export async function getAllPuzzles() {
  const db = getDb();
  if (!db) return [];
  
  const snapshot = await db.collection('puzzles').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getPuzzle(id) {
  const db = getDb();
  if (!db) return null;
  
  const doc = await db.collection('puzzles').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function getRandomPuzzle() {
  const puzzles = await getAllPuzzles();
  if (puzzles.length === 0) return null;
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

export async function createPuzzle(data) {
  const db = getDb();
  if (!db) return null;
  
  const ref = await db.collection('puzzles').add({
    ...data,
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id, ...data };
}

export async function updatePuzzle(id, data) {
  const db = getDb();
  if (!db) return null;
  
  await db.collection('puzzles').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  return { id, ...data };
}

export async function deletePuzzle(id) {
  const db = getDb();
  if (!db) return false;
  
  await db.collection('puzzles').doc(id).delete();
  return true;
}

/**
 * Solve operations
 */
export async function recordSolve(data) {
  const db = getDb();
  if (!db) return null;
  
  const ref = await db.collection('solves').add({
    ...data,
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id, ...data };
}
