import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; email?: string };
}

export interface DecodedToken {
  uid: string;
  email?: string;
  iat: number;
  exp: number;
}
