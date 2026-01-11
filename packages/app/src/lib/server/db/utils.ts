import { randomBytes } from "crypto";

export function generateRandomHex(count: number = 64): string {
  return randomBytes(count/2).toString('hex');
}

