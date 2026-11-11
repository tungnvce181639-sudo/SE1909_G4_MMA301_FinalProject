const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Initialize Firebase Admin SDK
 * Priority:
 * 1. FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)
 * 2. Local serviceAccountKey.json file in config directory
 * 3. Project ID fallback for local Firebase ID-token verification
 */
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
  } else {
    const localKeyPath = path.resolve(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(localKeyPath)) {
      serviceAccount = require(localKeyPath);
    }
  }

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id || 'smartcampus-market';
    admin.initializeApp({
      projectId,
      ...(serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : {}),
    });
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  throw error;
}

module.exports = admin;
