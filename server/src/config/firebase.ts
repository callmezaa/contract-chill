import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This allows the server to verify Firebase ID tokens sent by the client.
// Note: When deployed to Cloud Run, it automatically uses the default service account credentials.
// For local development without a service account key, it will still verify tokens successfully 
// if initialized with the correct projectId.
admin.initializeApp({
  projectId: 'contract-chill',
});

export const auth = admin.auth();
