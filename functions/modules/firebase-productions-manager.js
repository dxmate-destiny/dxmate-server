const admin = require('firebase-admin');

// Initialize Firebase Admin.
admin.initializeApp();

// Create a new Realtime Database instance.
const rd = admin.database();

// Create a new Cloud Firestore instance.
const cf = admin.firestore();

module.exports = { rd, cf };