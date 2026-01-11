import { eq } from "drizzle-orm";
import { db } from "./client";
import { nip98Tokens } from "./schema";

// Function to get a token by nostrPubkey
const getTokenByNostrPubkey = async (nostrPubkey: string) => {
  return await db.select().from(nip98Tokens).where(eq(nip98Tokens.nostrPubkey, nostrPubkey)).execute();
};

// Get token by tokenValue
const getTokenByTokenValue = async (tokenValue: string) => {
  return await db.select().from(nip98Tokens).where(eq(nip98Tokens.tokenValue, tokenValue)).execute();
};

// Function to create a new NIP98 token
const createNewToken = async (data: typeof nip98Tokens.$inferInsert) => {
  const result = await db.insert(nip98Tokens).values(data).returning();
  return result[0]; // Return the first (and expected only) inserted token
};

// Function to update a token by nostrPubkey
const updateToken = async (nostrPubkey: string, data: Partial<typeof nip98Tokens.$inferInsert>) => {
  return await db.update(nip98Tokens).set(data).where(eq(nip98Tokens.nostrPubkey, nostrPubkey)).execute();
};

// Function to delete a token by nostrPubkey (optional)
const deleteTokenByNostrPubkey = async (nostrPubkey: string) => {
  return await db.delete(nip98Tokens).where(eq(nip98Tokens.nostrPubkey, nostrPubkey)).execute();
};

export {
  createNewToken,
  getTokenByNostrPubkey,
  updateToken,
  deleteTokenByNostrPubkey,
  getTokenByTokenValue,
};
