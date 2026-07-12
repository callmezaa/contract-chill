import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

admin.initializeApp({
  projectId: 'contract-chill',
  ...(serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : {}),
});

export const auth = admin.auth();
