// lib/auth.ts
import jwt, { SignOptions } from "jsonwebtoken";

export const COOKIE_NAME = "fp_token";

/**
 * Buat JWT
 */
export function signToken(payload: object, expiresIn: string = "7d") {
  const secret = process.env.JWT_SECRET as string;
  // cast ke SignOptions supaya TS gak protes untuk { expiresIn }
  return jwt.sign(payload as any, secret, { expiresIn } as SignOptions);
}

/**
 * Verifikasi JWT → return payload
 */
export function verifyToken<T = any>(token: string): T {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as T;
}
