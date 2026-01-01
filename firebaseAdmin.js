const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
// You must set GOOGLE_APPLICATION_CREDENTIALS in .env pointing to your serviceAccountKey.json file
// OR set FIREBASE_SERVICE_ACCOUNT env var with the JSON content
// For this setup, we will look for 'serviceAccountKey.json' in the backend root or use env vars.

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        serviceAccount = require('./serviceAccountKey.json');
    }
} catch (error) {
    console.error("FIREBASE WARNING: No serviceAccountKey.json found or FIREBASE_SERVICE_ACCOUNT env var set.");
    console.error("Database operations will fail until valid credentials are provided.");
    // We don't crash here to allow successful server start for other non-db routes
}

if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized");
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

module.exports = { admin, db, auth };
