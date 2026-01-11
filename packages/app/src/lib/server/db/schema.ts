import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the NIP98 tokens table
export const nip98Tokens = pgTable('nip98_tokens', {
  id: serial('id').primaryKey(),                     // Unique identifier for each token
  tokenValue: text('token_value').notNull(),        // 64-character hexadecimal string
  nostrPubkey: text('nostr_pubkey').notNull(),                // 64-character user ID
  createdAt: timestamp('created_at').notNull().defaultNow(), // Timestamp for creation
  updatedAt: timestamp('updated_at').notNull().defaultNow(), // Timestamp for updates
});
