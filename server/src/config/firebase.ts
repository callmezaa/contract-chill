import * as admin from 'firebase-admin';
import { env } from './env';

const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

admin.initializeApp({
  projectId: 'contract-chill',
  ...(serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : {}),
});

export const auth = admin.auth();
