import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'card-arena-hyper-secret-key-998811';

export interface SessionPayload {
  playerId: string;
  roomId: string;
  username: string;
  isHost: boolean;
}

export function generateSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
